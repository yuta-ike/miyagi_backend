-- CreateEnum
CREATE TYPE "BotResponseType" AS ENUM ('NOT_POSTED', 'USER_RECOMMENDATION', 'ADMINISTRATIVE_SUPPORT_RECOMMENDATION');

-- CreateTable
CREATE TABLE "Parent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "icon_id" INTEGER NOT NULL,
    "birthday" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChaildInfo" (
    "id" SERIAL NOT NULL,
    "parent_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "barthday" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChaildInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Icon" (
    "id" SERIAL NOT NULL,
    "image_url" TEXT NOT NULL,

    CONSTRAINT "Icon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dairy" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "emotion" INTEGER NOT NULL,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bot_response_type" "BotResponseType" NOT NULL,

    CONSTRAINT "Dairy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotResponse" (
    "type" "BotResponseType" NOT NULL,
    "comment" TEXT NOT NULL,
    "pattern" INTEGER,
    "link" TEXT,

    CONSTRAINT "BotResponse_pkey" PRIMARY KEY ("type")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Matching" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Matching_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchingUser" (
    "id" SERIAL NOT NULL,
    "matching_id" INTEGER NOT NULL,
    "match_user_id" TEXT NOT NULL,

    CONSTRAINT "MatchingUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" SERIAL NOT NULL,
    "send_user_id" TEXT NOT NULL,
    "matching_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DairyToTag" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_MatchingToTag" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DairyToTag_AB_unique" ON "_DairyToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_DairyToTag_B_index" ON "_DairyToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MatchingToTag_AB_unique" ON "_MatchingToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_MatchingToTag_B_index" ON "_MatchingToTag"("B");

-- AddForeignKey
ALTER TABLE "Parent" ADD CONSTRAINT "Parent_icon_id_fkey" FOREIGN KEY ("icon_id") REFERENCES "Icon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChaildInfo" ADD CONSTRAINT "ChaildInfo_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Parent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dairy" ADD CONSTRAINT "Dairy_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Parent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dairy" ADD CONSTRAINT "Dairy_bot_response_type_fkey" FOREIGN KEY ("bot_response_type") REFERENCES "BotResponse"("type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchingUser" ADD CONSTRAINT "MatchingUser_matching_id_fkey" FOREIGN KEY ("matching_id") REFERENCES "Matching"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchingUser" ADD CONSTRAINT "MatchingUser_match_user_id_fkey" FOREIGN KEY ("match_user_id") REFERENCES "Parent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_send_user_id_fkey" FOREIGN KEY ("send_user_id") REFERENCES "Parent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_matching_id_fkey" FOREIGN KEY ("matching_id") REFERENCES "Matching"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DairyToTag" ADD CONSTRAINT "_DairyToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Dairy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DairyToTag" ADD CONSTRAINT "_DairyToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MatchingToTag" ADD CONSTRAINT "_MatchingToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Matching"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MatchingToTag" ADD CONSTRAINT "_MatchingToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
