import React, { useState, useCallback } from "react";
import { Toolbar } from "@/components/Toolbar";
import { Canvas } from "@/components/Canvas";

import { Shape, ShapeType } from "@/lib/types";
import { CodeBlockDialog } from "./components/CodeBlock";

const App: React.FC = () => {
  const [tool, setTool] = useState<ShapeType | "select">("select");
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<Shape[][]>([[]]);
  const [currentStep, setCurrentStep] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [showDialog, setShowDialog] = useState(false); 
  const [isPreviewing, setIsPreviewing] = useState(false);

  const handleUndo = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      const prevShapes = history[prevStep];
      setShapes(prevShapes);
      setCurrentStep(prevStep);

      // Clear selection if undone shape was selected
      if (!prevShapes.some((shape) => shape.id === selectedId)) {
        setSelectedId(null);
      }
    }
  }, [currentStep, history, selectedId]);

  return (
    <div>
      <Toolbar
        setBackgroundImage={setBackgroundImage}
        setTool={setTool}
        setShapes={setShapes}
        handleUndo={handleUndo}
        handleGenerate={() => setShowDialog(true)}
        setIsPreviewing={setIsPreviewing}
        tool={tool}
        currentStep={currentStep}
        backgroundImage={backgroundImage}
        shapes={shapes}
        isPreviewing={isPreviewing}
      />
      <Canvas
        selectedId={selectedId}
        setCurrentStep={setCurrentStep}
        setHistory={setHistory}
        setSelectedId={setSelectedId}
        setShapes={setShapes}
        setTool={setTool}
        setBackgroundImage={setBackgroundImage}
        handleUndo={handleUndo}
        tool={tool}
        shapes={shapes}
        backgroundImage={backgroundImage}
        currentStep={currentStep}
        history={history}
        isPreviewing={isPreviewing}
      />
      <CodeBlockDialog
        shapes={shapes}
        showDialog={showDialog}
        setShowDialog={setShowDialog}
      />
    </div>
  );
};

export default App;
