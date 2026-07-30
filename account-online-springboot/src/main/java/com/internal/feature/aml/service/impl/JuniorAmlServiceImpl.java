package com.internal.feature.aml.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.internal.enumation.AmlStatusEnum;
import com.internal.feature.aml.dto.request.AllAmlHistoryRequestDto;
import com.internal.feature.aml.dto.request.UpdateAmlStatusDto;
import com.internal.feature.aml.models.JuniorAmlHistory;
import com.internal.feature.aml.models.JuniorAmlStatus;
import com.internal.feature.aml.repository.JuniorAmlHistoryRepository;
import com.internal.feature.aml.repository.JuniorAmlStatusRepository;
import com.internal.feature.aml.service.JuniorAmlService;
import com.internal.feature.auth.models.UserEntity;
import com.internal.shared.component.AuditComponent;
import com.internal.shared.exception.custom.NotFoundException;
import com.internal.shared.pagination.PaginationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.internal.feature.junior_account.dto.request.JuniorCustomerRequest;
import com.internal.feature.junior_account.service.JuniorAccountService;
import com.internal.feature.telegram_alerts.service.MonitoringService;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class JuniorAmlServiceImpl implements JuniorAmlService {

    private final JuniorAmlStatusRepository juniorAmlStatusRepository;
    private final JuniorAmlHistoryRepository juniorAmlHistoryRepository;
    private final AuditComponent auditComponent;
    private final JuniorAccountService juniorAccountService;
    private final MonitoringService monitoringService;
    private final ObjectMapper objectMapper;


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
    public JuniorAmlStatus updateJuniorAmlStatus(Long id, UpdateAmlStatusDto request) {
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

        // Save a history snapshot for audit trail (mirrors AmlHistory for Account Online)
        saveJuniorAmlHistory(updated, actionUser);

        // 1. Send Telegram Alert for Approve / Reject action
        try {
            monitoringService.sendJuniorAmlActionAlert(updated);
        } catch (Exception e) {
            log.error("Failed to send Junior AML Telegram action alert: {}", e.getMessage());
        }

        // 2. If APPROVED, trigger background Junior Account Opening in T24 (CIF + KHR/USD accounts)
        if (request.getStatus() == AmlStatusEnum.APPROVE) {
            log.info("Junior AML status is APPROVED for Legal ID: {}. Triggering background junior account creation...", aml.getLegalId());
            CompletableFuture.runAsync(() -> {
                try {
                    JuniorCustomerRequest jnrReq;
                    if (aml.getRequestPayload() != null && !aml.getRequestPayload().isBlank()) {
                        jnrReq = objectMapper.readValue(aml.getRequestPayload(), JuniorCustomerRequest.class);
                    } else {
                        jnrReq = buildJuniorCustomerRequestFromAml(aml);
                    }
                    log.info("Executing background Junior account opening for Legal ID: {}", aml.getLegalId());
                    juniorAccountService.processJuniorAccountOpening(jnrReq);
                    log.info("Background Junior account opening process completed successfully for Legal ID: {}", aml.getLegalId());
                } catch (Exception e) {
                    log.error("Failed to process background Junior account opening for Legal ID: {}. Error: {}", aml.getLegalId(), e.getMessage(), e);
                }
            });
        }


        log.info("Junior AML status successfully updated for ID: {}", id);
        return updated;
    }

    private JuniorCustomerRequest buildJuniorCustomerRequestFromAml(JuniorAmlStatus aml) {
        return JuniorCustomerRequest.builder()

                .legalId(aml.getLegalId())
                .givenName(aml.getGivenName())
                .familyName(aml.getFamilyName())
                .firstNameKh(aml.getFirstNameKh())
                .lastNameKh(aml.getLastNameKh())
                .dateOfBirth(aml.getDateOfBirth())
                .gender(aml.getGender())
                .phoneNumber(aml.getPhoneNumber())
                .branchCode(aml.getBranch())
                .maritalStatus(aml.getMaritalStatus())
                .legalIssueDate(aml.getIssuedDate())
                .legalExpireDate(aml.getExpiredDate())
                .occupation(aml.getOccupationCode())
                .legalAddress(aml.getLegalAddress())
                .placeOfBirth(aml.getPlaceOfBirth())
                .guardianLegalId(aml.getGuardianLegalId())
                .guardianName(aml.getGuardianName())
                .guardianPhone(aml.getGuardianPhone())
                .guardianRelationship(aml.getGuardianRelationship())
                .guardianCif(aml.getGuardianCif())
                .guardianAddress(aml.getGuardianAddress())
                .referenceDocType(aml.getReferenceDocType())
                .referenceDocName(aml.getReferenceDocName())
                .nidImageName(aml.getNidImageName())
                .selfieImageName(aml.getSelfieImageName())
                .nationality(aml.getNationality())
                .hasNid(aml.getHasNid() != null ? aml.getHasNid() : true)
                .build();
    }

    @Override
    public Page<JuniorAmlHistory> getJuniorAmlHistoryByStatusId(Long juniorAmlStatusId, AllAmlHistoryRequestDto request) {
        log.info("Fetching Junior AML history for status ID: {}, Search: {}", juniorAmlStatusId, request.getSearch());
        Pageable pageable = PaginationUtil.createPageable(request);
        LocalDateTime fromDateTime = request.getStartDate() != null ? request.getStartDate().atStartOfDay() : null;
        LocalDateTime toDateTime = request.getEndDate() != null ? request.getEndDate().atTime(23, 59, 59) : null;
        return juniorAmlHistoryRepository.findByStatusAndSearch(null, request.getSearch(), fromDateTime, toDateTime, pageable);
    }

    @Override
    public JuniorAmlHistory getJuniorAmlHistoryById(Long historyId) {
        return juniorAmlHistoryRepository.findById(historyId)
                .orElseThrow(() -> new NotFoundException("Junior AML history record not found with id: " + historyId));
    }

    private void saveJuniorAmlHistory(JuniorAmlStatus aml, UserEntity actionUser) {
        try {
            JuniorAmlHistory history = new JuniorAmlHistory();
            history.setStatus(aml.getStatus());
            history.setLegalId(aml.getLegalId());
            history.setFamilyName(aml.getFamilyName());
            history.setGivenName(aml.getGivenName());
            history.setFirstNameKh(aml.getFirstNameKh());
            history.setLastNameKh(aml.getLastNameKh());
            history.setDateOfBirth(aml.getDateOfBirth());
            history.setGender(aml.getGender());
            history.setNationality(aml.getNationality());
            history.setPhoneNumber(aml.getPhoneNumber());
            history.setBranch(aml.getBranch());
            history.setMaritalStatus(aml.getMaritalStatus());
            history.setHasNid(aml.getHasNid());
            history.setIssuedDate(aml.getIssuedDate());
            history.setExpiredDate(aml.getExpiredDate());
            history.setOccupationCode(aml.getOccupationCode());
            history.setGuardianLegalId(aml.getGuardianLegalId());
            history.setGuardianName(aml.getGuardianName());
            history.setGuardianPhone(aml.getGuardianPhone());
            history.setGuardianRelationship(aml.getGuardianRelationship());
            history.setGuardianCif(aml.getGuardianCif());
            history.setGuardianAddress(aml.getGuardianAddress());
            history.setLegalAddress(aml.getLegalAddress());
            history.setPlaceOfBirth(aml.getPlaceOfBirth());
            history.setReferenceDocType(aml.getReferenceDocType());
            history.setReferenceDocName(aml.getReferenceDocName());
            history.setNidImageName(aml.getNidImageName());
            history.setSelfieImageName(aml.getSelfieImageName());
            history.setRemarks(aml.getRemarks());
            history.setCurrentAddressCode(aml.getCurrentAddressCode());
            history.setCurrentAddressName(aml.getCurrentAddressName());
            history.setPlaceOfBirthCode(aml.getPlaceOfBirthCode());
            history.setPlaceOfBirthName(aml.getPlaceOfBirthName());
            history.setOccupationStatus(aml.getOccupationStatus());
            history.setAmlExternalRiskLevel(aml.getAmlExternalRiskLevel());
            history.setAmlExternalActionTaken(aml.getAmlExternalActionTaken());
            history.setAmlExternalRulesTriggered(aml.getAmlExternalRulesTriggered());
            history.setAmlExternalServiceName(aml.getAmlExternalServiceName());
            history.setAmlExternalTotalRulesScore(aml.getAmlExternalTotalRulesScore());
            history.setAmlExternalTrxnID(aml.getAmlExternalTrxnID());
            history.setSubmittedBy(aml.getSubmittedBy());
            history.setRequestPayload(aml.getRequestPayload());


            if (AmlStatusEnum.APPROVE.name().equalsIgnoreCase(aml.getStatus())) {
                history.setApprovedBy(actionUser);
            } else if (AmlStatusEnum.REJECT.name().equalsIgnoreCase(aml.getStatus())) {
                history.setRejectedBy(actionUser);
            }

            juniorAmlHistoryRepository.save(history);
            log.info("Saved JuniorAmlHistory snapshot for legalId: {} status: {}", aml.getLegalId(), aml.getStatus());
        } catch (Exception e) {
            log.error("Failed to save JuniorAmlHistory snapshot: {}", e.getMessage(), e);
        }
    }
}
