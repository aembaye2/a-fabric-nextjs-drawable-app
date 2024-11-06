//import dynamic from "next/dynamic"

/**
 * disable ssr to avoid pre-rendering issues of Next.js
 *
 * we're doing this because we're using a canvas element that can't be pre-rendered by Next.js on the server
 */

// const App = dynamic(() => import("./App"), {
//   ssr: false,
// })

// export default App

import NavBar from "./components/NavBar"

export default function Home() {
  return (
    <>
      <NavBar />
      <h1>Welcome to the Next.js App!</h1>
      <p>Choose a quiz from the navigation above.</p>
    </>
  )
}
