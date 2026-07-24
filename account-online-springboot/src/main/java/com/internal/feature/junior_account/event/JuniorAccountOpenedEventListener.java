package com.internal.feature.junior_account.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.internal.enumation.AmlStatusEnum;
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

    private void saveJuniorAccountFinalAsync(JuniorCustomerRequest request, OpenAccountContext context, String amlStatusStr, boolean hasNid) {
        try {
            JuniorAccountFinal juniorFinal = juniorAccountMapper.toJuniorAccountFinal(request, context, hasNid);

            juniorFinal.setLegalDateOfBirth(parseDate(request.getDateOfBirth()));
            juniorFinal.setLegalIssuedDate(parseDate(request.getLegalIssueDate()));
            juniorFinal.setLegalExpiredDate(parseDate(request.getLegalExpireDate()));

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
            log.info("Saved JuniorAccountFinal record in background for Legal ID: {}", request.getLegalId());

            juniorCustomerImageService.saveImage("NID", request.getNidImageName(), request.getLegalId(), request.getGuardianLegalId());
            juniorCustomerImageService.saveImage("SELFIE", request.getSelfieImageName(), request.getLegalId(), request.getGuardianLegalId());
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

            monitoringService.sendJuniorAccountCreatedAlert(
                    fullName,
                    request.getLegalAddress(),
                    request.getLegalId(),
                    context.getCif(),
                    context.getUsdAccount(),
                    context.getKhrAccount(),
                    branchName,
                    request.getGuardianName(),
                    request.getGuardianLegalId()
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
