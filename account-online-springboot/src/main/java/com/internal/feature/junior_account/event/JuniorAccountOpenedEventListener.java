package com.internal.feature.junior_account.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.internal.enumation.AmlStatusEnum;
import com.internal.feature.customer_image.service.CustomerImageService;
import com.internal.feature.customer_image.service.JuniorCustomerImageService;
import com.internal.feature.junior_account.dto.request.JuniorCustomerRequest;
import com.internal.feature.junior_account.mapper.JuniorAccountMapper;
import com.internal.feature.junior_account.models.JuniorAccountFinal;
import com.internal.feature.junior_account.repository.JuniorAccountFinalRepository;
import com.internal.feature.master_data.models.Branch;
import com.internal.feature.master_data.repository.BranchRepository;
import com.internal.feature.open_account.dto.request.OpenAccountContext;
import com.internal.feature.telegram_alerts.service.MonitoringService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Asynchronous Event Listener for Junior Account post-opening operations.
 * Saves JuniorAccountFinal records and sends Telegram alerts to Junior Chat ID (-1002740302492).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JuniorAccountOpenedEventListener {

    private final JuniorAccountFinalRepository juniorAccountFinalRepository;
    private final JuniorCustomerImageService juniorCustomerImageService;
    private final CustomerImageService customerImageService;
    private final JuniorAccountMapper juniorAccountMapper;
    private final MonitoringService monitoringService;
    private final BranchRepository branchRepository;
    private final ObjectMapper objectMapper;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter T24_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    @Async
    @EventListener
    public void handleJuniorAccountOpenedEvent(JuniorAccountOpenedEvent event) {
        JuniorCustomerRequest request = event.getRequest();
        OpenAccountContext context = event.getContext();
        log.info("Processing background post-opening tasks for Junior Account. Legal ID: {}", request.getLegalId());

        // 1. Save JuniorAccountFinal record asynchronously
        saveJuniorAccountFinalAsync(request, context, event.getAmlStatusStr(), event.isHasNid());

        // 2. Send Telegram alert to Junior Group (-1002740302492)
        safeSendJuniorAccountCreatedAlert(request, context);

        log.info("Junior post-opening background tasks completed for Legal ID: {}", request.getLegalId());
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveJuniorAccountFinalAsync(JuniorCustomerRequest request, OpenAccountContext context, String amlStatusStr, boolean hasNid) {
        try {
            // 1. Save base64 image files FIRST so we get clean short filenames
            String selfieData = (request.getSelfieImageBase64() != null && !request.getSelfieImageBase64().isBlank())
                    ? request.getSelfieImageBase64()
                    : (request.getSelfieImageName() != null && request.getSelfieImageName().startsWith("data:image") ? request.getSelfieImageName() : null);

            if (selfieData != null && !selfieData.isBlank()) {
                try {
                    String selfieName = "selfie_" + request.getLegalId() + ".jpg";
                    customerImageService.saveBase64File(selfieData, selfieName, "junior_selfie");
                    request.setSelfieImageName(selfieName);
                } catch (Exception e) {
                    log.warn("Could not save Junior selfie image file to disk in listener: {}", e.getMessage());
                }
            }

            if (request.getReferenceDocImage() != null && !request.getReferenceDocImage().isBlank()) {
                try {
                    String docName = "ref_doc_" + request.getLegalId() + ".png";
                    customerImageService.saveBase64File(request.getReferenceDocImage(), docName, "junior_document");
                    request.setReferenceDocName(docName);
                    if (request.getNidImageName() == null || request.getNidImageName().isBlank() || request.getNidImageName().startsWith("data:image")) {
                        request.setNidImageName(docName);
                    }
                } catch (Exception e) {
                    log.warn("Could not save Junior reference document image file to disk in listener: {}", e.getMessage());
                }
            }

            // 2. Map request to JuniorAccountFinal AFTER filenames are clean
            JuniorAccountFinal juniorFinal = juniorAccountMapper.toJuniorAccountFinal(request, context, hasNid);

            // Explicitly set clean filenames on entity
            if (request.getSelfieImageName() != null && !request.getSelfieImageName().startsWith("data:image")) {
                juniorFinal.setSelfieImageName(request.getSelfieImageName());
            }
            if (request.getReferenceDocName() != null && !request.getReferenceDocName().startsWith("data:image")) {
                juniorFinal.setReferenceDocName(request.getReferenceDocName());
                juniorFinal.setNidImageName(request.getReferenceDocName());
            }

            // Reuse existing record ID if one already exists for this Legal ID
            juniorAccountFinalRepository.findTopByLegalIdOrderByCreatedAtDesc(request.getLegalId())
                    .ifPresent(existing -> juniorFinal.setId(existing.getId()));

            juniorFinal.setLegalDateOfBirth(parseDate(request.getDateOfBirth()));
            juniorFinal.setLegalIssuedDate(parseDate(request.getLegalIssueDate()));
            juniorFinal.setLegalExpiredDate(parseDate(request.getLegalExpireDate()));

            if (request.getBranchCode() != null) {
                branchRepository.findByBranchCode(request.getBranchCode())
                        .map(Branch::getBranchKh)
                        .ifPresent(juniorFinal::setBranchNameKh);
            }

            if (juniorFinal.getLegalDocName() == null || juniorFinal.getLegalDocName().isBlank()) {
                juniorFinal.setLegalDocName(hasNid ? "NATIONAL.ID" : (request.getReferenceDocType() != null ? request.getReferenceDocType() : "BIRTH.CERTIFICATE"));
            }

            if (juniorFinal.getSubmittedBy() == null || juniorFinal.getSubmittedBy().isBlank()) {
                juniorFinal.setSubmittedBy("Customer");
            }

            if (juniorFinal.getLegalPlaceOfBirth() == null || juniorFinal.getLegalPlaceOfBirth().isBlank()) {
                juniorFinal.setLegalPlaceOfBirth(request.getPlaceOfBirth());
            }

            if (juniorFinal.getNationality() == null) {
                juniorFinal.setNationality("KH");
            }

            try {
                if (amlStatusStr != null) {
                    juniorFinal.setAmlStatus(AmlStatusEnum.valueOf(amlStatusStr));
                } else {
                    juniorFinal.setAmlStatus(AmlStatusEnum.APPROVE);
                }
            } catch (Exception ignored) {
                juniorFinal.setAmlStatus(AmlStatusEnum.APPROVE);
            }

            try {
                juniorFinal.setRequestPayload(objectMapper.writeValueAsString(request));
            } catch (Exception ignored) {}

            juniorAccountFinalRepository.save(juniorFinal);
            log.info("Saved JuniorAccountFinal record in background for Legal ID: {}, Selfie: {}, RefDoc: {}",
                    request.getLegalId(), juniorFinal.getSelfieImageName(), juniorFinal.getReferenceDocName());

            if (juniorFinal.getNidImageName() != null && !juniorFinal.getNidImageName().isBlank()) {
                juniorCustomerImageService.saveImage("NID", juniorFinal.getNidImageName(), request.getLegalId(), request.getGuardianLegalId());
            }
            if (juniorFinal.getSelfieImageName() != null && !juniorFinal.getSelfieImageName().isBlank()) {
                juniorCustomerImageService.saveImage("SELFIE", juniorFinal.getSelfieImageName(), request.getLegalId(), request.getGuardianLegalId());
            }
            if (juniorFinal.getReferenceDocName() != null && !juniorFinal.getReferenceDocName().isBlank()) {
                juniorCustomerImageService.saveImage("REF_DOC", juniorFinal.getReferenceDocName(), request.getLegalId(), request.getGuardianLegalId());
            }
        } catch (Exception e) {
            log.error("Failed to save JuniorAccountFinal record for Legal ID: {}. Error: {}", request.getLegalId(), e.getMessage(), e);
        }
    }

    private void safeSendJuniorAccountCreatedAlert(JuniorCustomerRequest request, OpenAccountContext context) {
        try {
            String fullName = joinNonBlank(request.getGivenName(), request.getFamilyName());
            if (fullName.isBlank()) {
                fullName = joinNonBlank(request.getFirstNameKh(), request.getLastNameKh());
            }

            String branchName = branchRepository.findByBranchCode(request.getBranchCode())
                    .map(Branch::getBranchKh)
                    .orElse(request.getBranchCode());

            List<String> parts = new ArrayList<>();
            String villagePart = formatTelegramAddressPart(request.getCustomerVillageEn(), request.getCustomerVillageKh());
            if (!villagePart.isBlank()) parts.add(villagePart);

            String communePart = formatTelegramAddressPart(request.getCustomerCommuneEn(), request.getCustomerCommuneKh());
            if (!communePart.isBlank()) parts.add(communePart);

            String districtPart = formatTelegramAddressPart(request.getCustomerDistrictEn(), request.getCustomerDistrictKh());
            if (!districtPart.isBlank()) parts.add(districtPart);

            String provincePart = formatTelegramAddressPart(request.getCustomerProvinceEn(), request.getCustomerProvinceKh());
            if (!provincePart.isBlank()) parts.add(provincePart);

            String fullAddress = String.join(", ", parts);
            if (isBlank(fullAddress)) {
                fullAddress = request.getLegalAddress() != null ? request.getLegalAddress() : "";
            }

            boolean hasNid = Boolean.TRUE.equals(request.getHasNid());

            monitoringService.sendJuniorAccountCreatedAlert(
                    hasNid,
                    fullName,
                    fullAddress,
                    request.getLegalId(),
                    request.getPhoneNumber(),
                    context.getCif(),
                    context.getUsdAccount(),
                    context.getKhrAccount(),
                    branchName,
                    request.getGuardianName(),
                    request.getGuardianLegalId(),
                    request.getGuardianPhone(),
                    request.getGuardianRelationship(),
                    request.getGuardianCif(),
                    request.getReferenceDocType(),
                    request.getReferenceDocName()
            );
        } catch (Exception e) {
            log.error("Failed to send Junior Telegram alert for Legal ID: {}", request.getLegalId(), e);
        }
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            if (dateStr.matches("\\d{8}")) {
                return LocalDate.parse(dateStr, T24_DATE_FORMATTER);
            }
            return LocalDate.parse(dateStr, DATE_FORMATTER);
        } catch (Exception e) {
            return null;
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String formatTelegramAddressPart(String en, String kh) {
        if (!isBlank(en) && !isBlank(kh)) {
            return en.trim() + " (" + kh.trim() + ")";
        }
        if (!isBlank(kh)) return kh.trim();
        if (!isBlank(en)) return en.trim();
        return "";
    }

    private String joinNonBlank(String a, String b) {
        StringBuilder sb = new StringBuilder();
        if (a != null && !a.isBlank()) sb.append(a.trim());
        if (b != null && !b.isBlank()) {
            if (!sb.isEmpty()) sb.append(" ");
            sb.append(b.trim());
        }
        return sb.toString();
    }
}
