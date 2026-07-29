package com.internal.feature.aml.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.internal.enumation.AmlStatusEnum;
import com.internal.feature.aml.dto.request.UpdateAmlStatusDto;
import com.internal.feature.aml.models.JuniorAmlStatus;
import com.internal.feature.aml.repository.JuniorAmlStatusRepository;
import com.internal.feature.aml.service.JuniorAmlService;
import com.internal.feature.auth.models.UserEntity;
import com.internal.shared.component.AuditComponent;
import com.internal.shared.exception.custom.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class JuniorAmlServiceImpl implements JuniorAmlService {

    private final JuniorAmlStatusRepository juniorAmlStatusRepository;
    private final AuditComponent auditComponent;

    @Override
    public Page<JuniorAmlStatus> getAllJuniorAmlStatus(String status, String search, Pageable pageable) {
        log.info("Fetching all Junior AML statuses - Status: {}, Search: {}", status, search);
        String targetStatus = (status == null || status.isBlank()) ? "PENDING" : status;
        return juniorAmlStatusRepository.findByStatusAndSearch(targetStatus, search, pageable);
    }

    @Override
    public Page<JuniorAmlStatus> getAllJuniorAmlHistory(String search, Pageable pageable) {
        log.info("Fetching all Junior AML history - Search: {}", search);
        return juniorAmlStatusRepository.findByStatusAndSearch(null, search, pageable);
    }

    @Override
    @Transactional
    public JuniorAmlStatus updateJuniorAmlStatus(Long id, UpdateAmlStatusDto request) throws JsonProcessingException {
        log.info("Updating Junior AML status ID: {} to {}", id, request.getStatus());
        JuniorAmlStatus aml = juniorAmlStatusRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Junior AML status record not found with id: " + id));

        UserEntity actionUser = auditComponent.getCurrentUser();

        aml.setStatus(request.getStatus().name());
        aml.setRemarks(request.getRemark());

        if (request.getStatus() == AmlStatusEnum.APPROVE) {
            aml.setApprovedBy(actionUser);
            aml.setRejectedBy(null);
        } else if (request.getStatus() == AmlStatusEnum.REJECT) {
            aml.setRejectedBy(actionUser);
            aml.setApprovedBy(null);
        }

        JuniorAmlStatus updated = juniorAmlStatusRepository.save(aml);
        log.info("Junior AML status successfully updated for ID: {}", id);
        return updated;
    }
}
