-- CreateTable
CREATE TABLE "setupState" (
    "id" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "setupState_pkey" PRIMARY KEY ("id")
);

-- Only the singleton row with id = 1 is allowed.
ALTER TABLE public."setupState"
ADD CONSTRAINT "setupState_singleton"
CHECK ("id" = 1);

-- Initialize setup as incomplete.
INSERT INTO public."setupState" ("id", "completedAt")
VALUES (1, NULL);

-- The application can read setup status and mark completion.
GRANT SELECT
ON TABLE public."setupState"
TO homehub_app;

GRANT UPDATE ("completedAt")
ON TABLE public."setupState"
TO homehub_app;
