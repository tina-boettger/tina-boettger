export function CornerDoodles() {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,rgba(45,90,39,0.08),transparent_40%),radial-gradient(circle_at_top_right,rgba(28,28,28,0.06),transparent_35%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(circle_at_bottom_right,rgba(45,90,39,0.08),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(28,28,28,0.05),transparent_35%)]" />
    </>
  );
}
