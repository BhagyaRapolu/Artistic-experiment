
export enum ArtStyle {
  PENCIL = 'Pencil',
  CHARCOAL = 'Charcoal',
  INK_PEN = 'Ink / Pen',
  WATERCOLOR = 'Watercolor',
  ACRYLIC = 'Acrylic',
  OIL = 'Oil',
  PASTEL = 'Pastel',
  GOUACHE = 'Gouache',
  ABSTRACT = 'Abstract',
  REALISTIC = 'Realistic',
  MINIMALIST = 'Minimalist',
  LINE_ART = 'Line Art',
  SILHOUETTE = 'Silhouette',
  SKETCH = 'Sketch',
  CARTOON = 'Cartoon / Stylized',
  DIGITAL_ART = 'Digital Art'
}

export interface Inspiration {
  technique: string;
  palette: string[];
  mood: string;
  challenge: string;
}

export interface GeneratedPortrait {
  imageUrl: string;
  prompt: string;
  style: ArtStyle;
  inspiration: Inspiration;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING_IDEA = 'GENERATING_IDEA',
  LOADING_IMAGE = 'LOADING_IMAGE',
  LOADING_INSPIRATION = 'LOADING_INSPIRATION',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
