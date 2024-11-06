// app/quiz2/page.tsx

import Link from "next/link"
import NavBar from "../components/NavBar"
import React from "react"
import QuestionsComponent from "../components/QuestionsComponent"
import data from "./questions2.json" // Import the JSON file

export default function Quiz2() {
  return (
    <div>
      <NavBar />
      <h1>Quiz 2</h1>
      <QuestionsComponent questions={data.questions} />
      <Link href="/">Go back to Home</Link>
    </div>
  )
}
