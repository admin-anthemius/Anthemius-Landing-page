/**
 * Icons for the five "what the plan adds" cards, in the same order as `adds.items` in the dictionaries.
 * One drawing style: 24px grid, 1.5 stroke, round caps. They are decoration (the card title says it), so
 * they are hidden from assistive technology. Strokes use currentColor; the tile sets the colour.
 */
const base = { viewBox: "0 0 24 24", "aria-hidden": true, focusable: false } as const;

export const ADDS_ICONS: React.ReactNode[] = [
  // clean exports: download
  <svg key="export" {...base}>
    <path d="M12 4v11M7.5 10.75 12 15.25l4.5-4.5M5 19.5h14" />
  </svg>,
  // priority support: speech bubble with a question mark
  <svg key="support" {...base}>
    <path d="M5 4.5h14a1 1 0 0 1 1 1V15a1 1 0 0 1-1 1h-8.5L6 19.5V16H5a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1Z" />
    <path d="M10.2 9.4a1.9 1.9 0 1 1 2.8 1.7c-.7.4-1 .8-1 1.5M12 14.2v.05" />
  </svg>,
  // team collaboration: two people
  <svg key="team" {...base}>
    <circle cx="9" cy="8.5" r="3" />
    <path d="M3.5 19.5c0-3.1 2.4-5 5.5-5s5.5 1.9 5.5 5M16.5 5.8a3 3 0 0 1 0 5.4M17.5 14.7c2 .4 3.5 2 3.5 4.8" />
  </svg>,
  // custom materials and furniture: armchair
  <svg key="furniture" {...base}>
    <path d="M7 11V8.5A3.5 3.5 0 0 1 10.5 5h3A3.5 3.5 0 0 1 17 8.5V11" />
    <path d="M4 12.5a2 2 0 0 1 4 0V15h8v-2.5a2 2 0 0 1 4 0V18H4v-5.5ZM6.5 18v2M17.5 18v2" />
  </svg>,
  // bill of materials: stacked layers
  <svg key="bom" {...base}>
    <path d="m12 4 8.5 4.25L12 12.5 3.5 8.25 12 4Z" />
    <path d="m3.5 12.25 8.5 4.25 8.5-4.25M3.5 16.25 12 20.5l8.5-4.25" />
  </svg>,
];
