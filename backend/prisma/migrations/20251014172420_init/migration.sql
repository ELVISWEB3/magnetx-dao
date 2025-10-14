-- CreateTable
CREATE TABLE "submissions" (
    "id" BIGSERIAL NOT NULL,
    "form_name" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "user_agent" TEXT,
    "ip" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apply_submissions" (
    "id" BIGSERIAL NOT NULL,
    "full_name" TEXT,
    "x_profile_link" TEXT,
    "region" TEXT,
    "phone" TEXT,
    "niche" TEXT,
    "skills" TEXT,
    "other_skill" TEXT,
    "category" TEXT,
    "followers" TEXT,
    "reason" TEXT,
    "user_agent" TEXT,
    "ip" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" JSONB,

    CONSTRAINT "apply_submissions_pkey" PRIMARY KEY ("id")
);

