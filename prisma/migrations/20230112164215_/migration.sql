-- CreateTable
CREATE TABLE "Room" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);
