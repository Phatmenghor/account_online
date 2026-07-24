package com.internal.feature.sms_otp.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.Query;
import java.util.HashMap;
import java.util.Map;

/**
 * Repository for querying MB Core (Oracle) via DB link to check
 * if a phone number is already registered as an active MB customer.
 *
 * SQL equivalent:
 *   SELECT a.cif_core AS cif, b.received_otp AS mobile
 *   FROM mb_customer@stg_mblink a
 *   INNER JOIN mb_mobiles@stg_mblink b ON a.cus_id = b.cus_id
 *   WHERE a.cus_status = '3' AND b.received_otp = :phone
 *   ORDER BY a.cif_core DESC
 */
@Repository
public class PhoneCheckRepository {

    private final EntityManager entityManager;

    @Autowired
    public PhoneCheckRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    /**
     * Check if a phone number belongs to an active MB customer.
     *
     * @param phone the phone number to check
     * @return Map with "cif" and "mobile" keys if found, or null if not found
     */
    public Map<String, String> findActiveMbCustomerByPhone(String phone) {
        String sql =
            "SELECT a.cif_core AS cif, b.received_otp AS mobile " +
            "FROM mb_customer@stg_mblink a " +
            "INNER JOIN mb_mobiles@stg_mblink b ON a.cus_id = b.cus_id " +
            "WHERE a.cus_status = '3' " +
            "  AND b.received_otp = :phone " +
            "ORDER BY a.cif_core DESC";

        try {
            Query query = entityManager.createNativeQuery(sql);
            query.setParameter("phone", phone);
            query.setMaxResults(1);

            Object[] row = (Object[]) query.getSingleResult();
            Map<String, String> result = new HashMap<>();
            result.put("cif",    row[0] != null ? row[0].toString() : null);
            result.put("mobile", row[1] != null ? row[1].toString() : null);
            return result;

        } catch (NoResultException e) {
            return null;
        }
    }
}
