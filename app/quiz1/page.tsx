// app/quiz1/page.tsx
import Link from "next/link"
import NavBar from "../components/NavBar"
import React from "react"
import QuestionsComponent from "../components/QuestionsComponent"
import data from "./questions1.json" // Import the JSON file

export default function Quiz1() {
  return (
    <div>
      <NavBar />
      <h1>Quiz 1</h1>
      <QuestionsComponent questions={data.questions} />
      <Link href="/">Go back to Home</Link>
    </div>
  )
}
