import { fabric } from "fabric"
import FabricTool, { ConfigureCanvasProps } from "./fabrictool"

class LineTool extends FabricTool {
  isMouseDown: boolean = false
  strokeWidth: number = 10
  strokeColor: string = "#ffffff"
  currentLine: fabric.Line = new fabric.Line()

  configureCanvas({
    strokeWidth,
    strokeColor,
  }: ConfigureCanvasProps): () => void {
    this._canvas.isDrawingMode = false
    this._canvas.selection = false
    this._canvas.forEachObject((o) => (o.selectable = o.evented = false))

    this.strokeWidth = strokeWidth
    this.strokeColor = strokeColor

    this._canvas.on("mouse:down", (e: any) => this.onMouseDown(e))
    this._canvas.on("mouse:move", (e: any) => this.onMouseMove(e))
    this._canvas.on("mouse:up", (e: any) => this.onMouseUp(e))
    this._canvas.on("mouse:out", (e: any) => this.onMouseOut(e))
    return () => {
      this._canvas.off("mouse:down")
      this._canvas.off("mouse:move")
      this._canvas.off("mouse:up")
      this._canvas.off("mouse:out")
    }
  }

  onMouseDown(o: any) {
    console.log("MouseDown on lineTool selection detected")
    let canvas = this._canvas
    let _clicked = o.e["button"]
    this.isMouseDown = true
    var pointer = canvas.getPointer(o.e)
    var points = [pointer.x, pointer.y, pointer.x, pointer.y]
    this.currentLine = new fabric.Line(points, {
      strokeWidth: this.strokeWidth,
      fill: this.strokeColor,
      stroke: this.strokeColor,
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
    })
    if (_clicked === 0) {
      canvas.add(this.currentLine)
    }
  }

  onMouseMove(o: any) {
    if (!this.isMouseDown) return
    let canvas = this._canvas
    var pointer = canvas.getPointer(o.e)
    this.currentLine.set({ x2: pointer.x, y2: pointer.y }) //takes the first point's coordinates from mouse:down event and then replaces the second coordinate by the new one; that is why the line updates and is dynamic before mouse:down/up again
    this.currentLine.setCoords()
    canvas.renderAll()
  }

  onMouseUp(o: any) {
    this.isMouseDown = false
    let canvas = this._canvas
    if (this.currentLine.width === 0 && this.currentLine.height === 0) {
      canvas.remove(this.currentLine)
    }
  }

  onMouseOut(o: any) {
    this.isMouseDown = false
  }
}

export default LineTool
