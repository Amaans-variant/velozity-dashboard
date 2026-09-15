// the reference screenshot was a static green grid on black - this reworks
// that idea into a living backdrop: two grid layers at different scales
// (one slowly panning), two blurred aurora blobs drifting on independent
// timers, and a faint noise layer on top so large dark areas don't look
// flat/banded on OLED screens. entirely CSS-driven, no canvas, so it costs
// nothing on the main thread and never fights with real interactive content
export function GridBackdrop({ variant = 'default' }: { variant?: 'default' | 'hero' }) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-base-950" aria-hidden="true">
      <div className="absolute inset-0 kinetiq-grid animate-gridPan" />
      <div className="absolute inset-0 kinetiq-grid-fine opacity-60" />

      <div
        className="absolute -top-40 left-1/4 h-[520px] w-[520px] rounded-full bg-accent/20 blur-[140px] animate-drift"
      />
      <div
        className="absolute top-1/3 right-0 h-[420px] w-[420px] rounded-full bg-violet/20 blur-[140px] animate-driftSlow"
      />
      {variant === 'hero' && (
        <div className="absolute bottom-0 left-1/2 h-[380px] w-[700px] -translate-x-1/2 rounded-full bg-accent/10 blur-[160px] animate-drift" />
      )}

      <div className="absolute inset-0 noise-overlay" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-base-950" />
    </div>
  );
}
