-- Migration: 20260630_pr_review_fixes
-- 1. Prevent duplicate invoice drafts for the same employee/project/period.
-- 2. Enforce file size and MIME type limits on the expense-receipts bucket.

ALTER TABLE invoices
  ADD CONSTRAINT invoices_employee_project_period_unique
  UNIQUE (employee_id, project_id, period_start, period_end);

UPDATE storage.buckets
SET file_size_limit    = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
WHERE id = 'expense-receipts';
