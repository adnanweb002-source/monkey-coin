import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  APP_FEATURES,
  parseFeaturePath,
  type AppFeatureGroup,
} from "@/lib/appFeatures";

interface FeatureSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GROUP_ORDER: AppFeatureGroup[] = [
  "menu",
  "account",
  "legal",
  "admin",
];

export function FeatureSearchDialog({
  open,
  onOpenChange,
}: FeatureSearchDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!open) return;
    const stored = localStorage.getItem("userProfile");
    if (!stored) {
      setIsAdmin(false);
      return;
    }
    try {
      setIsAdmin(JSON.parse(stored)?.role === "ADMIN");
    } catch {
      setIsAdmin(false);
    }
  }, [open]);

  const items = useMemo(
    () => APP_FEATURES.filter((f) => !f.adminOnly || isAdmin),
    [isAdmin],
  );

  const byGroup = useMemo(() => {
    const m = new Map<AppFeatureGroup, typeof items>();
    for (const g of GROUP_ORDER) m.set(g, []);
    for (const f of items) {
      m.get(f.group)!.push(f);
    }
    return m;
  }, [items]);

  const runNavigate = (path: string) => {
    const { pathname, search } = parseFeaturePath(path);
    navigate({ pathname, search });
    onOpenChange(false);
  };

  const groupHeading = (g: AppFeatureGroup) => {
    switch (g) {
      case "menu":
        return t("featureSearch.groupMenu");
      case "admin":
        return t("featureSearch.groupAdmin");
      case "legal":
        return t("featureSearch.groupLegal");
      case "account":
        return t("featureSearch.groupAccount");
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder={t("featureSearch.placeholder")} />
      <CommandList>
        <CommandEmpty>{t("featureSearch.empty")}</CommandEmpty>
        {GROUP_ORDER.map((g) => {
          const list = byGroup.get(g)!;
          if (!list.length) return null;
          return (
            <CommandGroup key={g} heading={groupHeading(g)}>
              {list.map((f) => (
                <CommandItem
                  key={f.id}
                  value={`${f.id} ${t(f.labelKey)} ${(f.searchHints ?? []).join(" ")}`}
                  onSelect={() => runNavigate(f.path)}
                >
                  {t(f.labelKey)}
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
