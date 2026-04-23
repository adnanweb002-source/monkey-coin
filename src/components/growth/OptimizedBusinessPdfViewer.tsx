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
const getDocumentOptions = () =>
  ({
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsRuntimeVersion}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsRuntimeVersion}/standard_fonts/`,
    disableRange: false,
    disableStream: false,
    rangeChunkSize: 128 * 1024,
  }) as const;

export function OptimizedBusinessPdfViewer({ fileUrl, className }: Props) {
  const { t } = useTranslation();
  const [numPages, setNumPages] = useState(0);
  const [loadPct, setLoadPct] = useState<number | null>(null);
  const [err, setErr] = useState<Error | null>(null);
  const { ref: sizeRef, width: containerW } = useContainerWidth();
  const documentOptions = useMemo(() => getDocumentOptions(), []);

  const pageW = useMemo(
    () => Math.max(200, containerW - 4),
    [containerW]
  );

  const onLoadProgress = useCallback(
    ({ loaded, total }: { loaded: number; total: number }) => {
      if (total > 0) setLoadPct(Math.round((100 * loaded) / total));
      else setLoadPct(null);
    },
    []
  );

  useEffect(() => {
    setNumPages(0);
    setErr(null);
    setLoadPct(null);
  }, [fileUrl]);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="text-xs text-muted-foreground sm:text-sm">
        {t("growthTools.pdfPagesScroll")}
      </p>
      <div
        ref={sizeRef}
        className="max-h-[min(85vh,1200px)] w-full overflow-y-auto overflow-x-hidden rounded-md border border-border/80 bg-background"
      >
        {err ? (
          <div className="flex min-h-[40vh] items-center justify-center p-4 text-center text-sm text-destructive">
            {t("growthTools.pdfError")}
          </div>
        ) : (
          <Document
            key={fileUrl}
            file={fileUrl}
            options={documentOptions}
            onLoadSuccess={({ numPages: n }) => {
              setNumPages(n);
              setLoadPct(100);
              setErr(null);
            }}
            onLoadProgress={onLoadProgress}
            onLoadError={(e) => {
              setErr(e);
              setLoadPct(null);
            }}
            loading={
              <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  {t("growthTools.pdfPreparing")}
                </p>
                {loadPct !== null && loadPct < 100 && (
                  <div className="w-full max-w-sm space-y-1.5">
                    <Progress value={loadPct} className="h-2" />
                    <p className="text-center text-xs text-muted-foreground">
                      {t("growthTools.pdfProgress", { pct: loadPct })}
                    </p>
                  </div>
                )}
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
