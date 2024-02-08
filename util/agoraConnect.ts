import {
  RtcRole,
  RtcTokenBuilder,
  RtmRole,
  RtmTokenBuilder,
} from "agora-access-token"
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

export const getRtmToken = (userId: string) => {
  const appID = process.env.NEXT_PUBLIC_AGORA_APP_ID!
  const appCertificate = process.env.AGORA_APP_CERT!
  const account = userId
  const expirationTimeInSeconds = 3600
  const currentTimestamp = Math.floor(Date.now() / 1000)
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds
  const token = RtmTokenBuilder.buildToken(
    appID,
    appCertificate,
    account,
    RtmRole.Rtm_User,
    privilegeExpiredTs
  )
  return token
}

export const getRtcToken = (roomId: string, userId: string) => {
  const appID = process.env.NEXT_PUBLIC_AGORA_APP_ID!
  const appCertificate = process.env.AGORA_APP_CERT!
  const channelName = roomId
  const account = userId
  const role = RtcRole.PUBLISHER
  const expirationTimeInSeconds = 3600
  const currentTimestamp = Math.floor(Date.now() / 1000)
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

  const token = RtcTokenBuilder.buildTokenWithAccount(
    appID,
    appCertificate,
    channelName,
    account,
    role,
    privilegeExpiredTs
  )

  return token
}
