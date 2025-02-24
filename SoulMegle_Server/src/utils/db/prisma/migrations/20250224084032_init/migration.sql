/*
  Warnings:

  - You are about to drop the `ChatSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChatSession" DROP CONSTRAINT "ChatSession_user1Id_fkey";

-- DropForeignKey
ALTER TABLE "ChatSession" DROP CONSTRAINT "ChatSession_user2Id_fkey";

-- DropIndex
DROP INDEX "User_username_key";

-- DropTable
DROP TABLE "ChatSession";
