import { Dispatch, MutableRefObject, SetStateAction, useState } from "react"
import { TMessage } from "../types/agora"
import { RtmChannel } from "agora-rtm-sdk"

type Props = {
  userId: string
  channelRef: MutableRefObject<RtmChannel | undefined>
  setMessages: Dispatch<SetStateAction<TMessage[]>>
}

const InputMessage: React.FC<Props> = ({ userId, channelRef, setMessages }) => {
  const [input, setInput] = useState<string>("")

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input || !input.trim()) return

    await channelRef.current?.sendMessage({
      text: input,
    })

    setMessages((cur: TMessage[]) => [
      ...cur,
      {
        userId,
        message: input,
      },
    ])

    setInput("")
  }

  return (
    <form
      onSubmit={handleSubmitMessage}
      className="flex flex-col gap-2 w-full mt-5"
    >
      <input
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:outline-main"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></input>
      <button className="w-full text-white bg-main hover:bg-hover focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 focus:outline-none">
        submit
      </button>
    </form>
  )
}

export default InputMessage
