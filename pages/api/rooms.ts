import {
  RtcRole,
  RtcTokenBuilder,
  RtmRole,
  RtmTokenBuilder,
} from "agora-access-token"
import type { NextApiRequest, NextApiResponse } from "next"
import { TRoom } from "../../types/room"
import prisma from "../../lib/prisma"
import { Room } from "@prisma/client"

type Data = {
  Rtctoken: string
  RtmToken: string
  generatedRoomId: string
}

const getRtmToken = (userId: string) => {
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

const getRtcToken = (roomId: string, userId: string) => {
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

const getAllOpenRooms = async () => {
  return await prisma.room.findMany({
    where: {
      status: "open",
    },
  })
}

const createRoom = async () => {
  return (await prisma.room.create({
    data: {},
  })) as TRoom
}

const joinRoom = async (roomId: number) => {
  return (await prisma.room.update({
    where: {
      id: Number(roomId),
    },
    data: {
      status: "closed",
    },
  })) as TRoom
}

const joinRoomNew = async (roomId: number) => {
  const room = await prisma.room.findFirst({
    where: {
      NOT: {
        id: Number(roomId),
      },
    },
  })
  if (!room) return createRoom()
  return joinRoom(room.id)
}

const deleteRoom = async (roomId: string) => {
  return await prisma.room.delete({
    where: {
      id: Number(roomId),
    },
  })
}

const updateRoom = async (roomId: string) => {
  return await prisma.room.update({
    where: {
      id: Number(roomId),
    },
    data: {
      status: "open",
    },
  })
}

const getNewRoom = async (roomId: string, rooms: Room[]) => {
  var room: TRoom =
    rooms.length === 0 ? await createRoom() : await joinRoomNew(Number(roomId))
  return room.id
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
    const newRoomId = await getNewRoom(roomId, rooms)
    const Rtctoken: string = getRtcToken(newRoomId.toString(), userId)
    const RtmToken: string = getRtmToken(userId)
    const generatedRoomId: string = newRoomId.toString()
    return res.status(200).json({ generatedRoomId, Rtctoken, RtmToken })
  }

  if (method === "DELETE") {
    deleteRoom(createdRoomId)
    return res.status(200)
  }

  if (method === "PUT") {
    const { room } = body
    updateRoom(room.roomId)
    return res.status(200)
  }

  var room: TRoom =
    rooms.length === 0 ? await createRoom() : await joinRoom(rooms[0].id)

  const Rtctoken: string = getRtcToken(room.id.toString(), userId)
  const RtmToken: string = getRtmToken(userId)
  const generatedRoomId: string = room.id.toString()

  res.status(200).json({ generatedRoomId, Rtctoken, RtmToken })
}
