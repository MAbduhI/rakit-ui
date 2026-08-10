import { create } from "storybook/theming";

/*
 * Storybook's own chrome (sidebar, toolbar, docs) is React-rendered, not
 * Tailwind — it cannot read our CSS variables. These two themes restate the
 * palette from `src/styles.css` as literals so the manager UI matches the
 * components it is previewing. Keep the hexes in sync with the token file.
 */

const brand = {
  brandTitle: "Rakit UI",
  brandUrl: "/",
  fontBase: '"Inter", ui-sans-serif, system-ui, sans-serif',
  fontCode: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
};

export const rakitLight = create({
  ...brand,
  base: "light",

  colorPrimary: "#2e3a6e", // --color-accent
  colorSecondary: "#2e3a6e",

  appBg: "#f7f7f5", // --color-bg
  appContentBg: "#ffffff", // --color-surface
  appPreviewBg: "#ffffff",
  appBorderColor: "#e3e5e8", // --color-border
  appBorderRadius: 8, // --radius-md

  textColor: "#1a1d23", // --color-primary
  textMutedColor: "#5b6270", // --color-secondary
  textInverseColor: "#f7f7f5",

  barBg: "#f7f7f5",
  barTextColor: "#5b6270",
  barSelectedColor: "#2e3a6e",
  barHoverColor: "#8a6d3b", // --color-accent-secondary

  inputBg: "#ffffff",
  inputBorder: "#828995", // --color-input
  inputTextColor: "#1a1d23",
  inputBorderRadius: 8,

  booleanBg: "#eff1f3", // --color-surface-alt
  booleanSelectedBg: "#ffffff",
});

export const rakitDark = create({
  ...brand,
  base: "dark",

  // Same navy as light, but the manager needs a legible accent against #0d1117,
  // so the lifted ring colour stands in for interactive chrome.
  colorPrimary: "#6b7bc4", // --color-ring (dark)
  colorSecondary: "#6b7bc4",

  appBg: "#0d1117", // --color-bg
  appContentBg: "#151b26", // --color-surface
  appPreviewBg: "#151b26",
  appBorderColor: "#242c3b", // --color-border
  appBorderRadius: 8,

  textColor: "#ededef", // --color-primary
  textMutedColor: "#9aa1ac", // --color-secondary
  textInverseColor: "#1a1d23",

  barBg: "#0d1117",
  barTextColor: "#9aa1ac",
  barSelectedColor: "#6b7bc4",
  barHoverColor: "#b08d57", // --color-accent-secondary (dark)

  inputBg: "#151b26",
  inputBorder: "#626d80", // --color-input (dark)
  inputTextColor: "#ededef",
  inputBorderRadius: 8,

  booleanBg: "#1a2130", // --color-surface-alt (dark)
  booleanSelectedBg: "#242c3b",
});
