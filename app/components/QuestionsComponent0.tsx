"use client"
import React, { useState } from "react"
import { saveAs } from "file-saver"
import html2canvas from "html2canvas"
import { PDFDocument, StandardFonts } from "pdf-lib"
import DrawingComponent from "./DrawingComponent"

const QuestionsComponent = ({ questions }) => {
  const [userAnswers, setUserAnswers] = useState({})
  const [fullname, setfullname] = useState("")

  const handleInputChange = (questionId, value) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const userInputData = questions.map((question, index) => ({
      ...question,
      "user-answer": userAnswers[index] || "",
    }))

    const json = JSON.stringify(userInputData, null, 2)
    const blob = new Blob([json], { type: "application/json" })

    saveAs(blob, "user-input.json")
  }

  const generateCanvasImage = async () => {
    const canvas = document.getElementById("canvas")
    if (canvas) {
      const canvasElement = await html2canvas(canvas)
      return canvasElement.toDataURL("image/png")
    }
    return ""
  }

  const handleGenerateHTML = async (e) => {
    e.preventDefault()

    const userInputData = questions.map((question, index) => ({
      ...question,
      "user-answer": userAnswers[index] || "",
    }))

    const canvasImage = await generateCanvasImage()

    const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Input</title>
    <style>
      .answer-box {
        overflow: auto; 
        border: 1px solid #ccc;
        padding: 10px;
        margin-bottom: 20px;
      }
      .small-answer-box { height: 50px; }
      .large-answer-box { height: 100px; }
      .graphing-canvas { width: 50%; height: auto; } /* Adjust the width to make the image smaller */
    </style>
  </head>
  <body>
    <h2> Full Name: ${fullname}</h2>
    ${userInputData
      .map(
        (question, index) => `
      <div>
        <h3>${index + 1}. ${question.label}</h3>
        ${
          question.qtype === "mc-quest"
            ? `<ul>${question.options
                .map((option) => `<li>${option}</li>`)
                .join("")}</ul>`
            : ""
        }
        <div class="answer-box ${
          question.qtype === "manylines-text-quest"
            ? "large-answer-box"
            : "small-answer-box"
        }">
          <p>Answer: ${question["user-answer"]}</p>
        </div>
        ${
          question.qtype === "graphing-quest" && canvasImage
            ? `<div><h3>Graphing Canvas</h3><img src="${canvasImage}" alt="Graphing Canvas" class="graphing-canvas"/></div>`
            : ""
        }
      </div>
    `
      )
      .join("")}
  </body>
  </html>
`

    const blob = new Blob([htmlContent], { type: "text/html" })
    saveAs(blob, "user-input.html")
  }

  const handleGeneratePDF = async (e) => {
    e.preventDefault()

    const userInputData = questions.map((question, index) => ({
      ...question,
      "user-answer": userAnswers[index] || "",
    }))

    const canvasImage = await generateCanvasImage()

    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const paddingLeft = 20
    const pageHeight = 800
    const pageWidth = 600
    let yOffset = pageHeight - 50

    const addNewPage = () => {
      const page = pdfDoc.addPage([pageWidth, pageHeight])
      yOffset = pageHeight - 50
      return page
    }

    let page = addNewPage()

    page.drawText(`Full Name: ${fullname}`, {
      x: paddingLeft,
      y: yOffset,
      size: 14,
      font: boldFont,
    })
    yOffset -= 40

    for (const [index, question] of userInputData.entries()) {
      if (yOffset < 100) {
        page = addNewPage()
      }

      page.drawText(`${index + 1}. ${question.label}`, {
        x: paddingLeft,
        y: yOffset,
        size: 12,
        font: font,
      })
      yOffset -= 20

      if (question.qtype === "mc-quest") {
        for (const option of question.options) {
          if (yOffset < 100) {
            page = addNewPage()
          }

          page.drawText(option, {
            x: paddingLeft + 20,
            y: yOffset,
            size: 10,
            font: font,
          })
          yOffset -= 15
        }
      }

      if (yOffset < 100) {
        page = addNewPage()
      }

      page.drawText(`Answer: ${question["user-answer"]}`, {
        x: paddingLeft,
        y: yOffset,
        size: 12,
        font: boldFont,
      })
      yOffset -= 30

      if (question.qtype === "graphing-quest" && canvasImage) {
        if (yOffset < 250) {
          page = addNewPage()
        }

        const pngImage = await pdfDoc.embedPng(canvasImage)
        page.drawImage(pngImage, {
          x: paddingLeft,
          y: yOffset - 200,
          width: 200,
          height: 200,
        })
        yOffset -= 250
      }
    }

    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes], { type: "application/pdf" })
    saveAs(blob, "user-input.pdf")
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        paddingLeft: "20px",
      }}
    >
      <div style={{ textAlign: "right", padding: "20px" }}>
        {/* <button type="submit">Generate json file</button> */}
        {/*<button type="button" onClick={handleGenerateHTML}>           Generate HTML         </button>*/}
        <button type="button" onClick={handleGeneratePDF}>
          Generate PDF
        </button>
      </div>
      <form onSubmit={handleSubmit} style={{ flex: "1" }}>
        <div style={{ marginBottom: "30px" }}>
          <label>
            Full Name:
            <input
              type="text"
              value={fullname}
              onChange={(e) => setfullname(e.target.value)}
              style={{ marginLeft: "10px", width: "400px", height: "35px" }}
            />
          </label>
        </div>
        {questions.map((question, index) => (
          <div key={index} style={{ marginBottom: "30px" }}>
            <label>
              {index + 1}. {question.label}
            </label>
            {question.qtype === "mc-quest" && (
              <div>
                {question.options.map((option, i) => (
                  <div key={i}>
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      onChange={() => handleInputChange(index, option)}
                    />
                    {option}
                  </div>
                ))}
              </div>
            )}
            {question.qtype === "float-num-quest" && (
              <div style={{ marginTop: "10px" }}>
                <input
                  type="number"
                  onChange={(e) => handleInputChange(index, e.target.value)}
                />
              </div>
            )}
            {question.qtype === "one-line-text-quest" && (
              <div style={{ marginTop: "10px" }}>
                <input
                  type="text"
                  maxLength={150}
                  style={{ width: "100%" }}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                />
              </div>
            )}
            {question.qtype === "manylines-text-quest" && (
              <div style={{ marginTop: "10px" }}>
                <textarea
                  maxLength={500}
                  style={{ width: "100%", height: "100px" }}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                />
              </div>
            )}
            {question.qtype === "graphing-quest" && (
              <div
                style={{
                  marginTop: "50px",
                  marginLeft: "50px",
                  marginBottom: "400px",
                }}
              >
                <DrawingComponent />
              </div>
            )}
          </div>
        ))}
      </form>
    </div>
  )
}

export default QuestionsComponent
