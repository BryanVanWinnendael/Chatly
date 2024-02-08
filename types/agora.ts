export interface TMessage {
  userId: string
  message: string | undefined
}

export interface Data {
  Rtctoken: string
  RtmToken: string
  generatedRoomId: string
}
