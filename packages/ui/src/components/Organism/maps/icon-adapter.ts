/**
 * Adapter to convert Icon component usage to HTMLElement
 * This is useful for scenarios where you need raw DOM elements instead of React components
 * (e.g., Leaflet markers, third-party libraries that expect HTMLElement)
 */

export interface IconToElementOptions {
  className?: string;
  style?: Partial<CSSStyleDeclaration>;
  size?: string | number;
  color?: string;
}

/**
 * Creates an HTMLElement from icon name and options
 * Mimics the behavior of <Icon name="dots" className="h-4 w-4" />
 */
export function iconToHTMLElement(name: string, options: IconToElementOptions = {}): HTMLElement {
  const { className = "", style = {}, size, color } = options;

  // Create the <i> element using the same pattern as the Icon component
  const iconElement = document.createElement("i");

  // Set the CSS class following the "i-${name}" pattern
  iconElement.className = `i-${name} ${className}`.trim();

  // Apply styles
  if (size) {
    iconElement.style.fontSize = typeof size === "number" ? `${size}px` : size;
    iconElement.style.width = typeof size === "number" ? `${size}px` : size;
    iconElement.style.height = typeof size === "number" ? `${size}px` : size;
  }

  if (color) {
    iconElement.style.color = color;
  }

  // Apply additional styles
  Object.assign(iconElement.style, style);

  // Ensure proper display for icons
  iconElement.style.display = iconElement.style.display || "inline-flex";
  iconElement.style.alignItems = iconElement.style.alignItems || "center";
  iconElement.style.justifyContent = iconElement.style.justifyContent || "center";

  return iconElement;
}

/**
 * Convenience function that mimics common Tailwind size classes
 */
export function iconToHTMLElementWithTailwindSize(
  name: string,
  tailwindSize: "h-4 w-4" | "h-5 w-5" | "h-6 w-6" | "h-8 w-8" | string,
  additionalClassName?: string,
): HTMLElement {
  // Map Tailwind size classes to pixel values
  const sizeMap: Record<string, number> = {
    "h-4 w-4": 16,
    "h-5 w-5": 20,
    "h-6 w-6": 24,
    "h-8 w-8": 32,
  };

  const size = sizeMap[tailwindSize] || 16; // Default to 16px if not found

  return iconToHTMLElement(name, {
    size,
    className: `${tailwindSize} ${additionalClassName || ""}`.trim(),
  });
}

/**
 * Creates an HTMLElement that exactly matches <Icon name="dots" className="h-4 w-4" />
 */
export function dotsIconToHTMLElement(className?: string): HTMLElement {
  return iconToHTMLElementWithTailwindSize("dots", "h-4 w-4", className);
}
