import { fabric } from "fabric"
import FabricTool, { ConfigureCanvasProps } from "./fabrictool"

class TextTool extends FabricTool {
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
      let text = new fabric.IText("", {
        left: pointer.x,
        top: pointer.y,
        fontSize: 25,
        selectable: true,
        evented: true,
      })
      canvas.add(text)
      canvas.setActiveObject(text)
      text.enterEditing()
      text.hiddenTextarea.focus()
    }
  }
}

export default TextTool
