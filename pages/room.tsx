import { useEffect, useRef, useState } from "react"
import {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IRemoteVideoTrack,
} from "agora-rtc-sdk-ng"
import VideoPlayer from "../components/videoPlayer"
import { connectToAgoraRtc, connectToAgoraRtm } from "../util/agoraConnect"
import { TMessage } from "../types/agora"
import { fetcher } from "../utils/fetcher"
import Chat from "../components/chat"
import InputMessage from "../components/inputMessage"
import { RtmChannel } from "agora-rtm-sdk"

const Room = () => {
  const userId = (Math.random() * 1e6 + "").replace(".", "")
  const [remoteUserVideo, setRemoteUserVideo] = useState<IRemoteVideoTrack>()
  const [webcamVideo, setWebcamVideo] = useState<ICameraVideoTrack>()
  const [messages, setMessages] = useState<TMessage[]>([])
  const channelRef = useRef<RtmChannel>()
  const rtcClientRef = useRef<IAgoraRTCClient>()
  const [showNext, setShowNext] = useState<boolean>(false)
  const [roomId, setRoomId] = useState<string>("")
  const [channel, setChannel] = useState<RtmChannel>()

  const getRandomRoom = async (userId: string) => {
    return await fetcher(`/api/rooms?userId=${userId}`, "GET").then(
      (response) => response.json()
    )
  }

  const getNewRandomRoom = async () => {
    return await fetcher(
      `/api/rooms?roomId=${roomId}&userId=${userId}`,
      "GET"
    ).then((response) => response.json())
  }

  const deleteRoom = async (
    room: IAgoraRTCRemoteUser[],
    givenRoomId: number
  ) => {
    if (room.length === 0) {
      const body: {} = {
        roomId: givenRoomId,
      }

      await fetcher("/api/rooms", "PUT", { room: body })
      handleJoin()
    }
  }

  const handleOtherLeave = async (givenRoomId: number) => {
    console.log("other leave")
    const body: {} = {
      roomId: givenRoomId,
    }

    setMessages([])
    setRemoteUserVideo(undefined)

    await fetcher("/api/rooms", "PUT", { room: body })
  }

  const handleCreateRoom = async (
    generatedRoomId: any,
    Rtctoken: any,
    RtmToken: any
  ) => {
    setRoomId(generatedRoomId)

    const { channel } = await connectToAgoraRtm(
      generatedRoomId,
      userId,
      RtmToken,
      (message: TMessage) => setMessages((cur) => [...cur, message])
    )
    setChannel(channel)
    channelRef.current = channel

    const { tracks, client } = await connectToAgoraRtc(
      generatedRoomId,
      userId,
      setRemoteUserVideo,
      setWebcamVideo,
      Rtctoken,
      handleOtherLeave,
      deleteRoom
    )

    rtcClientRef.current = client
  }

  const handleJoin = async () => {
    if (!userId) return
    const { generatedRoomId, Rtctoken, RtmToken } = await getRandomRoom(userId)
    handleCreateRoom(generatedRoomId, Rtctoken, RtmToken)
  }

  const handleSkip = async () => {
    if (channel) {
      channel.leave()
    }

    setRemoteUserVideo(undefined)
    setMessages([])
    rtcClientRef.current?.leave()

    const { generatedRoomId, Rtctoken, RtmToken } = await getNewRandomRoom()
    handleCreateRoom(generatedRoomId, Rtctoken, RtmToken)
  }

  useEffect(() => {
    handleJoin()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => {
      setRoomId("")
      const disconnect = async () => {
        if (channel) {
          channel.leave()
        }
      }
      disconnect()
    }
  }, [channel])

  return (
    <div className="flex flex-col justify-center items-center w-screen gap-2 h-screen">
      <div className="max-w-3xl mt-5 h-full grid sm:grid-cols-2 grid-cols-1 justify-center p-5">
        <div className="flex justify-center flex-col gap-2 h-full">
          {remoteUserVideo && (
            <div
              className="relative"
              onMouseLeave={() => setShowNext(false)}
              onMouseEnter={() => setShowNext(true)}
              onClick={handleSkip}
            >
              <VideoPlayer
                style={{ width: 310, height: 310, borderRadius: "10px" }}
                videoTrack={remoteUserVideo}
              />
              {showNext && (
                <div className="w-full h-full cursor-pointer bg-gray-500 opacity-40 absolute top-0 left-0 rounded-[10px] flex justify-center items-center">
                  <p className="text-2xl font-bold">Skip</p>
                </div>
              )}
            </div>
          )}

          {!remoteUserVideo && (
            <div className="w-[310px] h-[310px] border-2 rounded-[10px] mx-auto mt-20">
              <div className="flex animate-pulse flex-row items-center h-full justify-center space-x-5">
                <div className="w-24 bg-gray-300 h-24 rounded-full"></div>
              </div>
            </div>
          )}

          {webcamVideo && (
            <VideoPlayer
              videoTrack={webcamVideo}
              style={{ width: 310, height: 310 }}
            />
          )}
        </div>
        <div className="row-start-3 sm:row-auto w-full">
          <Chat messages={messages} userId={userId} />
        </div>
        <div className="w-full col-span-2">
          {remoteUserVideo && (
            <InputMessage
              userId={userId}
              setMessages={setMessages}
              channelRef={channelRef}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Room
