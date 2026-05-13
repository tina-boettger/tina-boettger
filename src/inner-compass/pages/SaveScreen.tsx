import { Copy, Download, Trash2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { toast } from "../hooks/useToast";
import { translations } from "../lib/translations";
import type { ReflectionData } from "../types/reflection";
import { Button } from "../components/ui/Button";
import { CelebrationConfetti } from "../components/CelebrationConfetti";
import { FoxCompanion } from "../components/FoxCompanion";
import { ScreenContainer } from "../components/ScreenContainer";

function openPrintableSummary(title: string, body: string) {
  const printable = window.open("", "_blank", "noopener,noreferrer,width=900,height=1100");
  if (!printable) return;
  printable.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Inter, Arial, sans-serif; padding: 32px; color: #1c1c1c; }
          h1 { font-family: "Playfair Display", Georgia, serif; }
          pre { white-space: pre-wrap; font-family: Inter, Arial, sans-serif; line-height: 1.7; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <pre>${body}</pre>
      </body>
    </html>
  `);
  printable.document.close();
  printable.focus();
  printable.print();
}

export function SaveScreen({ data, onRestart }: { data: ReflectionData; onRestart: () => void }) {
  const { language } = useLanguage();
  const t = translations[language];

  const formatDataAsText = () => {
    const categories = ["energy", "strengths", "impact", "recognition", "environment"] as const;
    return categories
      .map((category) => {
        const words = [...data[category].selected, data[category].custom].filter(Boolean);
        return `${t.review.labels[category].toUpperCase()}:\n${words.length ? words.join(", ") : "-"}`;
      })
      .join("\n\n");
  };

  const handleDownload = () => {
    openPrintableSummary(t.map.title, formatDataAsText());
    toast({ title: t.save.downloadedTitle, description: t.save.downloadedText });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatDataAsText());
      toast({ title: t.save.copiedTitle, description: t.save.copiedText });
    } catch {
      toast({ title: t.save.copyErrorTitle, description: t.save.copyErrorText, variant: "destructive" });
    }
  };

  const handleErase = () => {
    localStorage.removeItem("reflection-data");
    localStorage.removeItem("reflection-step");
    toast({ title: t.save.erasedTitle, description: t.save.erasedText });
    onRestart();
  };

  return (
    <ScreenContainer>
      <CelebrationConfetti />
      <FoxCompanion />
      <div className="w-full max-w-[640px] mx-auto animate-fade-in pb-8 px-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="block w-10 h-px bg-primary" />
          <span className="eyebrow">Saved</span>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">{t.save.title}</h1>
        <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-[520px]">{t.save.subtitle}</p>

        <div className="space-y-3 mb-10">
          <Button variant="outline" className="w-full justify-start py-6 text-sm normal-case tracking-normal font-medium" onClick={handleDownload}>
            <Download className="mr-2 h-5 w-5" strokeWidth={1.5} />
            {t.save.downloadButton}
          </Button>
          <Button variant="outline" className="w-full justify-start py-6 text-sm normal-case tracking-normal font-medium" onClick={handleCopy}>
            <Copy className="mr-2 h-5 w-5" strokeWidth={1.5} />
            {t.save.copyButton}
          </Button>
          <Button variant="outline" className="w-full justify-start py-6 text-sm normal-case tracking-normal font-medium border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive" onClick={handleErase}>
            <Trash2 className="mr-2 h-5 w-5" strokeWidth={1.5} />
            {t.save.eraseButton}
          </Button>
        </div>

        <Button onClick={onRestart} size="lg">
          {t.save.newReflectionButton}
        </Button>
      </div>
    </ScreenContainer>
  );
}
