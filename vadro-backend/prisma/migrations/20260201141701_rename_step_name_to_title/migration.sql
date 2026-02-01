/*
  Warnings:

  - You are about to drop the column `name` on the `Step` table. All the data in the column will be lost.
  - Added the required column `title` to the `Step` table without a default value. This is not possible if the table is not empty.
  - Made the column `orderIndex` on table `Step` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Step" DROP COLUMN "name",
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "orderIndex" SET NOT NULL,
ALTER COLUMN "orderIndex" SET DEFAULT 0;
