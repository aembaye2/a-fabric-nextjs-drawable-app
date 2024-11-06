"use client"
import React, { useEffect, useRef, forwardRef } from "react"
import { fabric } from "fabric"
import { isEqual } from "lodash"
import CanvasToolbar from "./components/CanvasToolbar"
import { useCanvasState } from "./DrawableCanvasState"
import { tools, FabricTool } from "./lib"

export interface ComponentArgs {
  fillColor: string
  strokeWidth: number
  strokeColor: string
  backgroundColor: string
  backgroundImageURL: string
  canvasWidth: number
  canvasHeight: number
  drawingMode: string
  initialDrawing: Object
  displayToolbar: boolean
  displayRadius: number
  scaleFactors: number[]
}

const DrawableCanvas = forwardRef<HTMLCanvasElement, ComponentArgs>(
  (
    {
      fillColor,
      strokeWidth,
      strokeColor,
      backgroundColor,
      backgroundImageURL,
      canvasWidth,
      canvasHeight,
      drawingMode,
      initialDrawing,
      displayToolbar,
      displayRadius,
      scaleFactors,
    },
    ref
  ) => {
    const canvasRef = ref || useRef<HTMLCanvasElement>(null)
    const canvasInstance = useRef<fabric.Canvas | null>(null)
    const backgroundCanvasRef = useRef<HTMLCanvasElement>(null)
    const backgroundCanvasInstance = useRef<fabric.StaticCanvas | null>(null)
    const {
      canvasState: {
        action: { shouldReloadCanvas },
        currentState,
        initialState,
      },
      saveState,
      undo,
      redo,
      canUndo,
      canRedo,
      resetState,
    } = useCanvasState()

    useEffect(() => {
      if (canvasRef.current) {
        canvasInstance.current = new fabric.Canvas(canvasRef.current, {
          enableRetinaScaling: false,
        })
      }
      if (backgroundCanvasRef.current) {
        backgroundCanvasInstance.current = new fabric.StaticCanvas(
          backgroundCanvasRef.current,
          {
            enableRetinaScaling: false,
          }
        )
      }

      // Disable context menu on right-click
      const canvasElement = canvasRef.current
      if (canvasElement) {
        canvasElement.addEventListener("contextmenu", (e) => {
          e.preventDefault()
        })
      }

      return () => {
        if (canvasElement) {
          canvasElement.removeEventListener("contextmenu", (e) => {
            e.preventDefault()
          })
        }
        canvasInstance.current?.dispose()
        backgroundCanvasInstance.current?.dispose()
      }
    }, [])

    useEffect(() => {
      if (canvasInstance.current) {
        canvasInstance.current.clear() // Clear the canvas before loading new drawing
        if (!isEqual(initialState, initialDrawing)) {
          canvasInstance.current.loadFromJSON(initialDrawing, () => {
            canvasInstance.current?.renderAll()
            resetState(initialDrawing)
          })
        }
      }
    }, [initialDrawing, initialState, resetState])

    useEffect(() => {
      if (backgroundCanvasInstance.current && backgroundImageURL) {
        const bgImage = new Image()
        bgImage.onload = function () {
          backgroundCanvasInstance.current
            ?.getContext()
            .drawImage(bgImage, 0, 0)
        }
        bgImage.src = backgroundImageURL
      }
    }, [backgroundImageURL])

    useEffect(() => {
      if (canvasInstance.current && shouldReloadCanvas) {
        canvasInstance.current.loadFromJSON(currentState, () => {
          canvasInstance.current?.renderAll()
        })
      }
    }, [shouldReloadCanvas, currentState])

    useEffect(() => {
      if (canvasInstance.current) {
        const selectedTool = new tools[drawingMode](
          canvasInstance.current
        ) as FabricTool
        const cleanupToolEvents = selectedTool.configureCanvas({
          fillColor: fillColor,
          strokeWidth: strokeWidth,
          strokeColor: strokeColor,
          displayRadius: displayRadius,
          scaleFactors: scaleFactors,
          canvasHeight: canvasHeight,
          canvasWidth: canvasWidth,
        })

        const handleMouseUp = () => {
          saveState(canvasInstance.current?.toJSON())
        }

        canvasInstance.current.on("mouse:up", handleMouseUp)
        canvasInstance.current.on("mouse:dblclick", handleMouseUp)

        return () => {
          cleanupToolEvents()
          canvasInstance.current?.off("mouse:up", handleMouseUp)
          canvasInstance.current?.off("mouse:dblclick", handleMouseUp)
        }
      }
    }, [
      strokeWidth,
      strokeColor,
      displayRadius,
      fillColor,
      drawingMode,
      initialDrawing,
      scaleFactors,
      canvasHeight,
      canvasWidth,
      saveState,
    ])

    const downloadCallback = () => {
      if (canvasInstance.current) {
        const dataURL = canvasInstance.current.toDataURL({
          format: "png",
          quality: 1,
        })
        const link = document.createElement("a")
        link.href = dataURL
        link.download = "canvas.png"
        link.click()
      }
    }

    return (
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 0,
            backgroundColor: "rgba(255, 0, 0, 0.1)",
            //border: "1px solid black",
          }}
        >
          <canvas // Background canvas
            ref={backgroundCanvasRef}
            width={canvasWidth} //canvasWidth + 50 //canvasWidth
            height={canvasHeight} //canvasHeight + 50 //canvasHeight
          />
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0, //0 //100
            zIndex: 10,
            //backgroundColor: "rgba(245, 40, 145, 0.24)", //white //"rgba(255, 0, 0, 0.1)",
            border: "1px solid black",
          }}
        >
          <canvas // main canvas above background canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="border border-lightgrey"
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          {displayToolbar && (
            <CanvasToolbar
              topPosition={0}
              leftPosition={canvasWidth + 5} //canvasWidth //canvasWidth + 55
              downloadCallback={downloadCallback}
              canUndo={canUndo}
              canRedo={canRedo}
              undoCallback={undo}
              redoCallback={redo}
              resetCallback={() => {
                resetState(initialState)
              }}
            />
          )}
        </div>
      </div>
    )
  }
)

export default DrawableCanvas
