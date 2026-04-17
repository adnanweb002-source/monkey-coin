import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const LANGUAGE_CODES = [
  "ab", "ace", "ach", "af", "sq", "alz", "am", "ar", "hy", "as", "awa", "ay", "az", "ban", "bm", "ba", "eu",
  "btx", "bts", "bbc", "be", "bem", "bn", "bew", "bho", "bik", "bs", "br", "bg", "bua", "yue", "ca", "ceb", "ny",
  "zh", "zh-TW", "cv", "co", "crh", "hr", "cs", "da", "dv", "din", "doi", "dov", "nl", "dz", "en", "eo", "et",
  "ee", "fj", "tl", "fi", "fr", "fr-CA", "fy", "ff", "gaa", "gl", "ka", "de", "el", "gn", "gu", "ht", "cnh",
  "ha", "haw", "he", "hil", "hi", "hmn", "hu", "hrx", "is", "ig", "ilo", "id", "ga", "it", "ja", "jv", "kn",
  "pam", "kk", "km", "cgg", "rw", "ktu", "gom", "ko", "kri", "ku", "ckb", "ky", "lo", "ltg", "la", "lv", "lij",
  "li", "ln", "lt", "lmo", "lg", "luo", "lb", "mk", "mai", "mak", "mg", "ms", "ms-Arab", "ml", "mt", "mi", "mr",
  "chm", "mni-Mtei", "min", "lus", "mn", "my", "nr", "new", "ne", "no", "nus", "oc", "or", "om", "pag", "pap",
  "ps", "fa", "pl", "pt", "pt-PT", "pa", "pa-Arab", "qu", "rom", "ro", "rn", "ru", "sm", "sg", "sa", "gd",
  "nso", "sr", "st", "crs", "shn", "sn", "scn", "szl", "sd", "si", "sk", "sl", "so", "es", "su", "sw", "ss",
  "sv", "tg", "ta", "tt", "te", "tet", "th", "ti", "ts", "tn", "tr", "tk", "ak", "uk", "ur", "ug", "uz", "vi",
  "cy", "xh", "yi", "yo", "yua", "zu",
] as const;

const RTL_LANGS = new Set([
  "ar",
  "ckb",
  "dv",
  "fa",
  "he",
  "ms-Arab",
  "pa-Arab",
  "ps",
  "sd",
  "ug",
  "ur",
  "yi",
]);

const displayEn = new Intl.DisplayNames(["en"], { type: "language" });

export const SUPPORTED_LANGUAGES = LANGUAGE_CODES.map((code) => {
  const labelCode = code.replace("_", "-");
  const english = displayEn.of(labelCode) || code;
  return {
    code,
    name: english,
    nativeName: english,
    dir: RTL_LANGS.has(code) ? "rtl" : "ltr",
  };
});

export type LanguageCode = (typeof LANGUAGE_CODES)[number];

const localeModules = import.meta.glob("../locales/*/common.json", {
  eager: true,
}) as Record<string, { default: Record<string, unknown> }>;

const resources: Record<string, { translation: Record<string, unknown> }> = {};
for (const [filePath, mod] of Object.entries(localeModules)) {
  const match = filePath.match(/\/locales\/([^/]+)\/common\.json$/);
  if (!match) continue;
  const code = match[1];
  resources[code] = { translation: mod.default };
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: [...LANGUAGE_CODES],
    nonExplicitSupportedLngs: true,
    debug: false,
    
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: "lang",
      caches: ["localStorage"],
    },
    
    // Safe fallback behavior
    returnNull: false,
    returnEmptyString: false,
    
    react: {
      useSuspense: false, // Prevent loading flicker
    },
  });

// Set document direction based on language
export const updateDocumentDirection = (lang: string) => {
  const normalized =
    SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.code ||
    lang.split("-")[0];
  const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === normalized);
  const dir = langConfig?.dir || "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = normalized;
};

// Initialize direction on load
updateDocumentDirection(i18n.language);

// Update direction when language changes
i18n.on('languageChanged', (lng) => {
  const normalized =
    SUPPORTED_LANGUAGES.find((l) => l.code === lng)?.code || lng.split("-")[0];
  if (normalized !== lng) {
    i18n.changeLanguage(normalized);
    return;
  }
  updateDocumentDirection(lng);
  localStorage.setItem("lang", lng);
});

export default i18n;
