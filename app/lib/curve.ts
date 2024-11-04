import { fabric } from "fabric"
import FabricTool, { ConfigureCanvasProps } from "./fabrictool"
import * as d3 from "d3"

class CurveTool extends FabricTool {
  isMouseDown: boolean = false
  fillColor: string = "#ffffff00" //"#ffffff"
  strokeWidth: number = 10
  strokeColor: string = "#ffffff"
  startCircle: fabric.Circle = new fabric.Circle()
  curvePath: fabric.Path = new fabric.Path()
  tempCurvePath: fabric.Path = new fabric.Path()
  controlPoints: number[][] = []
  points: number[][] = []
  tempCurve: fabric.Path = new fabric.Path()
  finalCurve: fabric.Path = new fabric.Path()
  _pathString: string = "M "

  configureCanvas({
    strokeWidth,
    strokeColor,
    fillColor,
  }: ConfigureCanvasProps): () => void {
    this._canvas.isDrawingMode = false
    this._canvas.selection = false
    this._canvas.forEachObject((o) => (o.selectable = o.evented = false))

    this.strokeWidth = strokeWidth
    this.strokeColor = strokeColor
    this.fillColor = fillColor

    this._canvas.on("mouse:down", (e: any) => this.onMouseDown(e))
    this._canvas.on("mouse:move", (e: any) => this.onMouseMove(e))
    this._canvas.on("mouse:up", (e: any) => this.onMouseUp(e))
    this._canvas.on("mouse:out", (e: any) => this.onMouseOut(e))
    //this._canvas.on("mouse:dblclick", (e: any) => this.onMouseDoubleClick(e))
    return () => {
      this._canvas.off("mouse:down")
      this._canvas.off("mouse:move")
      this._canvas.off("mouse:up")
      this._canvas.off("mouse:out")
      //this._canvas.off("mouse:dblclick")
    }
  }

  onMouseDown(o: any) {
    let canvas = this._canvas
    let _clicked = o.e["button"]
    let _start = false
    if (this._pathString === "M ") {
      _start = true
    }

    this.isMouseDown = true
    var pointer = canvas.getPointer(o.e)

    this.points.push([pointer.x, pointer.y])

    if (_start && _clicked === 0) {
      // Initialize pathString
      //this._pathString += `${pointer.x} ${pointer.y} `
      this.controlPoints.push([pointer.x, pointer.y])
      this._pathString = this.generateCurvePathData(this.controlPoints)
      this.startCircle = new fabric.Circle({
        left: pointer.x,
        top: pointer.y,
        originX: "center",
        originY: "center",
        strokeWidth: this.strokeWidth,
        stroke: this.strokeColor,
        fill: this.strokeColor,
        selectable: false,
        evented: false,
        radius: this.strokeWidth,
      })
      canvas.add(this.startCircle)

      _start = false
    } else {
      //canvas.remove(this.finalCurve)
      if (_clicked === 0) {
        //if left mouse clicked
        // Update pathString
        //this._pathString += `L ${pointer.x} ${pointer.y} `
        this.controlPoints.push([pointer.x, pointer.y])
        this._pathString = this.generateCurvePathData(this.controlPoints)
      }
      if (_clicked === 2) {
        //if right mouse clicked, Close pathString
        //this._pathString += "z"
        this.controlPoints.push([pointer.x, pointer.y])
        this._pathString = this.generateCurvePathData(this.controlPoints)
        canvas.remove(this.startCircle)
      }
    }

    if (_clicked === 2) {
      canvas.remove(this.tempCurve)
      //canvas.remove(this.finalCurve)
      this.finalCurve = new fabric.Path(this._pathString, {
        strokeWidth: this.strokeWidth,
        fill: "", //this.fillColor,
        stroke: this.strokeColor,
        // originX: "center",
        // originY: "center",
        selectable: false,
        evented: false,
      })
      if (this.finalCurve.width !== 0 && this.finalCurve.height !== 0) {
        canvas.add(this.finalCurve)
        //canvas.renderAll()
      }

      this._pathString = "M "
      this.controlPoints = []
      this.points = []
    }
  }

  onMouseMove(o: any) {
    if (!this.isMouseDown) return //means that if the mouse is not pressed, do nothing; but if it is pressed and moved, then do the commands below
    let canvas = this._canvas
    var pointer = canvas.getPointer(o.e)
    // this.tempCurve.set({ x2: pointer.x, y2: pointer.y })
    // this.tempCurve.setCoords()
    this.points.push([pointer.x, pointer.y])
    var linePath = this.generateCurvePathData(this.points)
    canvas.remove(this.tempCurve)
    this.tempCurve = new fabric.Path(linePath, {
      strokeWidth: this.strokeWidth,
      fill: "", //this.fillColor,
      stroke: this.strokeColor,
      // originX: "center",
      // originY: "center",
      selectable: false,
      evented: false,
    })
    canvas.add(this.tempCurve)
    //canvas.renderAll()
    this.points.pop()
  }

  onMouseUp(o: any) {
    this.isMouseDown = true
  }

  onMouseOut(o: any) {
    this.isMouseDown = false
  }

  // onMouseDoubleClick(o: any) {
  //   let canvas = this._canvas
  //   // Double click adds two more points at the end, so we have to move back twice more...
  //   for (let i = 0; i < 3; i++) {
  //     let _last_pt_idx = this._pathString.lastIndexOf("L")
  //     if (_last_pt_idx === -1) {
  //       this._pathString = "M "
  //       canvas.remove(this.startCircle)
  //     } else {
  //       this._pathString = this._pathString.slice(0, _last_pt_idx)
  //     }
  //   }

  //   canvas.remove(this.tempCurve)
  //   canvas.remove(this.finalCurve)
  //   this.finalCurve = new fabric.Path(this._pathString, {
  //     strokeWidth: this.strokeWidth,
  //     fill: "#ffffff00", //this.fillColor,
  //     stroke: this.strokeColor,
  //     originX: "center",
  //     originY: "center",
  //     selectable: false,
  //     evented: false,
  //   })
  //   canvas.add(this.finalCurve)
  // }

  private generateCurvePathData(controlPoints: number[][]): string {
    var lineGenerator = d3.line().curve(d3.curveCatmullRom.alpha(0.5))
    //@ts-ignore
    return lineGenerator(controlPoints)
  }
}

export default CurveTool
