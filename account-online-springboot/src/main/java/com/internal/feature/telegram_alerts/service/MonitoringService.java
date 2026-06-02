package com.internal.feature.telegram_alerts.service;

import com.internal.enumation.AmlStatusEnum;
import com.internal.feature.aml.dto.response.AmlStatusDto;
import com.internal.feature.logs_report.service.CustomerImageService;
import com.internal.feature.telegram_alerts.config.TelegramService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class MonitoringService {

    private final TelegramService telegramService;
    private final CustomerImageService customerImageService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public void sendHighRiskAmlAlert(AmlStatusDto amlDto) {
        if (amlDto == null) return;
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            String timeFormatted = amlDto.getCreatedAt() != null
                    ? amlDto.getCreatedAt().format(formatter)
                    : LocalDateTime.now(ZoneId.of("Asia/Phnom_Penh")).format(formatter);

            String legalId = amlDto.getCustomerInfo() != null ? amlDto.getCustomerInfo().getLegalId() : null;

            StringBuilder msg = new StringBuilder();
            msg.append("*AML Account Online - HIGH RISK*\n")
                    .append("--------------------\n");

            if (amlDto.getCustomerInfo() != null) {
                appendIfNotEmpty(msg, "Name", buildName(amlDto));
                appendIfNotEmpty(msg, "Legal ID", legalId);
                appendIfNotEmpty(msg, "Gender", amlDto.getCustomerInfo().getGender());
                appendIfNotEmpty(msg, "DOB", amlDto.getCustomerInfo().getDateOfBirth());
                appendIfNotEmpty(msg, "Nationality", amlDto.getCustomerInfo().getNationality());
                appendIfNotEmpty(msg, "Phone Number", amlDto.getCustomerInfo().getPhoneNumber());
                appendIfNotEmpty(msg, "ID Issued", amlDto.getCustomerInfo().getIssuedDate());
                appendIfNotEmpty(msg, "ID Expired", amlDto.getCustomerInfo().getExpiredDate());
            }

            appendIfNotEmpty(msg, "Current Address", amlDto.getCurrentAddressName());
            appendIfNotEmpty(msg, "Place of Birth", amlDto.getPlaceOfBirthName());
            appendIfNotEmpty(msg, "Marital Status", amlDto.getMaritalStatus());
            appendIfNotEmpty(msg, "Occupation", amlDto.getOccupationStatus());
            appendIfNotEmpty(msg, "Risk Level", amlDto.getRiskLevel());
            appendIfNotEmpty(msg, "Service Name", amlDto.getServiceName());

            if (amlDto.getTotalRulesScore() > 0) {
                msg.append("- Total Rules Score: `").append(amlDto.getTotalRulesScore()).append("`\n");
            }

            String rulesTriggered = amlDto.getRulesTriggered();
            if (rulesTriggered != null && !rulesTriggered.isEmpty()) {
                msg.append("- Rules Triggered: `").append(escape(rulesTriggered)).append("`\n");
            }

            appendIfNotEmpty(msg, "Transaction ID", amlDto.getTrxnID());
            appendIfNotEmpty(msg, "Remarks", amlDto.getRemarks());
            appendIfNotEmpty(msg, "Created By", amlDto.getSubmittedBy());

            msg.append("--------------------\n")
                    .append("Status: `PENDING`\n")
                    .append("Time: `").append(timeFormatted).append("`");

            telegramService.sendToMonitor(msg.toString());

            // Send NID and selfie photos if available
            if (legalId != null) {
                try {
                    Resource nidImage = customerImageService.getNidImageResourceForEmail(legalId);
                    if (nidImage != null && nidImage.exists()) {
                        telegramService.sendPhotoToMonitor("*HIGH RISK - NID Photo*\nLegal ID: `" + escape(legalId) + "`", nidImage);
                    }
                } catch (Exception e) {
                    log.debug("Could not send NID photo for {}: {}", legalId, e.getMessage());
                }
                try {
                    Resource selfieImage = customerImageService.getSelfieImageResourceForEmail(legalId);
                    if (selfieImage != null && selfieImage.exists()) {
                        telegramService.sendPhotoToMonitor("*HIGH RISK - Face Photo*\nLegal ID: `" + escape(legalId) + "`", selfieImage);
                    }
                } catch (Exception e) {
                    log.debug("Could not send selfie photo for {}: {}", legalId, e.getMessage());
                }
            }

        } catch (Exception e) {
            log.error("Failed to send HIGH RISK AML alert: {}", e.getMessage());
        }
    }

    public void sendAmlActionAlert(AmlStatusDto amlDto) {
        if (amlDto == null || amlDto.getStatus() == null) return;
        if (amlDto.getStatus() != AmlStatusEnum.APPROVE && amlDto.getStatus() != AmlStatusEnum.REJECT) return;
        try {
            String legalId = amlDto.getCustomerInfo() != null ? amlDto.getCustomerInfo().getLegalId() : null;
            String name = amlDto.getCustomerInfo() != null ? buildName(amlDto) : "";
            String status = amlDto.getStatus().name();
            String actionBy = resolveActionBy(amlDto);
            String timeFormatted = amlDto.getUpdatedAt() != null
                    ? amlDto.getUpdatedAt().format(DATE_FORMATTER)
                    : LocalDateTime.now(ZoneId.of("Asia/Phnom_Penh")).format(DATE_FORMATTER);

            StringBuilder msg = new StringBuilder();
            msg.append(amlDto.getStatus() == AmlStatusEnum.APPROVE
                    ? "*AML Account Online - APPROVED ✅*\n"
                    : "*AML Account Online - REJECTED ❌*\n")
                    .append("--------------------\n");

            appendIfNotEmpty(msg, "Name", name);
            appendIfNotEmpty(msg, "Legal ID", legalId);
            if (amlDto.getCustomerInfo() != null) {
                appendIfNotEmpty(msg, "Phone Number", amlDto.getCustomerInfo().getPhoneNumber());
            }
            appendIfNotEmpty(msg, "Risk Level", amlDto.getRiskLevel());
            appendIfNotEmpty(msg, "Remarks", amlDto.getRemarks());

            msg.append("--------------------\n")
                    .append("Status: `").append(status).append("`\n")
                    .append("By: `").append(escape(actionBy)).append("`\n")
                    .append("Time: `").append(timeFormatted).append("`");

            telegramService.sendToMonitor(msg.toString());
        } catch (Exception e) {
            log.error("Failed to send AML action alert: {}", e.getMessage());
        }
    }

    private String resolveActionBy(AmlStatusDto amlDto) {
        if (amlDto.getStatus() == AmlStatusEnum.APPROVE && amlDto.getApprovedBy() != null) {
            String name = amlDto.getApprovedBy().getFullName();
            return (name != null && !name.isBlank()) ? name : amlDto.getApprovedBy().getIdCard();
        }
        if (amlDto.getStatus() == AmlStatusEnum.REJECT && amlDto.getRejectedBy() != null) {
            String name = amlDto.getRejectedBy().getFullName();
            return (name != null && !name.isBlank()) ? name : amlDto.getRejectedBy().getIdCard();
        }
        return "Unknown";
    }

    private String buildName(AmlStatusDto amlDto) {
        var info = amlDto.getCustomerInfo();
        String name = joinNonNull(info.getGivenName(), info.getFamilyName());
        if (name.isEmpty()) name = joinNonNull(info.getFirstNameKh(), info.getLastNameKh());
        return name;
    }

    private String joinNonNull(String a, String b) {
        StringBuilder sb = new StringBuilder();
        if (a != null && !a.isBlank()) sb.append(a.trim());
        if (b != null && !b.isBlank()) {
            if (!sb.isEmpty()) sb.append(" ");
            sb.append(b.trim());
        }
        return sb.toString();
    }

    private void appendIfNotEmpty(StringBuilder sb, String label, String value) {
        if (value != null && !value.isBlank()) {
            sb.append("- ").append(label).append(": `").append(escape(value)).append("`\n");
        }
    }

    private String escape(String text) {
        if (text == null) return "";
        return text.replace("_", "\\_").replace("*", "\\*").replace("`", "\\`").replace("~", "\\~");
    }

    private String now() {
        return LocalDateTime.now(ZoneId.of("Asia/Phnom_Penh")).format(DATE_FORMATTER);
    }
}
