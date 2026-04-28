import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Loader2, RefreshCw } from "lucide-react";
import api, { getErrorMessage } from "@/lib/api";
import {
  AdminGrowthResponse,
  buildGrowthQuery,
  normalizeGrowthSeries,
  type GrowthChartPoint,
} from "@/lib/adminGrowth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";

const CHART_PALETTES: { light: string; dark: string }[] = [
  { light: "hsl(142 71% 38%)", dark: "hsl(142 60% 52%)" },
  { light: "hsl(217 91% 48%)", dark: "hsl(213 94% 68%)" },
  { light: "hsl(271 71% 48%)", dark: "hsl(270 80% 65%)" },
];

function formatMoney(n: number) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

function axisTick(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

const chartMargin = { top: 8, right: 12, left: 4, bottom: 0 };

interface GrowthAreaBlockProps {
  title: string;
  description?: string;
  points: GrowthChartPoint[];
  paletteIndex: number;
  chartId: string;
  valueLabel: string;
  emptyLabel: string;
}

function GrowthAreaBlock({
  title,
  description,
  points,
  paletteIndex,
  chartId,
  valueLabel,
  emptyLabel,
}: GrowthAreaBlockProps) {
  const data = useMemo(
    () => points.map((p) => ({ label: p.label, value: p.value })),
    [points],
  );

  const palette = CHART_PALETTES[paletteIndex % CHART_PALETTES.length]!;

  const config = useMemo(
    () =>
      ({
        value: {
          label: valueLabel,
          theme: palette,
        },
      }) satisfies ChartConfig,
    [palette, valueLabel],
  );

  if (!data.length) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-12 text-center">{emptyLabel}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={config} className="h-[min(360px,55vh)] w-full aspect-auto">
          <AreaChart data={data} margin={chartMargin} accessibilityLayer key={`${chartId}-${data.length}`}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={16}
              interval="preserveStartEnd"
              tick={{ fontSize: 11 }}
              height={48}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={56}
              tickFormatter={axisTick}
              domain={[0, "auto"]}
            />
            <ChartTooltip
              cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const v = payload[0]?.value;
                return (
                  <div className="grid min-w-[9rem] items-start gap-1 rounded-lg border border-border/60 bg-background/95 px-2.5 py-1.5 text-xs shadow-md backdrop-blur">
                    <span className="font-medium">{String(label ?? "")}</span>
                    <span className="font-mono tabular-nums text-muted-foreground">
                      {typeof v === "number" ? formatMoney(v) : formatMoney(Number(v))}
                    </span>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={`var(--color-value)`}
              fill={`var(--color-value)`}
              fillOpacity={0.28}
              strokeWidth={2}
              dot={data.length <= 36 ? { r: 3, strokeWidth: 2, fill: `var(--color-value)` } : false}
              activeDot={{ r: 4 }}
              isAnimationActive={data.length <= 96}
              connectNulls
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export interface AdminGrowthMetricsPageProps {
  apiPath: string;
  pageTitleKey: string;
}

const GROWTH_QUERY_KEY = "admin-growth-metric";

export function AdminGrowthMetricsPage({ apiPath, pageTitleKey }: AdminGrowthMetricsPageProps) {
  const { t } = useTranslation();
  const [applied, setApplied] = useState({ days: "", weeks: "", months: "" });
  const [inputs, setInputs] = useState({ days: "", weeks: "", months: "" });

  const queryString = useMemo(
    () => buildGrowthQuery({ days: applied.days, weeks: applied.weeks, months: applied.months }),
    [applied.days, applied.weeks, applied.months],
  );

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: [GROWTH_QUERY_KEY, apiPath, queryString],
    queryFn: async () => {
      const res = await api.get<AdminGrowthResponse>(
        `${apiPath}${queryString}`,
        { timeout: 60000 },
      );
      return res.data;
    },
  });

  useEffect(() => {
    if (!data?.lookback) return;
    const usingServerDefaults =
      applied.days === "" && applied.weeks === "" && applied.months === "";
    if (!usingServerDefaults) return;
    setInputs({
      days: String(data.lookback.days),
      weeks: String(data.lookback.weeks),
      months: String(data.lookback.months),
    });
  }, [
    data?.lookback?.days,
    data?.lookback?.weeks,
    data?.lookback?.months,
    applied.days,
    applied.weeks,
    applied.months,
  ]);

  const tz = data?.timezone ?? "";

  const dod = useMemo(
    () => normalizeGrowthSeries(data?.series?.dod, tz),
    [data?.series?.dod, tz],
  );
  const wow = useMemo(
    () => normalizeGrowthSeries(data?.series?.wow, tz),
    [data?.series?.wow, tz],
  );
  const mom = useMemo(
    () => normalizeGrowthSeries(data?.series?.mom, tz),
    [data?.series?.mom, tz],
  );

  const applyFilters = () => {
    setApplied({
      days: inputs.days.trim(),
      weeks: inputs.weeks.trim(),
      months: inputs.months.trim(),
    });
  };

  const resetToServerDefaults = () => {
    setApplied({ days: "", weeks: "", months: "" });
    setInputs({ days: "", weeks: "", months: "" });
  };

  const errMsg = error ? getErrorMessage(error) : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t(pageTitleKey)}</h1>
        <p className="text-muted-foreground mt-1">{t("adminGrowth.subtitle")}</p>
      </div>

      {errMsg ? (
        <Alert variant="destructive">
          <AlertTitle>{t("adminGrowth.loadFailed")}</AlertTitle>
          <AlertDescription>{errMsg}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("adminGrowth.filtersTitle")}</CardTitle>
          <CardDescription>{t("adminGrowth.filtersHint")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="growth-days">{t("adminGrowth.lookbackDays")}</Label>
              <Input
                id="growth-days"
                inputMode="numeric"
                placeholder={t("adminGrowth.placeholderOptional")}
                value={inputs.days}
                onChange={(e) => setInputs((s) => ({ ...s, days: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="growth-weeks">{t("adminGrowth.lookbackWeeks")}</Label>
              <Input
                id="growth-weeks"
                inputMode="numeric"
                placeholder={t("adminGrowth.placeholderOptional")}
                value={inputs.weeks}
                onChange={(e) => setInputs((s) => ({ ...s, weeks: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="growth-months">{t("adminGrowth.lookbackMonths")}</Label>
              <Input
                id="growth-months"
                inputMode="numeric"
                placeholder={t("adminGrowth.placeholderOptional")}
                value={inputs.months}
                onChange={(e) => setInputs((s) => ({ ...s, months: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={applyFilters} disabled={isFetching}>
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t("adminGrowth.apply")}
            </Button>
            <Button type="button" variant="outline" onClick={resetToServerDefaults}>
              {t("adminGrowth.resetDefaults")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              title={t("adminGrowth.refresh")}
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
          </div>
          {data?.timezone ? (
            <p className="text-xs text-muted-foreground">
              {t("adminGrowth.timezoneNote", { tz: data.timezone })}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[300px] w-full rounded-lg" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </div>
      ) : (
        <div className="space-y-6">
          <GrowthAreaBlock
            title={t("adminGrowth.chartDaily")}
            description={t("adminGrowth.chartDailyDesc", { count: data?.lookback.days ?? "—" })}
            points={dod}
            paletteIndex={0}
            chartId="dod"
            valueLabel={t("adminGrowth.amount")}
            emptyLabel={t("adminGrowth.emptySeries")}
          />
          <GrowthAreaBlock
            title={t("adminGrowth.chartWeekly")}
            description={t("adminGrowth.chartWeeklyDesc", {
              count: data?.lookback.weeks ?? "—",
            })}
            points={wow}
            paletteIndex={1}
            chartId="wow"
            valueLabel={t("adminGrowth.amount")}
            emptyLabel={t("adminGrowth.emptySeries")}
          />
          <GrowthAreaBlock
            title={t("adminGrowth.chartMonthly")}
            description={t("adminGrowth.chartMonthlyDesc", {
              count: data?.lookback.months ?? "—",
            })}
            points={mom}
            paletteIndex={2}
            chartId="mom"
            valueLabel={t("adminGrowth.amount")}
            emptyLabel={t("adminGrowth.emptySeries")}
          />
        </div>
      )}
    </div>
  );
}
