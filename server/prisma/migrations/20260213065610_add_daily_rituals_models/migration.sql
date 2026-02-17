-- CreateTable
CREATE TABLE "DailyRitual" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'fas fa-sun',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyRitual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DarshanTiming" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "timeRange" TEXT NOT NULL DEFAULT '07:00 AM - 01:00 PM',
    "type" TEXT NOT NULL DEFAULT 'General',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DarshanTiming_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TempleFact" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'fas fa-info-circle',
    "colorClass" TEXT NOT NULL DEFAULT 'primary',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TempleFact_pkey" PRIMARY KEY ("id")
);
