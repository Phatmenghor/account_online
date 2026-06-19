package com.internal.feature.auth.repository;

import com.internal.feature.auth.dto.response.StaffResponseDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@Slf4j
public class StaffInfoRepository {

    private final JdbcTemplate staffJdbcTemplate;

    public StaffInfoRepository(@Qualifier("staffJdbcTemplate") JdbcTemplate staffJdbcTemplate) {
        this.staffJdbcTemplate = staffJdbcTemplate;
    }

    public Optional<StaffResponseDto> findByIdCard(String idCard) {
        try {
            log.info("Querying staff info for ID Card: {}", idCard);

            String queryStr = "SELECT * FROM tblStaffinfo WHERE IDCard = ?";

            StaffResponseDto result = staffJdbcTemplate.queryForObject(queryStr, (rs, rowNum) -> new StaffResponseDto(
                    rs.getString("Name"),
                    rs.getString("IDCard"),
                    rs.getString("Sex"),
                    rs.getString("Status"),
                    rs.getString("Position"),
                    rs.getString("Department"),
                    rs.getString("Location"),
                    rs.getString("StartingDate"),
                    rs.getString("PhoneNumber"),
                    rs.getString("ProbationDate"),
                    rs.getString("Email")
            ), idCard);

            return Optional.ofNullable(result);
        } catch (EmptyResultDataAccessException e) {
            log.info("No staff found for ID Card: {}", idCard);
            return Optional.empty();
        } catch (Exception e) {
            log.error("Error querying staff info for ID Card {}: {}", idCard, e.getMessage());
            throw e;
        }
    }
}
