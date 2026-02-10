
export enum ArtStyle {
  WATERCOLOR = 'Watercolor',
  OIL_PAINT = 'Oil Paint',
  ACRYLIC = 'Acrylic',
  PENCIL = 'Pencil Drawing',
  SILHOUETTE = 'Silhouette'
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
  LOADING_IMAGE = 'LOADING_IMAGE',
  LOADING_INSPIRATION = 'LOADING_INSPIRATION',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
