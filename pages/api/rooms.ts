import type { NextApiRequest, NextApiResponse } from "next"
import { TRoom } from "../../types/room"
import {
  createRoom,
  deleteRoom,
  getAllOpenRooms,
  getNewRoom,
  joinRoom,
  updateRoom,
} from "../../util/prisma"
import { getRtcToken, getRtmToken } from "../../util/agoraConnect"
import { Data } from "../../types/agora"

const handleGet = async (roomId: string, userId: string, rooms: any) => {
  const newRoomId = await getNewRoom(roomId, rooms)
  const Rtctoken: string = getRtcToken(newRoomId.toString(), userId)
  const RtmToken: string = getRtmToken(userId)
  const generatedRoomId: string = newRoomId.toString()
  return { generatedRoomId, Rtctoken, RtmToken }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { method, query, body } = req
  const { userId, createdRoomId, roomId } = query as {
    userId: string
    createdRoomId: string
    roomId: string
  }
  const rooms = await getAllOpenRooms()

  if (method === "GET" && roomId && userId) {
    const { generatedRoomId, Rtctoken, RtmToken } = await handleGet(
      roomId,
      userId,
      rooms
    )
    return res.status(200).json({ generatedRoomId, Rtctoken, RtmToken })
  } else if (method === "DELETE") {
    deleteRoom(createdRoomId)
    return res.status(200)
  } else if (method === "PUT") {
    const { room } = body
    updateRoom(room.roomId)
    return res.status(200)
  } else {
    var room: TRoom =
      rooms.length === 0 ? await createRoom() : await joinRoom(rooms)

    const Rtctoken: string = getRtcToken(room.id.toString(), userId)
    const RtmToken: string = getRtmToken(userId)
    const generatedRoomId: string = room.id.toString()

    res.status(200).json({ generatedRoomId, Rtctoken, RtmToken })
  }
}
