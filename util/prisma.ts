import { TRoom } from "../types/room"
import prisma from "../lib/prisma"
import { Room } from "@prisma/client"

export const getAllOpenRooms = async () => {
  return await prisma.room.findMany({
    where: {
      status: "open",
    },
  })
}

export const createRoom = async () => {
  return (await prisma.room.create({
    data: {},
  })) as TRoom
}

export const joinRoom = async (rooms: any) => {
  console.log(rooms)
  const smallestRoomId = rooms.reduce((acc: TRoom, cur: TRoom) =>
    acc.id < cur.id ? acc : cur
  ).id

  return (await prisma.room.update({
    where: {
      id: Number(smallestRoomId),
    },
    data: {
      status: "closed",
    },
  })) as TRoom
}

export const joinRoomNew = async (roomId: number) => {
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

export const deleteRoom = async (roomId: string) => {
  return await prisma.room.delete({
    where: {
      id: Number(roomId),
    },
  })
}

export const updateRoom = async (roomId: string) => {
  return await prisma.room.update({
    where: {
      id: Number(roomId),
    },
    data: {
      status: "open",
    },
  })
}

export const getNewRoom = async (roomId: string, rooms: Room[]) => {
  var room: TRoom =
    rooms.length === 0 ? await createRoom() : await joinRoomNew(Number(roomId))
  return room.id
}
