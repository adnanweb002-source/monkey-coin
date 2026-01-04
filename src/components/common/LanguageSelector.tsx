import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps {
  compact?: boolean;
}

const LanguageSelector = ({ compact = false }: LanguageSelectorProps) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = SUPPORTED_LANGUAGES.find(
    (lang) => lang.code === i18n.language
  ) || SUPPORTED_LANGUAGES[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleLanguageChange = async (langCode: LanguageCode) => {
    if (langCode === i18n.language) {
      setIsOpen(false);
      return;
    }

    setIsChanging(true);
    try {
      await i18n.changeLanguage(langCode);
      // Language is automatically saved to localStorage by i18n config
    } catch (error) {
      console.error("Failed to change language:", error);
      // Fallback to English on error
      await i18n.changeLanguage("en");
    } finally {
      setIsChanging(false);
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        className={cn(
          "flex items-center gap-2 rounded-full bg-primary text-primary-foreground text-sm font-medium transition-colors hover:bg-primary/90 disabled:opacity-70",
          compact ? "px-3 py-1.5" : "px-4 py-1.5"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t("header.language")}
      >
        <Globe size={16} />
        {!compact && (
          <>
            <span>{currentLang.nativeName}</span>
            <ChevronDown 
              size={14} 
              className={cn(
                "transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </>
        )}
        {compact && (
          <ChevronDown 
            size={14} 
            className={cn(
              "transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div 
          className="absolute top-full right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
          role="listbox"
          aria-label="Select language"
        >
          <ul className="py-1">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <li key={lang.code}>
                <button
                  onClick={() => handleLanguageChange(lang.code)}
                  disabled={isChanging}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    lang.code === i18n.language 
                      ? "bg-accent/50 text-accent-foreground" 
                      : "text-popover-foreground"
                  )}
                  role="option"
                  aria-selected={lang.code === i18n.language}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{lang.nativeName}</span>
                    <span className="text-muted-foreground text-xs">
                      ({lang.name})
                    </span>
                  </div>
                  {lang.code === i18n.language && (
                    <Check size={16} className="text-primary" />
                  )}
                </button>
              </li>
            ))}
          </ul>
          
          {isChanging && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
