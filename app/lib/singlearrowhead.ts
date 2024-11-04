//SingleArrowHeadTool
import { fabric } from "fabric"
import FabricTool, { ConfigureCanvasProps } from "./fabrictool"

class SingleArrowHeadTool extends FabricTool {
  isMouseDown: boolean = false
  strokeWidth: number = 10
  strokeColor: string = "#ffffff"
  currentLine: fabric.Line = new fabric.Line()
  startCircle: fabric.Circle = new fabric.Circle()
  singlearrow: fabric.Group = new fabric.Group()
  //startTriangle: fabric.Triangle = new fabric.Triangle()
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
      canvas.add(this.singlearrow)
    }
  }

  onMouseMove(o: any) {
    if (!this.isMouseDown) return
    let canvas = this._canvas
    var pointer = canvas.getPointer(o.e)
    this.currentLine.set({ x2: pointer.x, y2: pointer.y }) //takes the first point's coordinates from mouse down event
    //this.currentLine.setCoords()

    ////// Remove the previous group if it exists
    if (this.singlearrow) {
      canvas.remove(this.singlearrow)
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

    var angle = Math.atan2(
      // this.currentLine?.y2 - this.currentLine?.y1,
      // this.currentLine?.x2 - this.currentLine?.x1
      yy2 - yy1,
      xx2 - xx1
    )

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

    this.singlearrow = new fabric.Group(
      [
        this.currentLine, //this.startTriangle,
        this.endTriangle,
      ],
      {
        selectable: false,
        evented: false,
      }
    )
    // Add custom property to identify the tool
    this.singlearrow.toObject = (function (toObject) {
      return function (this: fabric.Object) {
        return fabric.util.object.extend(toObject.call(this), {
          toolType: "SingleArrowHeadTool",
        })
      }
    })(this.singlearrow.toObject)
    canvas.add(this.singlearrow)
    canvas.renderAll()
  }

  onMouseUp(o: any) {
    this.isMouseDown = false
    let canvas = this._canvas
    var updatedgroup = this.singlearrow
    canvas.remove(this.singlearrow)
    canvas.add(updatedgroup)
    canvas.renderAll()
  }

  onMouseOut(o: any) {
    this.isMouseDown = false
  }
}

export default SingleArrowHeadTool
