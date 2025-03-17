export type ShapeType = "rect" | "circle";

export type Shape = {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  strokeWidth: number;
  stroke: string;
};