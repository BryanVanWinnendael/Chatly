import React, { ReactElement } from "react"
import Nav from "./nav"
import { useRouter } from "next/router"

const Layout = ({ children }: { children: ReactElement }) => {
  const { route } = useRouter()
  return (
    <div>
      {route == "/room" && <Nav />}

      {children}
    </div>
  )
}

export default Layout
