package com.internal.feature.sms_otp.repository;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Repository for querying MB Core (Oracle MB UAT) to check
 * if a phone number is already registered as an active MB customer.
 */
@Repository
@Slf4j
public class PhoneCheckRepository {

    private final JdbcTemplate mblinkJdbcTemplate;

    public PhoneCheckRepository(@Qualifier("mblinkJdbcTemplate") JdbcTemplate mblinkJdbcTemplate) {
        this.mblinkJdbcTemplate = mblinkJdbcTemplate;
    }

    /**
     * Check if a phone number belongs to an active MB customer.
     * Tries direct table query first, then falls back to @stg_mblink DB link query if needed.
     *
     * @param phone the phone number to check
     * @return Map with "cif" and "mobile" keys if found, or null if not found
     */
    public Map<String, String> findActiveMbCustomerByPhone(String phone) {
        String sqlDirect =
            "SELECT a.cif_core AS cif, a.cus_name AS cus_name, b.received_otp AS mobile " +
            "FROM mb_customer a " +
            "INNER JOIN mb_mobiles b ON a.cus_id = b.cus_id " +
            "WHERE a.cus_status = '3' " +
            "  AND b.received_otp = ? " +
            "ORDER BY a.cif_core DESC";

        String sqlDbLink =
            "SELECT a.cif_core AS cif, a.cus_name AS cus_name, b.received_otp AS mobile " +
            "FROM mb_customer@stg_mblink a " +
            "INNER JOIN mb_mobiles@stg_mblink b ON a.cus_id = b.cus_id " +
            "WHERE a.cus_status = '3' " +
            "  AND b.received_otp = ? " +
            "ORDER BY a.cif_core DESC";

        try {
            List<Map<String, Object>> rows = mblinkJdbcTemplate.queryForList(sqlDirect, phone);
            return extractFirstRow(rows);
        } catch (Exception e) {
            log.warn("Direct query without DB link failed for {}, trying DB link query: {}", phone, e.getMessage());
            try {
                List<Map<String, Object>> rows = mblinkJdbcTemplate.queryForList(sqlDbLink, phone);
                return extractFirstRow(rows);
            } catch (Exception ex) {
                log.error("Error querying MB Core Oracle DB for phone check {}: {}", phone, ex.getMessage());
                return null;
            }
        }
    }

    private Map<String, String> extractFirstRow(List<Map<String, Object>> rows) {
        if (rows == null || rows.isEmpty()) {
            return null;
        }
        Map<String, Object> firstRow = rows.get(0);
        Map<String, String> result = new HashMap<>();
        result.put("cif",      firstRow.get("cif") != null ? firstRow.get("cif").toString() : null);
        result.put("cus_name", firstRow.get("cus_name") != null ? firstRow.get("cus_name").toString() : null);
        result.put("mobile",   firstRow.get("mobile") != null ? firstRow.get("mobile").toString() : null);
        return result;
    }
}
