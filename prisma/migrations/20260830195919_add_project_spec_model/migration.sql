-- CreateTable
CREATE TABLE "ProjectSpec" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectSpec_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectSpec_filePath_key" ON "ProjectSpec"("filePath");

-- CreateIndex
CREATE INDEX "ProjectSpec_projectId_idx" ON "ProjectSpec"("projectId");

-- CreateIndex
CREATE INDEX "ProjectSpec_createdAt_idx" ON "ProjectSpec"("createdAt");
