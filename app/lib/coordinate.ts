import { fabric } from "fabric"
import FabricTool, { ConfigureCanvasProps } from "./fabrictool"

class CoordinateTool extends FabricTool {
  isMouseDown: boolean = false
  strokeColor: string = "#ffffff"
  strokeWidth: number = 10
  horizontalLine: fabric.Line | null = null
  verticalLine: fabric.Line | null = null
  coordinateCircle: fabric.Circle | null = null
  //coordinatesText: fabric.Text | null = null
  coordinatesTextX: fabric.Text | null = null
  coordinatesTextY: fabric.Text | null = null
  tempHorizontalLine: fabric.Line | null = null
  tempVerticalLine: fabric.Line | null = null
  tempCoordinateCircle: fabric.Circle | null = null
  tempCoordinatesText: fabric.Text | null = null
  coordinates_group: fabric.Group = new fabric.Group()
  tempCoordinates_group: fabric.Group = new fabric.Group()
  scaleFactors: number[] = [1, 1, 1, 1, 1, 1] // Define scaleFactors as an array; this are initializers; the real ones are set in the frontend .py script
  canvasWidth: number = 1 // Define canvasHeight as a number
  canvasHeight: number = 1

  configureCanvas({
    strokeWidth,
    strokeColor,
    scaleFactors,
    canvasHeight,
    canvasWidth, // Ensure canvasHeight is destructured
  }: ConfigureCanvasProps): () => void {
    this.scaleFactors = scaleFactors // Assign scaleFactors to this.scaleFactors
    this.canvasHeight = canvasHeight // Assign canvasHeight to this.canvasHeight
    this.canvasWidth = canvasWidth
    this._canvas.isDrawingMode = false
    this._canvas.selection = false
    this._canvas.forEachObject((o) => (o.selectable = o.evented = false))

    this.strokeWidth = strokeWidth
    this.strokeColor = strokeColor

    this._canvas.on("mouse:down", (e: any) => this.onMouseDown(e))
    this._canvas.on("mouse:move", (e: any) => this.onMouseMove(e))
    this._canvas.on("mouse:up", (e: any) => this.onMouseUp(e))
    this._canvas.on("mouse:out", () => this.onMouseOut())
    return () => {
      this._canvas.off("mouse:down")
      this._canvas.off("mouse:move")
      this._canvas.off("mouse:up")
      this._canvas.off("mouse:out")
      this.clearTemporaryObjects()
    }
  }

  onMouseDown(o: any) {
    if (o.e.button === 0) {
      this.isMouseDown = true
      let canvas = this._canvas
      let pointer = canvas.getPointer(o.e)
      //this.updateLinesAndCircle(pointer.x, pointer.y)
      this.drawLinesAndCoordinates(pointer.x, pointer.y)
    }
  }

  onMouseMove(o: any) {
    let canvas = this._canvas
    let pointer = canvas.getPointer(o.e)
    if (!this.isMouseDown) {
      this.drawTemporaryLinesAndCoordinates(pointer.x, pointer.y)
    }
  }

  onMouseUp(o: any) {
    if (o.e.button === 0) {
      this.isMouseDown = false
      //let canvas = this._canvas
      //let pointer = canvas.getPointer(o.e)
      this.clearTemporaryObjects()
      //this.drawLinesAndCoordinates(pointer.x, pointer.y)
    }
  }

  onMouseOut() {
    this.clearTemporaryObjects()
  }

  drawLinesAndCoordinates(x: number, y: number) {
    let canvas = this._canvas
    let strokeWidth = this.strokeWidth
    let strokeColor = "rgba(99, 99, 156, .75)"
    let canvasHeight = this.canvasHeight
    let canvasWidth = this.canvasWidth

    this.horizontalLine = new fabric.Line([this.scaleFactors[3], y, x, y], {
      stroke: strokeColor,
      strokeWidth: strokeWidth,
      selectable: false,
      evented: false,
      strokeDashArray: [10, 5],
    })

    this.verticalLine = new fabric.Line([x, y, x, 0.85 * canvasHeight], {
      stroke: strokeColor,
      strokeWidth: strokeWidth,
      selectable: false,
      evented: false,
      strokeDashArray: [10, 5],
    })

    this.coordinateCircle = new fabric.Circle({
      left: x,
      top: y,
      radius: 5,
      fill: strokeColor,
      selectable: false,
      evented: false,
      originX: "center",
      originY: "center",
    })
    // converted coordinates
    // scaleFactors = [xmax, ymax, bottom_margin, left_margin, top_margin, right_margin]
    let xx =
      ((x - this.scaleFactors[3]) /
        (canvasWidth - this.scaleFactors[3] - this.scaleFactors[5])) *
      this.scaleFactors[0]
    let yy =
      this.scaleFactors[1] -
      ((y - this.scaleFactors[4]) /
        (canvasHeight - this.scaleFactors[4] - this.scaleFactors[2])) *
        this.scaleFactors[1]

    this.coordinatesTextX = new fabric.Text(
      `${xx.toFixed(0)}`,

      {
        left: x + 0.01 * canvasWidth, //x + 10,
        top: 0.8 * canvasHeight, //y + 10,
        fill: strokeColor,
        fontSize: 14,
        selectable: false,
        evented: false,
      }
    )

    this.coordinatesTextY = new fabric.Text(
      `${yy.toFixed(0)}`,

      {
        left: 0.13 * canvasWidth, //x + 10,
        top: y - 0.035 * canvasHeight, //y + 10,
        fill: strokeColor,
        fontSize: 14,
        selectable: false,
        evented: false,
      }
    )

    this.coordinates_group = new fabric.Group(
      [
        this.horizontalLine,
        this.verticalLine,
        this.coordinateCircle,
        this.coordinatesTextX,
        this.coordinatesTextY,
      ],
      {
        selectable: false,
        evented: false,
      }
    )

    canvas.add(this.coordinates_group)
    canvas.renderAll()
  }

  drawTemporaryLinesAndCoordinates(x: number, y: number) {
    let canvas = this._canvas
    let strokeWidth = this.strokeWidth
    let strokeColor = "rgba(51, 0, 20, 0.5)"
    let canvasHeight = this.canvasHeight
    let canvasWidth = this.canvasWidth
    this.clearTemporaryObjects()

    this.tempHorizontalLine = new fabric.Line([0.12 * canvasWidth, y, x, y], {
      //0 is the default value for the x1 coordinate
      stroke: strokeColor,
      strokeWidth: strokeWidth,
      selectable: false,
      evented: false,
      strokeDashArray: [10, 5],
    })

    this.tempVerticalLine = new fabric.Line([x, y, x, 0.85 * canvasHeight], {
      stroke: strokeColor,
      strokeWidth: strokeWidth,
      selectable: false,
      evented: false,
      strokeDashArray: [10, 5],
    })

    this.tempCoordinateCircle = new fabric.Circle({
      left: x,
      top: y,
      radius: 5,
      fill: strokeColor,
      selectable: false,
      evented: false,
      originX: "center",
      originY: "center",
    })

    let xx =
      ((x - this.scaleFactors[3]) /
        (canvasWidth - this.scaleFactors[3] - this.scaleFactors[5])) *
      this.scaleFactors[0]
    let yy =
      this.scaleFactors[1] -
      ((y - this.scaleFactors[4]) /
        (canvasHeight - this.scaleFactors[4] - this.scaleFactors[2])) *
        this.scaleFactors[1]
    this.tempCoordinatesText = new fabric.Text(
      `(${xx.toFixed(0)}, ${yy.toFixed(0)})`,
      //`(${x.toFixed(0)}, ${y.toFixed(0)})`,
      {
        left: x + 10,
        top: y + 10,
        fill: strokeColor,
        fontSize: 14,
        selectable: false,
        evented: false,
      }
    )

    this.tempCoordinates_group = new fabric.Group(
      [
        this.tempHorizontalLine,
        this.tempVerticalLine,
        this.tempCoordinateCircle,
        this.tempCoordinatesText,
      ],
      {
        selectable: false,
        evented: false,
      }
    )

    canvas.add(this.tempCoordinates_group)
    canvas.renderAll()
  }

  clearTemporaryObjects() {
    let canvas = this._canvas
    if (this.tempCoordinates_group) canvas.remove(this.tempCoordinates_group)
    //this.tempCoordinates_group= null
  }
}

export default CoordinateTool
