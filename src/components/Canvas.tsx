import React, { useRef, useEffect, useCallback, useState } from "react";
import { Stage, Layer, Rect, Circle, Transformer, Line, Group } from "react-konva";
import Konva from "konva";
import { Shape } from "@/lib/types";
import { Background } from "./Background";

interface CanvasProps {
  shapes: Shape[];
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
  selectedId: string | null;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  tool: "rect" | "circle" | "select";
  setTool: React.Dispatch<React.SetStateAction<"rect" | "circle" | "select">>;
  backgroundImage: HTMLImageElement | null;
  setBackgroundImage: (img: HTMLImageElement) => void;
  history: Shape[][];
  setHistory: React.Dispatch<React.SetStateAction<Shape[][]>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  isPreviewing: boolean;
  handleUndo: () => void;
}

const AnimatedSkeleton = ({
  type,
  ...props
}: { type: "rect" | "circle" } & Omit<Shape, "id" | "type">) => {
  const elementRef = useRef<Konva.Rect | Konva.Circle>(null);

  useEffect(() => {
    const node = elementRef.current;
    if (!node) return;

    const animation = new Konva.Animation((frame) => {
      if (!frame) return;
      const opacity = 1 + Math.sin(frame.time * 0.003) * 0.4;
      node.opacity(opacity);
    }, node.getLayer()!);

    animation.start();
    return () => {
      animation.stop();
    };
  }, []);

  const commonProps = {
    fill: "#18181b1a",
    strokeWidth: 0,
    cornerRadius: type === "rect" ? 8 : 0
  };

  return type === "rect" ? (
    <Rect
      ref={elementRef as React.Ref<Konva.Rect>}
      {...props}
      {...commonProps}
      width={props.width}
      height={props.height}
    />
  ) : (
    <Circle
      ref={elementRef as React.Ref<Konva.Circle>}
      {...props}
      {...commonProps}
      radius={props.radius}
    />
  );
};

export const Canvas: React.FC<CanvasProps> = ({
  setSelectedId,
  setHistory,
  setCurrentStep,
  setShapes,
  setTool,
  handleUndo,
  currentStep,
  selectedId,
  shapes,
  tool,
  backgroundImage,
  isPreviewing
}) => {
  const [draftShape, setDraftShape] = useState<Omit<Shape, "id"> | null>(null);
  const [clipboard, setClipboard] = useState<Shape | null>(null);
  const [snapLines, setSnapLines] = useState<{
    vertical: number | null;
    horizontal: number | null;
  }>({ vertical: null, horizontal: null });

  const transformerRef = useRef<Konva.Transformer>(null);
  const shapesRef = useRef(shapes);

  const updateHistory = useCallback(
    (newShapes: Shape[]) => {
      setHistory((prev) => [...prev.slice(0, currentStep + 1), newShapes]);
      setCurrentStep((prev) => prev + 1);
    },
    [currentStep, setCurrentStep, setHistory]
  );

  const handleShapeDragMove =
    (shapeId: string) => (e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target;
      const newX = node.x();
      const newY = node.y();
      const SNAP_THRESHOLD = 10;
      const HYSTERESIS_THRESHOLD = 5;

      setShapes((prevShapes) => {
        const currentShape = prevShapes.find((s) => s.id === shapeId);
        if (!currentShape) return prevShapes;

        const otherShapes = prevShapes.filter((s) => s.id !== shapeId);
        let snappedX = newX;
        let snappedY = newY;
        let verticalLine: number | null = null;
        let horizontalLine: number | null = null;

        // Track previous positions to implement hysteresis
        const prevX = currentShape.x;

        // Snap detection logic
        const checkSnap = (value: number, target: number): number => {
          const diff = Math.abs(value - target);
          const prevDiff = Math.abs(prevX - target);

          // Apply hysteresis: only snap if moving towards the target
          if (diff < SNAP_THRESHOLD && (diff < prevDiff || diff < HYSTERESIS_THRESHOLD)) {
            return target;
          }
          return value;
        };

        otherShapes.forEach((otherShape) => {
          if (otherShape.type === "rect") {
            const left = otherShape.x;
            const right = otherShape.x + otherShape.width;
            const top = otherShape.y;
            const bottom = otherShape.y + otherShape.height;
            const centerX = otherShape.x + otherShape.width / 2;
            const centerY = otherShape.y + otherShape.height / 2;

            // Horizontal snapping with hysteresis
            snappedX = checkSnap(snappedX, left);
            if (snappedX === left) verticalLine = left;

            snappedX = checkSnap(snappedX, right);
            if (snappedX === right) verticalLine = right;

            snappedX = checkSnap(snappedX, centerX);
            if (snappedX === centerX) verticalLine = centerX;

            // Vertical snapping with hysteresis
            snappedY = checkSnap(snappedY, top);
            if (snappedY === top) horizontalLine = top;

            snappedY = checkSnap(snappedY, bottom);
            if (snappedY === bottom) horizontalLine = bottom;

            snappedY = checkSnap(snappedY, centerY);
            if (snappedY === centerY) horizontalLine = centerY;
          } else if (otherShape.type === "circle") {
            const centerX = otherShape.x;
            const centerY = otherShape.y;
            const radius = otherShape.radius;

            snappedX = checkSnap(snappedX, centerX);
            if (snappedX === centerX) verticalLine = centerX;

            snappedY = checkSnap(snappedY, centerY);
            if (snappedY === centerY) horizontalLine = centerY;

            // Edge snapping for circles
            const dx = newX - centerX;
            const dy = newY - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const edgeX = centerX + (dx / distance) * radius;
            const edgeY = centerY + (dy / distance) * radius;

            snappedX = checkSnap(snappedX, edgeX);
            snappedY = checkSnap(snappedY, edgeY);
          }
        });

        // Stage boundary snapping
        const stage = node.getStage();
        if (stage) {
          const stageWidth = stage.width();
          const stageHeight = stage.height();

          snappedX = checkSnap(snappedX, 0);
          if (snappedX === 0) verticalLine = 0;

          snappedX = checkSnap(snappedX, stageWidth);
          if (snappedX === stageWidth) verticalLine = stageWidth;

          snappedY = checkSnap(snappedY, 0);
          if (snappedY === 0) horizontalLine = 0;

          snappedY = checkSnap(snappedY, stageHeight);
          if (snappedY === stageHeight) horizontalLine = stageHeight;
        }

        // Update snapping lines
        setSnapLines({
          vertical: verticalLine,
          horizontal: horizontalLine
        });

        // Update node position
        node.x(snappedX);
        node.y(snappedY);

        return prevShapes.map((s) =>
          s.id === shapeId ? { ...s, x: snappedX, y: snappedY } : s
        );
      });
    };

  const handleShapeDragEnd =
    (shapeId: string) => (e: Konva.KonvaEventObject<DragEvent>) => {
      if (isPreviewing) return;

      setSnapLines({ vertical: null, horizontal: null });
      setShapes((prevShapes) => {
        const updatedShapes = prevShapes.map((s) =>
          s.id === shapeId ? { ...s, x: e.target.x(), y: e.target.y() } : s
        );
        updateHistory(updatedShapes);
        return updatedShapes;
      });
    };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Unselect when clicking directly on stage (empty area)
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
    }
  };

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool === "select" || e.target !== e.target.getStage()) return;

    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;

    setDraftShape({
      type: tool,
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
      radius: 0,
      strokeWidth: 3,
      stroke: "#000"
    });
  };

  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!draftShape || !e.target.getStage()) return;

    const pos = e.target.getStage()!.getPointerPosition()!;
    const update =
      draftShape.type === "rect"
        ? {
            width: pos.x - draftShape.x,
            height: pos.y - draftShape.y
          }
        : {
            radius: Math.hypot(pos.x - draftShape.x, pos.y - draftShape.y)
          };

    setDraftShape((prev) => (prev ? { ...prev, ...update } : null));
  };

  const handleStageMouseUp = () => {
    if (!draftShape) return;

    const isValidShape =
      draftShape.type === "rect"
        ? draftShape.width !== 0 && draftShape.height !== 0
        : draftShape.radius !== 0;

    if (isValidShape) {
      const newShape = { ...draftShape, id: Date.now().toString() };
      const newShapes = [...shapes, newShape];
      setShapes(newShapes);
      updateHistory(newShapes);
    }

    setDraftShape(null);
  };

  const handleShapeTransformEnd =
    (shape: Shape) => (e: Konva.KonvaEventObject<Event>) => {
      const node = e.target;
      const updates: Partial<Shape> = { x: node.x(), y: node.y() };

      if (shape.type === "rect") {
        updates.width = Math.max(5, node.width() * node.scaleX());
        updates.height = Math.max(5, node.height() * node.scaleY());
      } else {
        updates.radius = Math.max(5, (node.width() * node.scaleX()) / 2);
      }

      node.scaleX(1);
      node.scaleY(1);

      const updatedShapes = shapes.map((s) =>
        s.id === shape.id ? { ...s, ...updates } : s
      );
      setShapes(updatedShapes);
      updateHistory(updatedShapes);
    };

  useEffect(() => {
    shapesRef.current = shapes;
  }, [shapes]);

  useEffect(() => {
    if (!transformerRef.current || isPreviewing) return;

    if (selectedId) {
      setTool("select");
      const stage = transformerRef.current.getStage();
      const selectedNode = stage?.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    } else {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId, isPreviewing, setTool, tool]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPreviewing) return null;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        handleUndo();
      }

      if ((e.key === "Backspace" || e.key === "Delete") && selectedId) {
        e.preventDefault();
        const newShapes = shapes.filter((shape) => shape.id !== selectedId);
        setShapes(newShapes);
        updateHistory(newShapes);
        setSelectedId(null);
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c" && selectedId) {
        const shapeToCopy = shapes.find((shape) => shape.id === selectedId);
        setClipboard(shapeToCopy || null);
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v" && clipboard) {
        const newShape = {
          ...clipboard,
          id: Date.now().toString(),
          x: clipboard.x + 20,
          y: clipboard.y + 20
        };
        const newShapes = [...shapes, newShape];
        setShapes(newShapes);
        updateHistory(newShapes);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isPreviewing,
    selectedId,
    shapes,
    clipboard,
    handleUndo,
    setShapes,
    updateHistory,
    setSelectedId
  ]);

  return (
    <div className="relative h-full w-full">
      <Stage
        width={window.innerWidth}
        height={window.innerHeight - 48}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onClick={handleStageClick}
      >
        <Background backgroundImage={isPreviewing ? null : backgroundImage} />
        <Layer>
          {isPreviewing ? (
            <Group>
              {shapes.map((shape) => (
                <AnimatedSkeleton
                  key={shape.id}
                  type={shape.type}
                  x={shape.x}
                  y={shape.y}
                  width={shape.type === "rect" ? shape.width : shape.radius * 2}
                  height={shape.type === "rect" ? shape.height : shape.radius * 2}
                  radius={shape.type === "circle" ? shape.radius : 0}
                  strokeWidth={shape.strokeWidth}
                  stroke={shape.stroke}
                />
              ))}
            </Group>
          ) : (
            <>
              {shapes.map((shape) =>
                shape.type === "rect" ? (
                  <Rect
                    key={shape.id}
                    id={shape.id}
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    stroke={shape.stroke}
                    strokeWidth={shape.strokeWidth}
                    cornerRadius={8}
                    draggable={tool === "select"}
                    onClick={() => setSelectedId(shape.id)}
                    onTransformEnd={handleShapeTransformEnd(shape)}
                    onDragMove={handleShapeDragMove(shape.id)}
                    onDragEnd={handleShapeDragEnd(shape.id)}
                  />
                ) : (
                  <Circle
                    key={shape.id}
                    id={shape.id}
                    x={shape.x}
                    y={shape.y}
                    radius={shape.radius}
                    stroke={shape.stroke}
                    strokeWidth={shape.strokeWidth}
                    draggable={tool === "select"}
                    onClick={() => setSelectedId(shape.id)}
                    onTransformEnd={handleShapeTransformEnd(shape)}
                    onDragMove={handleShapeDragMove(shape.id)}
                    onDragEnd={handleShapeDragEnd(shape.id)}
                  />
                )
              )}
            </>
          )}

          {!isPreviewing &&
            draftShape &&
            (draftShape.type === "rect" ? (
              <Rect
                x={draftShape.x}
                y={draftShape.y}
                width={draftShape.width}
                height={draftShape.height}
                stroke={draftShape.stroke}
                strokeWidth={draftShape.strokeWidth}
              />
            ) : (
              <Circle
                x={draftShape.x}
                y={draftShape.y}
                radius={draftShape.radius}
                stroke={draftShape.stroke}
                strokeWidth={draftShape.strokeWidth}
              />
            ))}

          {snapLines.vertical !== null && (
            <Line
              points={[snapLines.vertical, 0, snapLines.vertical, window.innerHeight]}
              stroke="#3b82f6"
              strokeWidth={1}
              dash={[4, 4]}
            />
          )}
          {snapLines.horizontal !== null && (
            <Line
              points={[0, snapLines.horizontal, window.innerWidth, snapLines.horizontal]}
              stroke="#3b82f6"
              strokeWidth={1}
              dash={[4, 4]}
            />
          )}

          {!isPreviewing && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(_, newBox) => ({
                ...newBox,
                width: Math.max(5, newBox.width),
                height: Math.max(5, newBox.height)
              })}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};
