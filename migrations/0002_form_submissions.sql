-- The form builder's table (/api/form/, src/pages/api/form.ts).
-- Copied from FORM_SUBMISSIONS_DDL in src/lib/church-form.ts; church-form.test.ts
-- fails if the two differ, so edit the DDL there and copy it here.
--
-- Apply it with:
--   npx wrangler d1 migrations apply fbc-auburn-contact --remote
-- (the same CONTACT_DB database as 0001, so one apply creates both tables)

CREATE TABLE IF NOT EXISTS form_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  received_at TEXT NOT NULL,
  form_id TEXT NOT NULL,
  form_title TEXT NOT NULL,
  recipient TEXT NOT NULL,
  mode TEXT NOT NULL,
  name TEXT,
  email TEXT,
  answers TEXT,
  -- Whether the notification email was accepted. A row with notified = 0 is a
  -- message that still needs reading here.
  notified INTEGER NOT NULL DEFAULT 0,
  notify_error TEXT,
  -- 1 once a prayer request's words have been removed after a good send.
  cleared INTEGER NOT NULL DEFAULT 0,
  country TEXT
);
CREATE INDEX IF NOT EXISTS form_submissions_received_at
  ON form_submissions (received_at DESC);
