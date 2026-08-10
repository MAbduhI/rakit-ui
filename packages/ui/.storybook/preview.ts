import type { Preview } from "@storybook/react-vite";
import { rakitLight } from "./theme";
import "./preview.css";

const preview: Preview = {
  /*
   * Toolbar switch for the preview iframe. It writes the same `data-theme`
   * attribute that `useTheme()` writes at runtime, so what you see here is
   * exactly what an app gets — no Storybook-only styling path.
   */
  globalTypes: {
    theme: {
      description: "Rakit UI color theme",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: [
          { value: "light", icon: "sun", title: "Light" },
          { value: "dark", icon: "moon", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme === "dark" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", theme);
      return Story();
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Tokens paint the canvas via `body` in styles.css; the backgrounds addon
    // would fight with them.
    backgrounds: { disable: true },
    // Matches the manager shell in manager.ts. Story blocks inside a docs page
    // still follow the toolbar — preview.css hands those surfaces to the tokens.
    docs: {
      theme: rakitLight,
    },
    options: {
      // The sidebar sorts alphabetically by default, which would put Page before
      // Template. Pin the atomic-design tiers to their real order instead.
      storySort: {
        order: ["Docs", "Components", ["Atom", "Molecule", "Organism", "Template", "Page"]],
      },
    },
  },
};

export default preview;
