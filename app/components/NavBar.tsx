// app/components/NavBar.tsx
import Link from "next/link"
import styles from "./NavBar.module.css"

const NavBar = () => {
  return (
    <nav className={styles.nav}>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link href="/quiz1">Quiz 1</Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/quiz2">Quiz 2</Link>
        </li>
      </ul>
    </nav>
  )
}

export default NavBar
