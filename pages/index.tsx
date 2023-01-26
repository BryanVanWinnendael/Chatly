import Head from "next/head"
import Link from "next/link"
import HomeImage from "../public/home.svg"
import Image from "next/image"

export default function Home() {
  return (
    <>
      <Head>
        <title>Chatly</title>
        <meta name="description" content="Chatly video chat" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col justify-center items-center m-5">
        <div className="w-1/3 mt-5">
          <Image src={HomeImage} alt="home-image" />
        </div>
        <p className="text-5xl font-bold mt-5">Chatly</p>
        <p className="text-base font-semibold mt-2 mb-5">
          Join a room and chat with people from over the world!
        </p>

        <Link
          href="/room"
          className="w-28 text-center text-white bg-main hover:bg-hover focus:ring-4 font-medium rounded-lg text-lg px-1 py-1 mr-2 mb-2 focus:outline-none"
        >
          Join a room
        </Link>
      </main>
    </>
  )
}
