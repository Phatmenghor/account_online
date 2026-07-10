-- Migration: Add individual field columns to pending account table
-- Date: 2026-05-11
-- Purpose: Store all customer data as individual columns matching AccountOnlineFinal structure

ALTER TABLE acc_online_pending_account_opening ADD (
    -- LEGAL / NID INFO
    legal_doc_name VARCHAR2(100),
    legal_holder_name VARCHAR2(255),
    legal_first_name_en VARCHAR2(100),
    legal_last_name_en VARCHAR2(100),
    legal_first_name_kh VARCHAR2(100),
    legal_last_name_kh VARCHAR2(100),
    legal_date_of_birth DATE,
    legal_gender VARCHAR2(20),
    legal_address VARCHAR2(500),
    legal_place_of_birth VARCHAR2(255),
    legal_issued_date DATE,
    legal_expired_date DATE,
    legal_mrz1 VARCHAR2(255),
    legal_mrz2 VARCHAR2(255),
    legal_mrz3 VARCHAR2(255),

    -- CUSTOMER INFO
    title VARCHAR2(50),
    marital_status VARCHAR2(50),
    nationality VARCHAR2(50),
    company_name VARCHAR2(255),
    occupation VARCHAR2(100),
    industry VARCHAR2(100),
    sector VARCHAR2(100),
    average_income VARCHAR2(100),
    phone_number VARCHAR2(20),
    email VARCHAR2(255),
    customer_type VARCHAR2(50),

    -- CURRENT ADDRESS
    customer_province_code VARCHAR2(10),
    customer_province VARCHAR2(100),
    customer_district_code VARCHAR2(10),
    customer_district VARCHAR2(100),
    customer_commune_code VARCHAR2(10),
    customer_commune VARCHAR2(100),
    customer_village_code VARCHAR2(10),
    customer_village VARCHAR2(100),

    -- PLACE OF BIRTH
    customer_pob_province_code VARCHAR2(10),
    customer_pob_province VARCHAR2(100),
    customer_pob_district_code VARCHAR2(10),
    customer_pob_district VARCHAR2(100),
    customer_pob_commune_code VARCHAR2(10),
    customer_pob_commune VARCHAR2(100),
    customer_pob_village_code VARCHAR2(10),
    customer_pob_village VARCHAR2(100),

    -- BRANCH INFO
    branch_code VARCHAR2(50),
    branch_name_kh VARCHAR2(255),

    -- BANKING INFO
    product_account VARCHAR2(100),
    category_account VARCHAR2(100),
    customer_role VARCHAR2(100),
    loan_officer VARCHAR2(255),
    released_by VARCHAR2(255),

    -- IMAGES
    nid_image_name VARCHAR2(255),
    selfie_image_name VARCHAR2(255),

    -- AML DETAILS
    aml_risk_level VARCHAR2(50),
    aml_action_taken VARCHAR2(100),
    aml_total_rules_score NUMBER(10),
    aml_trxn_id VARCHAR2(100),
    service_name VARCHAR2(255),
    aml_rules_triggered CLOB
);

-- Add comments for documentation
COMMENT ON COLUMN acc_online_pending_account_opening.legal_doc_name IS 'Legal document type (e.g., NATIONAL.ID)';
COMMENT ON COLUMN acc_online_pending_account_opening.legal_first_name_en IS 'Legal holder first name in English';
COMMENT ON COLUMN acc_online_pending_account_opening.legal_last_name_en IS 'Legal holder last name in English';
COMMENT ON COLUMN acc_online_pending_account_opening.legal_first_name_kh IS 'Legal holder first name in Khmer';
COMMENT ON COLUMN acc_online_pending_account_opening.legal_last_name_kh IS 'Legal holder last name in Khmer';
COMMENT ON COLUMN acc_online_pending_account_opening.nid_image_name IS 'National ID image file name';
COMMENT ON COLUMN acc_online_pending_account_opening.selfie_image_name IS 'Selfie photo file name';
COMMENT ON COLUMN acc_online_pending_account_opening.aml_risk_level IS 'AML risk level (Low, Medium, High)';
COMMENT ON COLUMN acc_online_pending_account_opening.aml_total_rules_score IS 'AML screening total rules score';

COMMIT;
