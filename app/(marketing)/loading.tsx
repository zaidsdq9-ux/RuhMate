// Marketing/static routes are fully prerendered. A visible Suspense fallback
// here only flashes a "loading" block (and, in the streamed shell, can appear
// ahead of the page body). Returning null overrides the root loader with an
// empty fallback so the page content is the only thing that ever renders for
// these routes. Footer stays at the bottom (it lives in the layout, after main).
export default function MarketingLoading() {
  return null;
}
