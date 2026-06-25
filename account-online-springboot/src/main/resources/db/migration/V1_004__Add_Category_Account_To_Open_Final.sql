-- Migration: Add category_account to acc_online_open_final table
-- Date: 2026-06-24

ALTER TABLE acc_online_open_final ADD (
    category_account VARCHAR2(100)
);

COMMENT ON COLUMN acc_online_open_final.category_account IS 'Category Account selected by user (e.g. 6011)';

COMMIT;
