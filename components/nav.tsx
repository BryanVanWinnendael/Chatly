/* eslint-disable @next/next/no-html-link-for-pages */
import { MdArrowBackIosNew } from "react-icons/md"

const Nav = () => {
  return (
    <div className="sm:fixed w-full mt-2 ml-2">
      <a className="flex items-center mt-2 max-w-fit cursor-pointer" href="/">
        <MdArrowBackIosNew size={20} color="#1f2935" />
        <p className="font-semibold text-xl">Home</p>
      </a>
    </div>
  )
}

export default Nav
