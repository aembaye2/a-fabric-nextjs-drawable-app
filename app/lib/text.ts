import { fabric } from "fabric"
import FabricTool, { ConfigureCanvasProps } from "./fabrictool"

class TextTool extends FabricTool {
  // eslint-disable-next-line
  configureCanvas({}: ConfigureCanvasProps): () => void {
    this._canvas.isDrawingMode = false
    this._canvas.selection = false
    this._canvas.forEachObject((o) => (o.selectable = o.evented = false))

    this._canvas.on("mouse:down", (e: any) => this.onMouseDown(e))
    return () => {
      this._canvas.off("mouse:down")
    }
  }

  onMouseDown(o: any) {
    let canvas = this._canvas
    let _clicked = o.e["button"]
    var pointer = canvas.getPointer(o.e)

    if (_clicked === 0) {
      const userInput = prompt("Enter text:")
      if (userInput) {
        let text = new fabric.IText(userInput, {
          left: pointer.x,
          top: pointer.y,
          fontSize: 25,
          selectable: false,
          evented: false,
        })
        canvas.add(text)
      }
    }
  }
}

export default TextTool
