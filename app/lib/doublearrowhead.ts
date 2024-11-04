//SingleArrowHeadTool
import { fabric } from "fabric"
import FabricTool, { ConfigureCanvasProps } from "./fabrictool"

class DoubleArrowHeadTool extends FabricTool {
  isMouseDown: boolean = false
  strokeWidth: number = 10
  // yy2: number = 0
  // yy1: number = 0
  // xx2: number = 0
  // xx1: number = 0
  strokeColor: string = "#ffffff"
  currentLine: fabric.Line = new fabric.Line()
  startCircle: fabric.Circle = new fabric.Circle()
  doublearrow: fabric.Group = new fabric.Group()
  startTriangle: fabric.Triangle = new fabric.Triangle()
  endTriangle: fabric.Triangle = new fabric.Triangle()

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
      //canvas.add(this.currentLine)
      canvas.add(this.doublearrow)
    }
  }

  onMouseMove(o: any) {
    if (!this.isMouseDown) return
    let canvas = this._canvas
    var pointer = canvas.getPointer(o.e)
    this.currentLine.set({ x2: pointer.x, y2: pointer.y }) //takes the first point's coordinates from mouse down event
    this.currentLine.setCoords()

    ////// Remove the previous group if it exists
    if (this.doublearrow) {
      canvas.remove(this.doublearrow)
    }

    // Initialize variables
    let yy2: any = 0 // Initialization
    let yy1: any = 0 // Initialization
    let xx2: any = 0 // Initialization
    let xx1: any = 0 // Initialization

    yy2 = this.currentLine.y2
    yy1 = this.currentLine.y1
    xx2 = this.currentLine.x2
    xx1 = this.currentLine.x1

    var angle = Math.atan2(yy2 - yy1, xx2 - xx1)

    // Create a triangle at the end of the line
    this.endTriangle = new fabric.Triangle({
      left: pointer.x,
      top: pointer.y,
      originX: "center",
      originY: "center",
      strokeWidth: this.strokeWidth,
      stroke: this.strokeColor,
      fill: this.strokeColor,
      selectable: false,
      evented: false,
      width: this.strokeWidth * 5,
      height: this.strokeWidth * 5,
      angle: angle * (180 / Math.PI) + 90, // Convert the angle to degrees and add 90 to align with the line
    })

    // Create a triangle at the start of the line
    this.startTriangle = new fabric.Triangle({
      left: this.currentLine.x1, //+ this.currentLine.left,
      top: this.currentLine.y1, //+ this.currentLine.top,
      originX: "center",
      originY: "center",
      strokeWidth: this.strokeWidth,
      stroke: this.strokeColor,
      fill: this.strokeColor,
      selectable: false,
      evented: false,
      width: this.strokeWidth * 5,
      height: this.strokeWidth * 5,
      angle: angle * (180 / Math.PI) - 90, // Convert the angle to degrees and subtract 90 to align with the line
    })

    // Create a group and add the line and the triangles to it
    this.doublearrow = new fabric.Group(
      [this.currentLine, this.startTriangle, this.endTriangle],
      {
        selectable: false,
        evented: false,
      }
    )

    canvas.add(this.doublearrow)
    canvas.renderAll()
  }

  onMouseUp(o: any) {
    this.isMouseDown = false
    let canvas = this._canvas
    // if (this.currentLine.width === 0 && this.currentLine.height === 0) {
    //   canvas.remove(this.currentLine)
    // }
    //canvas.remove(this.currentLine)
    var updatedgroup = this.doublearrow
    canvas.remove(this.doublearrow)
    canvas.add(updatedgroup)
    canvas.renderAll()
  }

  onMouseOut(o: any) {
    this.isMouseDown = false
  }
}

export default DoubleArrowHeadTool
