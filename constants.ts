
import { ArtStyle } from './types';

export const DEFAULT_SUBJECTS = [
  "A thoughtful elderly sailor with a weathered face",
  "A young woman with flowers woven into her hair",
  "A mysterious traveler in a wide-brimmed hat",
  "A child laughing in a rain-drenched street",
  "A portrait of a ballet dancer in mid-motion",
  "A jazz musician lost in their saxophone solo",
  "A scholar surrounded by ancient manuscripts"
];

export const STYLE_MODIFIERS: Record<ArtStyle, string> = {
  [ArtStyle.WATERCOLOR]: "soft watercolor painting, heavy paper texture, delicate washes, translucent layering, artistic bleeds, high quality, ethereal lighting, loose brushwork",
  [ArtStyle.OIL_PAINT]: "thick oil painting, impasto technique, visible heavy brushstrokes, rich textures, deep dramatic colors, classic masterpiece style, canvas texture, oil on canvas",
  [ArtStyle.ACRYLIC]: "vibrant acrylic painting, bold colors, clean edges, modern art style, smooth gradients, satin finish, layered pigments",
  [ArtStyle.PENCIL]: "detailed pencil sketch, professional graphite shading, cross-hatching, fine lines, white paper background, hand-drawn look, realistic sketching",
  [ArtStyle.SILHOUETTE]: "minimalist silhouette art, high contrast, solid black figure, atmospheric single-color background, clean sharp edges, graphic vector style"
};
