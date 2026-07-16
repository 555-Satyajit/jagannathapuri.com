/*
  Warnings:

  - You are about to drop the `BlogPost` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "BlogPost";

-- CreateTable
CREATE TABLE "LibraryCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryTag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryContent" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subtitle" TEXT,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "image" TEXT,
    "author" TEXT NOT NULL DEFAULT 'Jagannathapuri Team',
    "categoryId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LibraryContentTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "LibraryCategory_name_key" ON "LibraryCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryCategory_slug_key" ON "LibraryCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryTag_name_key" ON "LibraryTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryTag_slug_key" ON "LibraryTag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryContent_slug_key" ON "LibraryContent"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_LibraryContentTags_AB_unique" ON "_LibraryContentTags"("A", "B");

-- CreateIndex
CREATE INDEX "_LibraryContentTags_B_index" ON "_LibraryContentTags"("B");

-- AddForeignKey
ALTER TABLE "LibraryContent" ADD CONSTRAINT "LibraryContent_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "LibraryCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LibraryContentTags" ADD CONSTRAINT "_LibraryContentTags_A_fkey" FOREIGN KEY ("A") REFERENCES "LibraryContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LibraryContentTags" ADD CONSTRAINT "_LibraryContentTags_B_fkey" FOREIGN KEY ("B") REFERENCES "LibraryTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
