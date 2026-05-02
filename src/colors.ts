/**
 * Core color algorithms for extraction, quantization, and semantic assignments.
 */

export type RGB = { r: number; g: number; b: number };
export type HSL = { h: number; s: number; l: number };

export function hexToRgb(hex: string): RGB {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }
  const num = parseInt(hex, 16);
  return { r: num >> 16, g: (num >> 8) & 255, b: num & 255 };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s, l };
}

export function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; 
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

export function hexToHsl(hex: string): HSL {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

// Ensure high accessibility text contrast (Returns White or Black)
export function getContrast(hex: string): string {
  if (!hex) return "#ffffff";
  const { r, g, b } = hexToRgb(hex);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

// Gets 5 variations of a color from light to dark
export function generatePalette(hex: string): string[] {
  const hsl = hexToHsl(hex);
  // steps: lightest to darkest
  const lSteps = [0.9, 0.7, 0.5, 0.3, 0.1];
  return lSteps.map((l) => hslToHex(hsl.h, hsl.s, l));
}

// Distance in 3D RGB space for uniqueness comparison
function colorDistance(c1: RGB, c2: RGB): number {
  return Math.sqrt(Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2));
}

export async function extractDistinctColors(imageUrl: string, count: number = 5): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return resolve([]);

      // Scale down image to iterate pixels faster and force blending
      const maxDim = 100;
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height).data;
      const pixels: RGB[] = [];

      // Only look at visible pixels, skipping to speed up
      for (let i = 0; i < imageData.length; i += 4 * 2) {
        if (imageData[i + 3] > 125) {
          pixels.push({ r: imageData[i], g: imageData[i + 1], b: imageData[i + 2] });
        }
      }

      const binSize = 24; // Quantum size to merge very similar colors
      const counts = new Map<string, { count: number; rgb: RGB }>();

      pixels.forEach((p) => {
        const r = Math.floor(p.r / binSize) * binSize;
        const g = Math.floor(p.g / binSize) * binSize;
        const b = Math.floor(p.b / binSize) * binSize;
        const key = `${r},${g},${b}`;

        if (!counts.has(key)) counts.set(key, { count: 0, rgb: p }); // Store actual first pixel instance
        counts.get(key)!.count++;
      });

      // Sort by frequency
      const sortedBins = Array.from(counts.values()).sort((a, b) => b.count - a.count);
      const distinctColors: RGB[] = [];
      let currentDistanceThreshold = 60; // Start with strict uniqueness

      // Try extraction multiple times, loosening constraints if we can't find 'count' colors
      while (distinctColors.length < count && currentDistanceThreshold > 10) {
        for (const bin of sortedBins) {
          if (distinctColors.length >= count) break;
          
          let isDistinct = true;
          for (const dc of distinctColors) {
            if (colorDistance(bin.rgb, dc) < currentDistanceThreshold) {
              isDistinct = false;
              break;
            }
          }
          
          if (isDistinct) {
            distinctColors.push(bin.rgb);
          }
        }
        currentDistanceThreshold -= 15;
      }

      // Pad with fallback grayscales if it's an impossibly monotonous image
      const fallback = [{r:20,g:20,b:25}, {r:240,g:240,b:240}, {r:100,g:100,b:100}, {r:150,g:150,b:150}, {r:50,g:50,b:50}];
      while(distinctColors.length < count) {
        distinctColors.push(fallback[distinctColors.length]);
      }

      resolve(distinctColors.map((c) => rgbToHex(c.r, c.g, c.b)));
    };
    img.src = imageUrl;
  });
}

export type ColorRoles = {
  background: string;
  text: string;
  primary: string;
  secondary: string;
  accent: string;
};

export function assignSemanticRoles(hexColors: string[]): ColorRoles {
  // Enhance analytical data per color
  let analyzed = hexColors.map((hex) => {
    const hsl = hexToHsl(hex);
    return { hex, hsl, score: hsl.s * 100 + (hsl.l > 0.4 && hsl.l < 0.8 ? 50 : 0) }; // Score vibrancy
  });

  // 1. Background: Darkest color (for dark mode default)
  analyzed.sort((a, b) => a.hsl.l - b.hsl.l);
  const background = analyzed[0].hex;

  // 2. Text: Lightest color (highest contrast against background)
  const text = analyzed[analyzed.length - 1].hex;

  // Filter out what we used
  let remaining = analyzed.slice(1, analyzed.length - 1);

  // 3, 4, 5. Primary, Secondary, Accent based on vibrancy
  remaining.sort((a, b) => b.score - a.score);

  const primary = remaining[0]?.hex || text;
  const accent = remaining[1]?.hex || text;
  const secondary = remaining[2]?.hex || text;

  return { background, text, primary, secondary, accent };
}
