type PhotoCreditsProps = {
  variant?: "light" | "dark";
};

export default function PhotoCredits({ variant = "light" }: PhotoCreditsProps) {
  const classes =
    variant === "dark"
      ? "text-brand-paper/60 [&_a]:hover:text-brand-paper"
      : "text-brand-muted [&_a]:hover:text-brand-green";

  return (
    <p className={`text-center text-[10px] font-bold uppercase tracking-[0.05em] ${classes}`}>
      Pictures by:{" "}
      <a
        className="transition-colors"
        href="https://www.instagram.com/guenthers_picture_world/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Günther Niederreiter
      </a>
      ,{" "}
      <a
        className="transition-colors"
        href="https://kubatirnis.de/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Irnis Kubat
      </a>
      {" "}and others
    </p>
  );
}
