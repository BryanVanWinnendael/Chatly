import { useEffect, useRef, useState } from "react"
import { IoArrowDownCircleOutline } from "react-icons/io5"
import { TMessage } from "../types/agora"

type Props = {
  messages: TMessage[]
  userId: string
}

const Chat: React.FC<Props> = ({ messages, userId }) => {
  const chatListRef = useRef<HTMLUListElement | null>(null)
  const [autoScroll, setAutoScroll] = useState<boolean>(true)
  const [newMessage, setNewMessage] = useState<boolean>(false)

  useEffect(() => {
    if (messages.length === 0) {
      setNewMessage(false)
      setAutoScroll(true)
    }
  }, [messages])

  const convertToYouThem = (message: TMessage) => {
    return message.userId === userId ? "You" : "Them"
  }

  const handleScroll = () => {
    if (chatListRef.current) {
      const bottom =
        chatListRef.current.scrollHeight - chatListRef.current.scrollTop ===
        chatListRef.current.clientHeight
      setAutoScroll(bottom)
      if (bottom) setNewMessage(false)
    }
  }

  const scrollToBottom = () => {
    const element = document.querySelector("ul")

    if (element && autoScroll) {
      element.scrollTop = element.scrollHeight
      setNewMessage(false)
    } else setNewMessage(true)
  }

  useEffect(() => {
    scrollToBottom()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages])

  return (
    <div className="h-full w-full relative mt-2 pt-2 ml-5">
      {newMessage && (
        <div className="w-full absolute bottom-10 flex justify-center">
          <IoArrowDownCircleOutline
            size={30}
            color="#1f2935"
            className="cursor-pointer"
            onClick={() => {
              const element = document.querySelector("ul")
              if (element) {
                element.style.scrollBehavior = "smooth"
                element.scrollTop = element.scrollHeight
                setNewMessage(false)
                element.style.scrollBehavior = ""
              }
            }}
          />
        </div>
      )}

      <ul
        ref={chatListRef}
        onScroll={handleScroll}
        className="w-full mr-5 break-words max-h-[580px] overflow-scroll overflow-x-hidden scrollbar"
      >
        {messages.map((message, idx) => (
          <li key={idx}>
            {convertToYouThem(message)} - {message.message}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Chat
