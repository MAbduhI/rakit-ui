import { addons } from "storybook/manager-api";
import { rakitLight } from "./theme";

/*
 * Storybook's chrome — sidebar, toolbar, docs page — is pinned to the light
 * theme. It is read once at boot and cannot be swapped live, so tying it to the
 * OS made the UI unpredictable; a fixed, legible shell is the better trade.
 *
 * The toolbar's Theme control still switches the *component preview* (see
 * preview.ts + preview.css), which is the part that needs to be seen in both.
 *
 * To run dark chrome instead, swap this for `rakitDark` from ./theme.
 */
addons.setConfig({
  theme: rakitLight,
});
