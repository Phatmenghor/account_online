package com.internal.feature.open_account.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.internal.enumation.AmlStatusEnum;
import com.internal.shared.exception.openaccount.AccountCreationException;
import com.internal.feature.aml.dto.request.CreateAmlRequestDto;
import com.internal.feature.aml.dto.response.AmlStatusDto;
import com.internal.feature.aml.models.AmlStatus;
import com.internal.feature.aml.service.AmlService;
import com.internal.feature.master_data.dto.response.OccupationDto;
import com.internal.feature.master_data.service.OccupationService;
import com.internal.feature.open_account.dto.request.CustomerAmlRequest;
import com.internal.feature.open_account.dto.request.CustomerRequest;
import com.internal.feature.open_account.dto.response.AmlExternalResponseDto;
import com.internal.feature.open_account.dto.response.CustomerResponse;
import com.internal.feature.open_account.mapper.OpenAccountAmlStatusMapper;
import com.internal.integration.ports.AmlPort;
import com.internal.feature.aml.models.JuniorAmlStatus;
import com.internal.feature.aml.repository.JuniorAmlStatusRepository;
import com.internal.feature.telegram_alerts.service.MonitoringService;
import com.internal.feature.junior_account.dto.request.JuniorCustomerRequest;
import com.internal.shared.util.SecurityUtils;
import com.internal.shared.constant.AppConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Optional;


@Component
@RequiredArgsConstructor
@Slf4j
public class ComplianceService {

    private final AmlService amlService;
    private final JuniorAmlStatusRepository juniorAmlStatusRepository;
    private final AmlPort amlPort;
    private final OccupationService occupationService;
    private final OpenAccountAmlStatusMapper openAccountAmlStatusMapper;
    private final ObjectMapper objectMapper;
    private final MonitoringService monitoringService;

    public AmlStatusDto processAml(CustomerRequest request) throws Exception {
        log.info("Processing AML for Legal ID: {}", request.getLegalId());

        boolean isJuniorRequest = (request instanceof JuniorCustomerRequest);

        // Step 1: For Junior account opening, check Junior AML bucket (junior_aml_status) first
        if (isJuniorRequest) {
            Optional<JuniorAmlStatus> existingJuniorAmlOpt = juniorAmlStatusRepository.findByLegalId(request.getLegalId());
            if (existingJuniorAmlOpt.isPresent()) {
                JuniorAmlStatus jnrAml = existingJuniorAmlOpt.get();
                log.info("Existing Junior AML status found in Junior bucket for Legal ID: {} | Status: {}", request.getLegalId(), jnrAml.getStatus());
                return handleExistingJuniorAml(jnrAml, request.getLegalId());
            }
        }

        // Step 2: Check general AML bucket (aml_status)
        Optional<AmlStatus> existingAmlOpt = amlService.findByLegalId(request.getLegalId());
        if (existingAmlOpt.isPresent()) {
            log.info("Existing AML status found for Legal ID: {} | Status: {}", request.getLegalId(), existingAmlOpt.get().getStatus());
            return handleExistingAml(existingAmlOpt.get(), request.getLegalId());
        }

        // Build request and call AML middleware
        CustomerAmlRequest amlRequestDto = openAccountAmlStatusMapper.buildAmlRequestDto(request);
        AmlExternalResponseDto amlResponse = callAmlMiddleware(amlRequestDto, request.getLegalId());

        // Build occupation status string
        String occupationStatus = buildOccupationStatus(request.getOccupation());

        // Determine AML status based on risk
        boolean isHighRisk = AppConstants.RISK_HIGH.equalsIgnoreCase(amlResponse.getRiskLevel());
        AmlStatusEnum amlStatusEnum = isHighRisk ? AmlStatusEnum.PENDING : AmlStatusEnum.APPROVE;

        // Map to CreateAmlRequestDto
        CreateAmlRequestDto createRequest = openAccountAmlStatusMapper.toCreateRequest(amlRequestDto, amlResponse,
                request, occupationStatus, amlStatusEnum);

        // Handle high-risk customers: Save to DB + Push Telegram Alert ONCE upon initial detection
        if (isHighRisk) {
            log.warn("HIGH RISK customer detected | Legal ID: {} | RiskLevel: {} | Rules: {}",
                    request.getLegalId(), amlResponse.getRiskLevel(), amlResponse.getRulesTriggered());
            if (isJuniorRequest && request instanceof JuniorCustomerRequest jnrReq) {
                saveJuniorHighRiskAmlStatus(jnrReq, amlResponse, AmlStatusEnum.PENDING);
            } else {
                amlService.createAmlStatus(createRequest);
            }
            try {
                String submittedBy = "System";
                try {
                    String username = SecurityUtils.getCurrentUsername();
                    if (username != null) {
                        submittedBy = username;
                    }
                } catch (Exception ignored) {}
                AmlStatusDto amlDto = openAccountAmlStatusMapper.fromRequestAndResponse(request, amlResponse, AmlStatusEnum.PENDING);
                amlDto.setSubmittedBy(submittedBy);
                if (isJuniorRequest) {
                    monitoringService.sendJuniorHighRiskAmlAlert(amlDto);
                } else {
                    monitoringService.sendHighRiskAmlAlert(amlDto);
                }
            } catch (Exception e) {
                log.error("Failed to send HIGH RISK Telegram alert: {}", e.getMessage());
            }
        } else {
            log.info("LOW RISK customer approved | Legal ID: {} | RiskLevel: {}",
                    request.getLegalId(), amlResponse.getRiskLevel());
        }

        log.info("AML processing completed for Legal ID: {} | Status: {}", request.getLegalId(), amlStatusEnum);

        return openAccountAmlStatusMapper.fromRequestAndResponse(request, amlResponse, amlStatusEnum);
    }

    public void sentMessageOnHighRisk(CustomerRequest request, AmlStatusDto amlProcessResult) {
        if (amlProcessResult.getStatus() == AmlStatusEnum.PENDING) {
            throw new AccountCreationException(String.format(AppConstants.AML_NEED_REVIEW_MSG, request.getLegalId()));
        } else if (amlProcessResult.getStatus() == AmlStatusEnum.REJECT) {
            throw new AccountCreationException(String.format(AppConstants.AML_REJECTED_MSG, request.getLegalId()));
        }
    }

    public CustomerResponse buildCustomerAccInfo(String cif, String khrAccount, String usdAccount, String mnemonic) {
        return openAccountAmlStatusMapper.buildCustomerAccInfo(cif, khrAccount, usdAccount, mnemonic);
    }

    private AmlStatusDto handleExistingJuniorAml(JuniorAmlStatus existing, String legalId) {
        String statusStr = existing.getStatus();
        if (AmlStatusEnum.PENDING.name().equalsIgnoreCase(statusStr)) {
            throw new AccountCreationException(String.format(AppConstants.AML_NEED_REVIEW_MSG, legalId));
        } else if (AmlStatusEnum.REJECT.name().equalsIgnoreCase(statusStr)) {
            throw new AccountCreationException(String.format(AppConstants.AML_REJECTED_MSG, legalId));
        } else if (AmlStatusEnum.APPROVE.name().equalsIgnoreCase(statusStr)) {
            AmlStatusDto dto = new AmlStatusDto();
            dto.setStatus(AmlStatusEnum.APPROVE);
            return dto;
        }
        throw new AccountCreationException(String.format(AppConstants.AML_UNKNOWN_MSG, legalId));
    }

    private AmlStatusDto handleExistingAml(AmlStatus existing, String legalId) {
        return switch (existing.getStatus()) {
            case APPROVE -> openAccountAmlStatusMapper.toDto(existing);
            case PENDING -> throw new AccountCreationException(String.format(AppConstants.AML_NEED_REVIEW_MSG, legalId));
            case REJECT -> throw new AccountCreationException(String.format(AppConstants.AML_REJECTED_MSG, legalId));
            default -> throw new AccountCreationException(String.format(AppConstants.AML_UNKNOWN_MSG, legalId));
        };
    }

    private AmlExternalResponseDto callAmlMiddleware(CustomerAmlRequest amlRequest, String legalId)
            throws JsonProcessingException {
        AmlExternalResponseDto response = amlPort.checkAml(amlRequest);
        log.info("AML Middleware response received | RiskLevel: {} | TrxnID: {}", response.getRiskLevel(),
                response.getTrxnID());
        return response;
    }

    private String buildOccupationStatus(String occupationCode) {
        if (occupationCode == null || occupationCode.isBlank() || "320".equals(occupationCode) || "STUDENT".equalsIgnoreCase(occupationCode)) {
            return "STUDENT / សិស្ស";
        }
        OccupationDto occupation = safeOccupationLookup(occupationCode);
        if (occupation != null) {
            return occupation.getNameEn() + " / " + occupation.getNameKh();
        }
        return occupationCode;
    }


    private OccupationDto safeOccupationLookup(String code) {
        if (code == null) {
            return null;
        }
        return occupationService.getOccupationByCode(code)
                .orElseGet(() -> {
                    log.warn("Occupation lookup failed for code: {}", code);
                    return null;
                });
    }

    private void saveJuniorHighRiskAmlStatus(JuniorCustomerRequest request, AmlExternalResponseDto amlResponse, AmlStatusEnum amlStatusEnum) {
        try {
            Optional<JuniorAmlStatus> existingOpt = juniorAmlStatusRepository.findByLegalId(request.getLegalId());
            JuniorAmlStatus amlStatus = existingOpt.orElseGet(JuniorAmlStatus::new);

            amlStatus.setLegalId(request.getLegalId() != null ? request.getLegalId() : (request.getGuardianLegalId() != null ? request.getGuardianLegalId() : ""));
            amlStatus.setFamilyName(request.getFamilyName() != null ? request.getFamilyName() : (request.getLegalHolderName() != null ? request.getLegalHolderName() : ""));
            amlStatus.setGivenName(request.getGivenName() != null ? request.getGivenName() : "");
            amlStatus.setFirstNameKh(request.getFirstNameKh() != null ? request.getFirstNameKh() : "");
            amlStatus.setLastNameKh(request.getLastNameKh() != null ? request.getLastNameKh() : "");
            amlStatus.setDateOfBirth(request.getDateOfBirth() != null ? request.getDateOfBirth() : "");
            amlStatus.setGender(request.getGender() != null ? request.getGender() : "");
            amlStatus.setPhoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber() : "");
            amlStatus.setBranch(request.getBranchCode() != null && !request.getBranchCode().isBlank() ? request.getBranchCode() : "KH0011011");
            amlStatus.setMaritalStatus(resolveMaritalStatus(request.getMaritalStatus()));
            amlStatus.setIssuedDate(request.getLegalIssueDate() != null ? request.getLegalIssueDate() : "");
            amlStatus.setExpiredDate(request.getLegalExpireDate() != null ? request.getLegalExpireDate() : "");
            amlStatus.setOccupationCode(request.getOccupation() != null ? request.getOccupation() : "");
            amlStatus.setNidImageName(request.getNidImageName());
            amlStatus.setSelfieImageName(request.getSelfieImageName());
            amlStatus.setStatus(amlStatusEnum.name());
            amlStatus.setGuardianLegalId(request.getGuardianLegalId());
            amlStatus.setGuardianName(request.getGuardianName());
            amlStatus.setGuardianPhone(request.getGuardianPhone());
            amlStatus.setGuardianRelationship(request.getGuardianRelationship());
            amlStatus.setGuardianCif(request.getGuardianCif());
            amlStatus.setGuardianAddress(request.getGuardianAddress());
            amlStatus.setLegalAddress(request.getLegalAddress());
            amlStatus.setPlaceOfBirth(request.getPlaceOfBirth());
            amlStatus.setReferenceDocType(request.getReferenceDocType());
            amlStatus.setReferenceDocName(request.getReferenceDocName());
            amlStatus.setNationality(request.getNationality() != null ? request.getNationality() : "KH");
            amlStatus.setHasNid(request.getHasNid() != null ? request.getHasNid() : true);
            amlStatus.setRemarks(amlResponse != null && amlResponse.getRulesTriggered() != null ? amlResponse.getRulesTriggered() : "HIGH RISK");
            amlStatus.setSubmittedBy("Customer");


            // Address codes
            try {
                // Address codes (raw province/district/commune/village codes)
                String currentAddrCode = joinNonEmpty(", ",
                        request.getCustomerCurrentProvince(),
                        request.getCustomerCurrentDistrict(),
                        request.getCustomerCurrentCommune(),
                        request.getCustomerCurrentVillage());
                amlStatus.setCurrentAddressCode(currentAddrCode);

                // Resolved KH address name — prefer KH names, fallback to legalAddress
                String currentAddrNameKh = joinNonEmpty(" ", request.getCustomerProvinceKh(),
                        request.getCustomerDistrictKh(), request.getCustomerCommuneKh(), request.getCustomerVillageKh());
                String currentAddrNameEn = joinNonEmpty(", ", request.getCustomerProvinceEn(),
                        request.getCustomerDistrictEn(), request.getCustomerCommuneEn(), request.getCustomerVillageEn());
                String currentAddrName = currentAddrNameKh.isBlank()
                        ? (currentAddrNameEn.isBlank() ? (request.getLegalAddress() != null ? request.getLegalAddress() : "") : currentAddrNameEn)
                        : currentAddrNameKh;
                amlStatus.setCurrentAddressName(currentAddrName);

                // POB codes
                String pobCode = joinNonEmpty(", ",
                        request.getCustomerPobProvince(),
                        request.getCustomerPobDistrict(),
                        request.getCustomerPobCommune(),
                        request.getCustomerPobVillage());
                amlStatus.setPlaceOfBirthCode(pobCode);

                // Resolved KH POB name — prefer KH names, fallback to placeOfBirth text
                String pobNameKh = joinNonEmpty(" ", request.getCustomerPobProvinceKh(),
                        request.getCustomerPobDistrictKh(), request.getCustomerPobCommuneKh(), request.getCustomerPobVillageKh());
                String pobNameEn = joinNonEmpty(", ", request.getCustomerPobProvinceEn(),
                        request.getCustomerPobDistrictEn(), request.getCustomerPobCommuneEn(), request.getCustomerPobVillageEn());
                String pobName = pobNameKh.isBlank()
                        ? (pobNameEn.isBlank() ? (request.getPlaceOfBirth() != null ? request.getPlaceOfBirth() : "") : pobNameEn)
                        : pobNameKh;
                amlStatus.setPlaceOfBirthName(pobName);
            } catch (Exception ignored) {}

            // Occupation status (human-readable label)
            try {
                amlStatus.setOccupationStatus(buildOccupationStatus(request.getOccupation()));
            } catch (Exception ignored) {}

            // AML external screening data
            if (amlResponse != null) {
                amlStatus.setAmlExternalRiskLevel(amlResponse.getRiskLevel());
                amlStatus.setAmlExternalActionTaken(amlResponse.getActionTaken());
                amlStatus.setAmlExternalServiceName(amlResponse.getServiceName());
                amlStatus.setAmlExternalTotalRulesScore(amlResponse.getTotalRulesScore());
                amlStatus.setAmlExternalTrxnID(amlResponse.getTrxnID());
                try {
                    amlStatus.setAmlExternalRulesTriggered(objectMapper.writeValueAsString(amlResponse.getRulesTriggered()));
                    amlStatus.setScreeningResult(objectMapper.writeValueAsString(amlResponse));
                } catch (Exception ignored) {}
            }

            try {
                amlStatus.setRequestPayload(objectMapper.writeValueAsString(request));
            } catch (Exception ignored) {}

            juniorAmlStatusRepository.save(amlStatus);
            log.info("Saved High Risk JuniorAmlStatus record to junior_aml_status table for Legal ID: {}", request.getLegalId());
        } catch (Exception e) {
            log.error("Failed to save High Risk JuniorAmlStatus record: {}", e.getMessage(), e);
        }
    }

    private String resolveMaritalStatus(String status) {
        if (status == null || status.isBlank()) {
            return "SINGLE";
        }
        String trimmed = status.trim().toUpperCase(Locale.ROOT);
        return switch (trimmed) {
            case "2" -> "MARRIED";
            case "3" -> "DIVORCED";
            case "4" -> "WIDOWED";
            default -> trimmed.equals("1") ? "SINGLE" : trimmed;
        };
    }


    private String joinNonEmpty(String delimiter, String... parts) {
        java.util.List<String> list = new java.util.ArrayList<>();
        for (String p : parts) {
            if (p != null && !p.isBlank()) {
                list.add(p);
            }
        }
        return String.join(delimiter, list);
    }

}
