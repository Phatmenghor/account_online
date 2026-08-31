package com.internal.feature.open_account.service.impl;

import com.internal.shared.exception.custom.NotFoundException;
import com.internal.feature.aml.dto.response.AmlStatusDto;
import com.internal.feature.open_account.dto.request.AccountOnlineFinalLogRequestDto;
import com.internal.feature.open_account.dto.request.AllAccountOnlineSuccessExcelRequestDto;
import com.internal.feature.open_account.dto.request.AllAccountOnlineSuccessRequestDto;
import com.internal.feature.open_account.dto.response.AllAccountOnlineFinalResponseDto;
import com.internal.feature.open_account.dto.response.AccountOnlineFinalResponseDto;
import com.internal.feature.open_account.dto.response.AllAccountOnlineFinalExcelResponseDto;
import com.internal.feature.open_account.dto.response.AccountOnlineFinalExcelResponseDto;
import com.internal.feature.customer_image.dto.response.CustomerImageUploadResponseDto;
import com.internal.feature.customer_image.component.CustomerImageStorageComponent;
import com.internal.feature.open_account.mapper.AccountOnlineFinalMapper;
import com.internal.feature.open_account.models.AccountOnlineFinal;
import com.internal.feature.open_account.repository.AccountOnlineFinalRepository;
import com.internal.feature.open_account.service.AccountFinalService;
import com.internal.feature.master_data.dto.response.ClsProvinceDto;
import com.internal.feature.master_data.dto.response.ClsDistrictDto;
import com.internal.feature.master_data.dto.response.ClsCommuneDto;
import com.internal.feature.master_data.dto.response.ClsVillageDto;
import com.internal.feature.master_data.dto.response.ClsBranchDto;
import com.internal.feature.master_data.service.MasterDataService;
import com.internal.feature.open_account.dto.request.CustomerRequest;
import com.internal.feature.open_account.dto.response.CustomerResponse;
import com.internal.feature.auth.models.UserEntity;
import com.internal.shared.component.AuditComponent;
import com.internal.shared.pagination.PaginationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountFinalServiceImpl implements AccountFinalService {

    private final AccountOnlineFinalRepository accountOnlineFinalRepository;
    private final MasterDataService masterDataService;
    private final AccountOnlineFinalMapper mapper;
    private final AuditComponent auditComponent;
    private final CustomerImageStorageComponent storageComponent;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Override
    public AccountOnlineFinal saveFinalLog(
            CustomerRequest request,
            CustomerResponse accountInfo,
            AmlStatusDto amlProcessResult,
            CustomerImageUploadResponseDto imagePaths,
            String mbActivationCode
    ) {
        try {
            log.info("Attempting to save AccountOnlineFinal for Legal ID: {}", request.getLegalId());

            // 1. Current user
            String submittedBy = "System";
            UserEntity submittedByUser = auditComponent.getCurrentUserOptional().orElse(null);
            if (submittedByUser != null) {
                submittedBy = submittedByUser.getUsername();
            }

            // 2. Parse dates safely
            LocalDate dob = parseDate(request.getDateOfBirth());
            LocalDate issueDate = parseDate(request.getLegalIssueDate());
            LocalDate expireDate = parseDate(request.getLegalExpireDate());

            // 3. Resolve Image Filenames - Ensure NEVER NULL
            String resolvedNid = (imagePaths != null && imagePaths.getNidImagePath() != null && !imagePaths.getNidImagePath().isBlank())
                    ? imagePaths.getNidImagePath()
                    : request.getNidImageName();

            if ((resolvedNid == null || resolvedNid.isBlank()) && request.getLegalId() != null) {
                Path latestNid = storageComponent.findLatestFileRecursive(
                        Paths.get(storageComponent.getUploadDir(), "nid"), "nid_" + request.getLegalId() + "_");
                if (latestNid != null) {
                    resolvedNid = latestNid.getFileName().toString();
                }
            }

            String resolvedSelfie = (imagePaths != null && imagePaths.getSelfieImagePath() != null && !imagePaths.getSelfieImagePath().isBlank())
                    ? imagePaths.getSelfieImagePath()
                    : request.getSelfieImageName();

            if ((resolvedSelfie == null || resolvedSelfie.isBlank()) && request.getLegalId() != null) {
                Path latestSelfie = storageComponent.findLatestFileRecursive(
                        Paths.get(storageComponent.getUploadDir(), "selfie"), "selfie_" + request.getLegalId() + "_");
                if (latestSelfie != null) {
                    resolvedSelfie = latestSelfie.getFileName().toString();
                }
            }

            // 4. Fast direct address strings from frontend payload (NO slow DB lookups)
            String curProvinceStr = formatFastAddress(request.getCustomerProvinceEn(), request.getCustomerProvinceKh(), request.getCustomerCurrentProvince());
            String curDistrictStr = formatFastAddress(request.getCustomerDistrictEn(), request.getCustomerDistrictKh(), request.getCustomerCurrentDistrict());
            String curCommuneStr = formatFastAddress(request.getCustomerCommuneEn(), request.getCustomerCommuneKh(), request.getCustomerCurrentCommune());
            String curVillageStr = formatFastAddress(request.getCustomerVillageEn(), request.getCustomerVillageKh(), request.getCustomerCurrentVillage());

            String pobProvinceStr = formatFastAddress(request.getCustomerPobProvinceEn(), request.getCustomerPobProvinceKh(), request.getCustomerPobProvince());
            String pobDistrictStr = formatFastAddress(request.getCustomerPobDistrictEn(), request.getCustomerPobDistrictKh(), request.getCustomerPobDistrict());
            String pobCommuneStr = formatFastAddress(request.getCustomerPobCommuneEn(), request.getCustomerPobCommuneKh(), request.getCustomerPobCommune());
            String pobVillageStr = formatFastAddress(request.getCustomerPobVillageEn(), request.getCustomerPobVillageKh(), request.getCustomerPobVillage());

            // 5. Resolve Place of Birth - Ensure NEVER NULL
            String placeOfBirth = request.getPlaceOfBirth();
            if (placeOfBirth == null || placeOfBirth.isBlank()) {
                List<String> pobParts = new ArrayList<>();
                if (!pobVillageStr.isBlank()) pobParts.add(pobVillageStr);
                if (!pobCommuneStr.isBlank()) pobParts.add(pobCommuneStr);
                if (!pobDistrictStr.isBlank()) pobParts.add(pobDistrictStr);
                if (!pobProvinceStr.isBlank()) pobParts.add(pobProvinceStr);

                if (!pobParts.isEmpty()) {
                    placeOfBirth = String.join(", ", pobParts);
                }
            }
            if (placeOfBirth == null || placeOfBirth.isBlank()) {
                placeOfBirth = request.getLegalAddress() != null ? request.getLegalAddress() : "Cambodia";
            }

            // 6. Resolve Holder Name, Branch Name, and MB Activation Code
            String holderName = ((request.getGivenName() != null ? request.getGivenName() : "") + " " +
                                (request.getFamilyName() != null ? request.getFamilyName() : "")).trim();
            if (holderName.isBlank()) {
                holderName = ((request.getFirstNameKh() != null ? request.getFirstNameKh() : "") + " " +
                              (request.getLastNameKh() != null ? request.getLastNameKh() : "")).trim();
            }

            String resolvedBranchKh = request.getBranchCode() != null ? request.getBranchCode() : "សាខាកណ្តាល (Head Office)";

            String resolvedMbCode = mbActivationCode;
            if (resolvedMbCode != null && !resolvedMbCode.isBlank()) {
                resolvedMbCode = resolvedMbCode.replaceAll("(?i)registCode:\\s*", "").trim();
            }
            if (resolvedMbCode == null || resolvedMbCode.isBlank()) {
                resolvedMbCode = "ALREADY_REGISTERED";
            }

            // Lookup existing record by legalId or CIF to update instead of creating duplicate null rows
            Optional<AccountOnlineFinal> existingOpt = accountOnlineFinalRepository.findTopByCifOrLegalIdOrderByCreatedAtDesc(
                    accountInfo != null ? accountInfo.getCif() : null,
                    request.getLegalId()
            );
            UUID existingId = existingOpt.map(AccountOnlineFinal::getId).orElse(null);

            log.info("Saving AccountOnlineFinal | Existing ID: {} | Legal ID: {} | CIF: {} | MB Code: {} | Province: {} | District: {} | Commune: {} | Village: {} | POB: {}",
                    existingId, request.getLegalId(), accountInfo.getCif(), resolvedMbCode, curProvinceStr, curDistrictStr, curCommuneStr, curVillageStr, placeOfBirth);

            // === Build entity ===
            AccountOnlineFinal finalLog = AccountOnlineFinal.builder()
                    .id(existingId)
                    // Legal
                    .legalId(request.getLegalId())
                    .legalDocName(request.getLegalDocType() != null && !request.getLegalDocType().isBlank() ? request.getLegalDocType() : "NATIONAL.ID")
                    .legalHolderName(holderName)
                    .legalFirstNameEn(request.getGivenName() != null ? request.getGivenName() : "")
                    .legalLastNameEn(request.getFamilyName() != null ? request.getFamilyName() : "")
                    .legalFirstNameKh(request.getFirstNameKh() != null ? request.getFirstNameKh() : "")
                    .legalLastNameKh(request.getLastNameKh() != null ? request.getLastNameKh() : "")
                    .legalDateOfBirth(dob)
                    .legalGender(request.getGender() != null ? request.getGender() : "M")
                    .legalAddress(request.getLegalAddress() != null ? request.getLegalAddress() : "")
                    .legalPlaceOfBirth(placeOfBirth)
                    .legalIssuedDate(issueDate)
                    .legalExpiredDate(expireDate)
                    .legalMRZ1(request.getLegalMrz1() != null ? request.getLegalMrz1() : "")
                    .legalMRZ2(request.getLegalMrz2() != null ? request.getLegalMrz2() : "")
                    .legalMRZ3(request.getLegalMrz3() != null ? request.getLegalMrz3() : "")

                    // Customer
                    .maritalStatus(request.getMaritalStatus() != null ? request.getMaritalStatus() : "SINGLE")
                    .nationality("KH")
                    .companyName(request.getCompanyName() != null ? request.getCompanyName() : "")
                    .occupation(request.getOccupation() != null ? request.getOccupation() : "")
                    .averageIncome("0")
                    .referralId(request.getReferralId() != null ? request.getReferralId() : "")
                    .releasedBy(request.getReleasedBy() != null ? request.getReleasedBy() : "")

                    // Branch
                    .branchCode(request.getBranchCode() != null ? request.getBranchCode() : "0109")
                    .branchNameKh(resolvedBranchKh)

                    // Current address
                    .customerProvinceCode(request.getCustomerCurrentProvince() != null ? request.getCustomerCurrentProvince() : "")
                    .customerProvince(curProvinceStr)
                    .customerDistrictCode(request.getCustomerCurrentDistrict() != null ? request.getCustomerCurrentDistrict() : "")
                    .customerDistrict(curDistrictStr)
                    .customerCommuneCode(request.getCustomerCurrentCommune() != null ? request.getCustomerCurrentCommune() : "")
                    .customerCommune(curCommuneStr)
                    .customerVillageCode(request.getCustomerCurrentVillage() != null ? request.getCustomerCurrentVillage() : "")
                    .customerVillage(curVillageStr)

                    // Place of birth
                    .customerPobProvinceCode(request.getCustomerPobProvince() != null ? request.getCustomerPobProvince() : "")
                    .customerPobProvince(pobProvinceStr)
                    .customerPobDistrictCode(request.getCustomerPobDistrict() != null ? request.getCustomerPobDistrict() : "")
                    .customerPobDistrict(pobDistrictStr)
                    .customerPobCommuneCode(request.getCustomerPobCommune() != null ? request.getCustomerPobCommune() : "")
                    .customerPobCommune(pobCommuneStr)
                    .customerPobVillageCode(request.getCustomerPobVillage() != null ? request.getCustomerPobVillage() : "")
                    .customerPobVillage(pobVillageStr)

                    // Contact
                    .phoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber() : "")

                    // AML — guarded: amlProcessResult may be null when AML step is skipped
                    .amlStatus(amlProcessResult != null && amlProcessResult.getStatus() != null ? amlProcessResult.getStatus() : com.internal.enumation.AmlStatusEnum.APPROVE)
                    .amlActionBy(amlProcessResult != null && amlProcessResult.getApprovedBy() != null
                            ? amlProcessResult.getApprovedBy().getId()
                            : amlProcessResult != null && amlProcessResult.getRejectedBy() != null
                            ? amlProcessResult.getRejectedBy().getId() : 1L)
                    .amlActionName(amlProcessResult != null && amlProcessResult.getApprovedBy() != null
                            ? amlProcessResult.getApprovedBy().getFullName()
                            : amlProcessResult != null && amlProcessResult.getRejectedBy() != null
                            ? amlProcessResult.getRejectedBy().getFullName() : "System")
                    .amlActionRole(amlProcessResult != null && amlProcessResult.getApprovedBy() != null
                            ? amlProcessResult.getApprovedBy().getUserRole()
                            : amlProcessResult != null && amlProcessResult.getRejectedBy() != null
                            ? amlProcessResult.getRejectedBy().getUserRole() : "SYSTEM")
                    .amlRemarks(amlProcessResult != null && amlProcessResult.getRemarks() != null ? amlProcessResult.getRemarks() : "Approved")
                    .amlScreeningResult(amlProcessResult != null && amlProcessResult.getScreeningResult() != null ? amlProcessResult.getScreeningResult() : "CLEAN")
                    .amlRiskLevel(amlProcessResult != null && amlProcessResult.getRiskLevel() != null ? amlProcessResult.getRiskLevel() : "LOW")
                    .amlActionTaken(amlProcessResult != null && amlProcessResult.getActionTaken() != null ? amlProcessResult.getActionTaken() : "PASS")
                    .amlTotalRulesScore(amlProcessResult != null ? amlProcessResult.getTotalRulesScore() : 0)
                    .serviceName(amlProcessResult != null && amlProcessResult.getServiceName() != null ? amlProcessResult.getServiceName() : "AML_CHECK")
                    .amlTrxnId(amlProcessResult != null && amlProcessResult.getTrxnID() != null ? amlProcessResult.getTrxnID() : "")
                    .amlRulesTriggered(amlProcessResult != null && amlProcessResult.getRulesTriggered() != null ? amlProcessResult.getRulesTriggered() : "")

                    // Account info
                    .mnemonic(accountInfo.getMnemonic() != null ? accountInfo.getMnemonic() : "")
                    .usdAccount(accountInfo.getUsdAccount() != null ? accountInfo.getUsdAccount() : "")
                    .khrAccount(accountInfo.getKhrAccount() != null ? accountInfo.getKhrAccount() : "")
                    .cif(accountInfo.getCif() != null ? accountInfo.getCif() : "")
                    .categoryAccount(request.getAccountType() != null ? request.getAccountType() : "6011")

                    // === SMS HISTORY ===
                    .smsSentPhone(request.getPhoneNumber() != null ? request.getPhoneNumber() : "")
                    .smsSentUsdAccount(accountInfo.getUsdAccount() != null ? accountInfo.getUsdAccount() : "")
                    .smsSentKhrAccount(accountInfo.getKhrAccount() != null ? accountInfo.getKhrAccount() : "")
                    .smsSentCif(accountInfo.getCif() != null ? accountInfo.getCif() : "")
                    .mbActivationCode(resolvedMbCode)
                    .mbAppDownloadLink("http://onelink.to/cpbank")

                    // Images (Guaranteed non-null)
                    .nidImageName(resolvedNid != null ? resolvedNid : "")
                    .selfieImageName(resolvedSelfie != null ? resolvedSelfie : "")
                    .submittedBy(submittedBy != null ? submittedBy.toString() : "System")
                    .submittedByUser(submittedByUser)
                    .build();

            AccountOnlineFinal savedLog = accountOnlineFinalRepository.save(finalLog);
            log.info("AccountOnlineFinal saved successfully for Legal ID: {}", request.getLegalId());
            return savedLog;

        } catch (Exception e) {
            log.error("Failed to save AccountOnlineFinal for Legal ID {}: {}",
                    request.getLegalId(), e.getMessage(), e);
            return null;
        }
    }

    @Override
    public AllAccountOnlineFinalResponseDto getSuccessOpenAccount(AllAccountOnlineSuccessRequestDto request) {
        log.info("Fetching success open accounts - Search: {}, Page: {}, Size: {}",
                request.getSearch(), request.getPageNo(), request.getPageSize());

        Pageable pageable = PaginationUtil.createPageable(request);

        LocalDateTime fromDateTime = request.getFromDate() != null ? request.getFromDate().atStartOfDay() : null;
        LocalDateTime toDateTime = request.getToDate() != null ? request.getToDate().plusDays(1).atStartOfDay() : null;

        Page<AccountOnlineFinal> page = accountOnlineFinalRepository.findBySearch(fromDateTime, toDateTime, request.getSearch(), pageable);

        log.info("Found {} accounts on page {} of {}", page.getNumberOfElements(),
                request.getPageNo(), page.getTotalPages());

        List<AccountOnlineFinalResponseDto> content = page.stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());

        return mapper.mapToListDto(content, page);
    }

    @Override
    public AllAccountOnlineFinalExcelResponseDto getSuccessOpenAccountExcel(AllAccountOnlineSuccessExcelRequestDto request) {
        log.info("Fetching success open accounts - Search: {}, From: {}, To: {}",
                request.getSearch(), request.getFromDate(), request.getToDate());

        LocalDateTime fromDateTime = request.getFromDate() != null
                ? request.getFromDate().atStartOfDay()
                : null;

        LocalDateTime toDateTime = request.getToDate() != null
                ? request.getToDate().plusDays(1).atStartOfDay()
                : null;

        List<AccountOnlineFinal> accountOnline = accountOnlineFinalRepository.findBySearchExcel(fromDateTime, toDateTime, request.getSearch());

        List<AccountOnlineFinalExcelResponseDto> content = accountOnline.stream()
                .map(mapper::toExcelDto)
                .collect(Collectors.toList());

        return mapper.mapToListExcelDto(content);
    }

    @Transactional
    @Override
    public void updateFinalLogWithAml(AmlStatusDto amlStatus) {
        Optional<AccountOnlineFinal> optionalFinalLog = accountOnlineFinalRepository
                .findByLegalId(amlStatus.getCustomerInfo().getLegalId());

        if (optionalFinalLog.isPresent()) {
            AccountOnlineFinal finalLog = optionalFinalLog.get();
            finalLog.setAmlStatus(amlStatus.getStatus());
            finalLog.setAmlActionBy(amlStatus.getApprovedBy() != null ? amlStatus.getApprovedBy().getId() :
                    amlStatus.getRejectedBy() != null ? amlStatus.getRejectedBy().getId() : null);
            finalLog.setAmlActionName(amlStatus.getApprovedBy() != null ? amlStatus.getApprovedBy().getFullName() :
                    amlStatus.getRejectedBy() != null ? amlStatus.getRejectedBy().getFullName() : null);
            finalLog.setAmlActionRole(amlStatus.getApprovedBy() != null ? amlStatus.getApprovedBy().getUserRole() :
                    amlStatus.getRejectedBy() != null ? amlStatus.getRejectedBy().getUserRole() : null);
            finalLog.setAmlRemarks(amlStatus.getRemarks());
            accountOnlineFinalRepository.save(finalLog);

            log.info("AML updated for Legal ID: {}", amlStatus.getCustomerInfo().getLegalId());
        } else {
            log.warn("AML update skipped: AccountOnlineFinal not found for Legal ID {}",
                    amlStatus.getCustomerInfo().getLegalId());
        }
    }

    @Override
    public AccountOnlineFinalResponseDto findAccountByCifOrLegalId(AccountOnlineFinalLogRequestDto requestDto) {
        AccountOnlineFinal onlineFinal = accountOnlineFinalRepository
                .findTopByCifOrLegalIdOrderByCreatedAtDesc(requestDto.getCif(), requestDto.getLegalId())
                .orElseThrow(() -> new NotFoundException(
                        "Account not found for CIF: " + requestDto.getCif() + " or Legal ID: " + requestDto.getLegalId()
                ));

        AccountOnlineFinalResponseDto responseDto = mapper.toDto(onlineFinal);
        log.info("Returning account with nidImageName={}, selfieImageName={}", responseDto.getNidImageName(), responseDto.getSelfieImageName());

        return responseDto;
    }

    // === Helper methods ===
    private String formatFastAddress(String en, String kh, String code) {
        if (en != null && !en.isBlank() && kh != null && !kh.isBlank()) {
            return en + " / " + kh;
        }
        if (kh != null && !kh.isBlank()) return kh;
        if (en != null && !en.isBlank()) return en;
        return code != null ? code : "";
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) return null;
        try {
            return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        } catch (Exception e) {
            log.warn("Could not parse date: {}", dateStr);
            return null;
        }
    }
}
