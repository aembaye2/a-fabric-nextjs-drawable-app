"use client"
//DrawingModeSelector.tsx
import React from "react"

interface DrawingModeSelectorProps {
  drawingMode: string
  setDrawingMode: (mode: string) => void
}

const DrawingModeSelector: React.FC<DrawingModeSelectorProps> = ({
  drawingMode,
  setDrawingMode,
}) => {
  const modes = [
    "point",
    "line",
    "polygon",
    "rect",
    "circle",
    "freedraw",
    "coordinate",
    "curve",
    "singlearrowhead",
    "doublearrowhead",
    "text",
    "transform",
  ]

  return (
    <div>
      <label htmlFor="drawing-mode">Drawing tools:</label>
      <select
        id="drawing-mode"
        value={drawingMode}
        onChange={(e) => setDrawingMode(e.target.value)}
      >
        {modes.map((mode) => (
          <option key={mode} value={mode}>
            {mode}
          </option>
        ))}
      </select>
    </div>
  )
}

export default DrawingModeSelector
