import { NextApiRequest, NextApiResponse } from "next"
import prisma from "../../lib/prisma"

const getAllOpenRooms = async () => {
  return await prisma.room.findMany({
    where: {
      status: "open",
    },
  })
}

const deleteAllOpenRooms = async () => {
  return await prisma.room.deleteMany({
    where: {
      status: "open",
    },
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await deleteAllOpenRooms()
  const rooms = await getAllOpenRooms()

  res.status(200).end("Cron job ran successfully")
}
