import {
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IRemoteVideoTrack,
} from "agora-rtc-sdk-ng"

export const connectToAgoraRtc = async (
  roomId: string,
  userId: string,
  onVideoConnect: (video: IRemoteVideoTrack) => void,
  onWebcamConnect: (camera: ICameraVideoTrack) => void,
  token: string,
  onLeave: (roomId: number) => Promise<void>,
  removeRoom: (users: IAgoraRTCRemoteUser[], roomdId: number) => Promise<void>
) => {
  const { default: AgoraRTC } = await import("agora-rtc-sdk-ng")
  const client = AgoraRTC.createClient({
    mode: "rtc",
    codec: "vp8",
  })
  await client.join(
    process.env.NEXT_PUBLIC_AGORA_APP_ID as string,
    roomId,
    token,
    userId
  )

  client.on("user-published", (otherUser, mediaType) => {
    client.subscribe(otherUser, mediaType).then(() => {
      if (mediaType === "video") {
        if (otherUser.videoTrack) onVideoConnect(otherUser.videoTrack)
      }
      if (mediaType === "audio") {
        otherUser.audioTrack?.play()
      }
    })
  })

  const tracks = await AgoraRTC.createMicrophoneAndCameraTracks()
  onWebcamConnect(tracks[1])
  await client.publish(tracks).then(() => {
    removeRoom(client.remoteUsers, Number(roomId))
  })

  client.on("user-left", () => {
    onLeave(Number(roomId))
  })

  return { tracks, client }
}

export const connectToAgoraRtm = async (
  roomId: string,
  userId: string,
  token: string,
  onMessage: ({
    userId,
    message,
  }: {
    userId: string
    message: string | undefined
  }) => void
) => {
  const { default: AgoraRTM } = await import("agora-rtm-sdk")
  const client = AgoraRTM.createInstance(
    process.env.NEXT_PUBLIC_AGORA_APP_ID as string
  )

  await client.login({
    uid: userId,
    token,
  })

  const channel = client.createChannel(roomId)
  await channel.join()

  channel.on("ChannelMessage", (message, userId) => {
    onMessage({
      userId,
      message: message.text,
    })
  })

  return { channel }
}
