import type { Preview } from "@storybook/react-vite";
import "./preview.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
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
