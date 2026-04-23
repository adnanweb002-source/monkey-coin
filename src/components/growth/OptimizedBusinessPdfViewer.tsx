import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import workerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

type Props = { fileUrl: string; className?: string };

function useContainerWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(800);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setW(Math.max(0, Math.floor(el.getBoundingClientRect().width)));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  return { ref, width: w };
}

function useRevealWhenNear(rootMargin = "500px 0px 200px 0px") {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            return;
          }
        }
      },
      { root: null, rootMargin, threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, visible };
}

function LazyPdfPage({
  pageNumber,
  width,
  className,
}: {
  pageNumber: number;
  width: number;
  className?: string;
}) {
  const { ref, visible } = useRevealWhenNear();

  return (
    <div
      ref={ref}
      className="flex w-full min-h-[50vh] items-start justify-center bg-muted/10 py-2"
    >
      {visible ? (
        <Page
          className={cn("max-w-full shadow-sm", className)}
          pageNumber={pageNumber}
          width={width}
          renderTextLayer={false}
          renderAnnotationLayer
        />
      ) : (
        <div
          className="w-full min-h-[45vh] animate-pulse rounded-sm bg-muted/30"
          aria-hidden
        />
      )}
    </div>
  );
}

const pdfjsRuntimeVersion = pdfjs.version ?? "4.10.38";

/**
 * `Document` with `url` alone sometimes never triggers a visible fetch; loading bytes
 * ourselves guarantees a `fetch` in DevTools and matches the same origin as the app.
 */
function usePdfBytes(relativeFileUrl: string) {
  const [bytes, setBytes] = useState<ArrayBuffer | null>(null);
  const [loadPct, setLoadPct] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState<Error | null>(null);

  const toFetchUrl = useMemo(() => {
    if (typeof window === "undefined") return relativeFileUrl;
    if (
      relativeFileUrl.startsWith("http://") ||
      relativeFileUrl.startsWith("https://")
    ) {
      return relativeFileUrl;
    }
    if (relativeFileUrl.startsWith("/")) {
      return new URL(relativeFileUrl, window.location.origin).href;
    }
    return new URL(relativeFileUrl, window.location.href).href;
  }, [relativeFileUrl]);

  useEffect(() => {
    setBytes(null);
    setLoadPct(0);
    setFetchError(null);
    const ac = new AbortController();

    (async () => {
      try {
        const res = await fetch(toFetchUrl, {
          signal: ac.signal,
          credentials: "same-origin",
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }
        const cl = res.headers.get("content-length");
        const total = cl ? parseInt(cl, 10) : 0;
        const body = res.body;
        if (body && total > 0) {
          const reader = body.getReader();
          const chunks: Uint8Array[] = [];
          let loaded = 0;
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              chunks.push(value);
              loaded += value.length;
              setLoadPct(Math.min(100, Math.round((100 * loaded) / total)));
            }
          }
          const u8 = new Uint8Array(loaded);
          let pos = 0;
          for (const c of chunks) {
            u8.set(c, pos);
            pos += c.length;
          }
          setBytes(u8.buffer);
        } else {
          setLoadPct(50);
          const buf = await res.arrayBuffer();
          if (buf.byteLength < 8) {
            throw new Error("The file is empty or not a PDF.");
          }
          setBytes(buf);
        }
        setLoadPct(100);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setFetchError(e instanceof Error ? e : new Error(String(e)));
        setLoadPct(null);
      }
    })();

    return () => ac.abort();
  }, [toFetchUrl]);

  return { bytes, loadPct, fetchError };
}

const pdfDocumentOptions = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsRuntimeVersion}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsRuntimeVersion}/standard_fonts/`,
} as const;

export function OptimizedBusinessPdfViewer({ fileUrl, className }: Props) {
  const { t } = useTranslation();
  const { bytes, loadPct, fetchError } = usePdfBytes(fileUrl);
  const [numPages, setNumPages] = useState(0);
  const [parseErr, setParseErr] = useState<Error | null>(null);
  const { ref: sizeRef, width: containerW } = useContainerWidth();
  const pageW = useMemo(
    () => Math.max(200, containerW - 4),
    [containerW]
  );

  useEffect(() => {
    setNumPages(0);
    setParseErr(null);
  }, [fileUrl]);

  const showError = fetchError ?? parseErr;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="text-xs text-muted-foreground sm:text-sm">
        {t("growthTools.pdfPagesScroll")}
      </p>
      {loadPct !== null && loadPct < 100 && !fetchError && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">
            {t("growthTools.pdfProgress", { pct: loadPct })}
          </p>
          <Progress value={loadPct} className="h-2" />
        </div>
      )}

      <div
        ref={sizeRef}
        className="max-h-[min(85vh,1200px)] w-full overflow-y-auto overflow-x-hidden rounded-md border border-border/80 bg-background"
      >
        {showError ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-1 p-4 text-center text-sm text-destructive">
            <p>{t("growthTools.pdfError")}</p>
            <p className="text-xs text-muted-foreground break-all max-w-prose">
              {showError.message}
            </p>
          </div>
        ) : !bytes ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {t("growthTools.pdfPreparing")}
            </p>
          </div>
        ) : (
          <Document
            key={fileUrl}
            file={bytes}
            options={pdfDocumentOptions}
            onLoadSuccess={({ numPages: n }) => {
              setNumPages(n);
              setParseErr(null);
            }}
            onLoadError={(e) => {
              setParseErr(e instanceof Error ? e : new Error(String(e)));
            }}
            loading={
              <div className="flex min-h-[40vh] items-center justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            {numPages > 0 &&
              Array.from({ length: numPages }, (_, i) => (
                <LazyPdfPage
                  key={i + 1}
                  pageNumber={i + 1}
                  width={pageW}
                />
              ))}
          </Document>
        )}
      </div>
    </div>
  );
}
