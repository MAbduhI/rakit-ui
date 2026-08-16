import type { Meta, StoryObj } from "@storybook/react-vite";
import Maps from "./map-component";
import type { CustomTileLayer, MarkerInput, PolylineInput } from "./map-component.types";

const meta = {
  title: "Components/Organism/Maps",
  component: Maps,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    center: [-6.2088, 106.8456],
    zoom: 12,
    className: "h-[540px] w-full",
  },
  argTypes: {
    tileLayer: {
      control: "select",
      options: [
        "osm",
        "google-roadmap",
        "google-satellite",
        "google-hybrid",
        "google-terrain",
        "opentopo",
        "carto-dark",
      ],
    },
    zoom: {
      control: { type: "range", min: 3, max: 18, step: 1 },
    },
  },
} satisfies Meta<typeof Maps>;

export default meta;
type Story = StoryObj<typeof meta>;

/* Jakarta — a depot, two drops, and the route between them. */
const depot: [number, number] = [-6.2088, 106.8456];
const dropA: [number, number] = [-6.1751, 106.8272];
const dropB: [number, number] = [-6.2297, 106.8295];

const markers: Array<MarkerInput> = [
  {
    id: "depot",
    coordinates: depot,
    icon: "building-warehouse",
    iconOptions: { size: 34, color: "#2e3a6e" },
    legend: { label: "Depot — Jakarta Pusat", show: true },
    popup: { content: "<strong>Depot</strong><br/>Open 06:00 – 22:00" },
  },
  {
    id: "drop-a",
    coordinates: dropA,
    icon: "map-pin",
    iconOptions: { size: 30, color: "#2e7d5b" },
    legend: { label: "INV-1041 — delivered", show: true },
  },
  {
    id: "drop-b",
    coordinates: dropB,
    icon: "map-pin",
    iconOptions: { size: 30, color: "#b8842a" },
    legend: { label: "INV-1042 — pending", show: true },
  },
];

const routes: Array<PolylineInput> = [
  {
    id: "run-1",
    coordinates: [depot, dropA],
    options: { color: "#2e3a6e", weight: 4 },
  },
  {
    id: "run-2",
    coordinates: [depot, dropB],
    options: { color: "#8a6d3b", weight: 4, dashArray: "6 6" },
  },
];

export const Default: Story = {};

/*
 * A marker's `icon` takes raw SVG markup as well as a registry name. Inline
 * here so the story has no bundler dependency; in an app this is usually
 * `import pin from "./pin.svg?raw"`, an API response, or a CMS field.
 */
const customPin = `
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#b0413a">
  <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z" />
  <circle cx="12" cy="9" r="2.5" fill="#fff" />
</svg>`;

/** Mixing both forms: two registry names and one raw SVG string. */
export const RawSvgIcons: Story = {
  args: {
    markers: [
      {
        id: "raw",
        coordinates: depot,
        icon: customPin,
        legend: { label: "Raw SVG marker", show: true },
        popup: { content: "<strong>Depot</strong><br/>Icon passed as SVG markup" },
      },
      {
        id: "registry-a",
        coordinates: dropA,
        icon: "map-pin",
        iconOptions: { size: 30, color: "#2e7d5b" },
        legend: { label: "Registry name — map-pin", show: true },
      },
      {
        id: "registry-b",
        coordinates: dropB,
        icon: "truck-delivery",
        iconOptions: { size: 30, color: "#2e3a6e" },
        legend: { label: "Registry name — truck-delivery", show: true },
      },
    ],
  },
};

/** Markers drawn from `@tabler/icons` SVG markup, one colour per delivery state. */
export const WithMarkers: Story = {
  args: { markers },
};

export const WithRoutes: Story = {
  args: { markers, routes },
};

/** A single moving vehicle — the shape a live-tracking screen uses. */
export const VehicleTracking: Story = {
  args: {
    center: dropA,
    zoom: 14,
    markers: [
      {
        id: "vehicle-1",
        coordinates: dropA,
        icon: "truck-delivery",
        iconOptions: { size: 36, color: "#b0413a" },
        legend: { label: "B 9021 TXW", show: true },
        popup: { content: "<strong>B 9021 TXW</strong><br/>ETA 14:20" },
      },
    ],
  },
};

/** No layer switcher — for embeds where the tile source is fixed. */
export const WithoutLayerControl: Story = {
  args: { markers, showLayerControl: false },
};

/*
 * Extra tile sources supplied by URL. They join the built-in OSM in the layer
 * switcher, and `tileLayer` can point at any custom id to open on it.
 */
const customLayers: Array<CustomTileLayer> = [
  {
    id: "opentopo",
    name: "OpenTopoMap",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    options: {
      maxZoom: 17,
      attribution: "&copy; OpenStreetMap contributors, SRTM — &copy; OpenTopoMap (CC-BY-SA)",
    },
  },
  {
    id: "carto-dark",
    name: "Carto Dark Matter",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    options: {
      subdomains: "abcd",
      maxZoom: 20,
      attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
    },
  },
];

/** Custom tile sources passed by URL, opening on the dark Carto basemap. */
export const CustomLayers: Story = {
  args: { markers, customLayers, tileLayer: "carto-dark" },
};
