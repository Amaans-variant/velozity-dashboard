// pure-CSS animated grid, mounted once in App.tsx behind the whole router.
// zero JS cost, GPU-cheap (just background-position + opacity), matches
// the dark green terminal-grid reference the user provided.
export function GridBackdrop() {
  return (
    <div className="grid-backdrop" aria-hidden="true">
      <div className="grid-scanline" />
    </div>
  );
}
