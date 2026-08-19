export type PetalShape = "round" | "pointed" | "heart" | "diamond";

export interface RosaOptions {
  background?: string;
  outline?: string;
  palette?: string[];
  petalCount?: number;
  size?: number;
  pixelRatio?: number;
  resizeCss?: boolean;
}

export interface PetalLayer {
  count: number;
  shape: PetalShape;
  radius: number;
  width: number;
  innerRadius: number;
  rotation: number;
  color: string;
  accent: string;
  outlineWidth: number;
}

export interface Flower {
  kind: "rosa";
  version: string;
  seed: string;
  background: string;
  outline: string;
  center: {
    radius: number;
    color: string;
    ringColor: string;
    ringWidth: number;
    dots: number;
  };
  layers: PetalLayer[];
  speckles: boolean;
}

export function generate(seed: unknown, options?: RosaOptions): Flower;
export function render(canvas: HTMLCanvasElement, seedOrFlower: unknown | Flower, options?: RosaOptions): Flower;

declare const rosa: Readonly<{
  version: string;
  generate: typeof generate;
  render: typeof render;
}>;

export { rosa };
export default rosa;
