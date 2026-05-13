import { Button } from "./ui/Button";
import { useLanguage } from "../contexts/LanguageContext";

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  const targetLang = language === "en" ? "de" : "en";

  return (
    <Button
      onClick={toggleLanguage}
      variant="ghost"
      size="sm"
      className="fixed top-4 left-4 z-50 rounded-xl w-14 h-14 p-0 hover:bg-accent/10"
      aria-label={`Switch to ${targetLang === "de" ? "German" : "English"}`}
    >
      <div className="flex flex-col items-center gap-0.5">
        {targetLang === "de" ? (
          <div className="w-9 h-6 rounded-sm overflow-hidden flex flex-col shadow-sm border border-border/30">
            <div className="flex-1 bg-black" />
            <div className="flex-1 bg-red-600" />
            <div className="flex-1 bg-yellow-400" />
          </div>
        ) : (
          <div className="w-9 h-6 rounded-sm overflow-hidden shadow-sm border border-border/30 relative bg-blue-800">
            <div className="absolute top-1/2 left-0 right-0 h-[3px] -translate-y-1/2 bg-white" />
            <div className="absolute left-[35%] top-0 bottom-0 w-[3px] -translate-x-1/2 bg-white" />
            <div className="absolute top-1/2 left-0 right-0 h-[1.5px] -translate-y-1/2 bg-red-600" />
            <div className="absolute left-[35%] top-0 bottom-0 w-[1.5px] -translate-x-1/2 bg-red-600" />
          </div>
        )}
        <span className="text-[10px] font-bold text-foreground/60 uppercase">{targetLang}</span>
      </div>
    </Button>
  );
}
