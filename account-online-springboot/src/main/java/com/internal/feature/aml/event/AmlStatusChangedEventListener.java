package com.internal.feature.aml.event;

import com.internal.feature.aml.dto.response.AmlStatusDto;
import com.internal.feature.logs_report.service.AccountOnlineOpenFinalService;
import com.internal.feature.telegram_alerts.service.MonitoringService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AmlStatusChangedEventListener {

    private final AccountOnlineOpenFinalService accountOnlineOpenFinalService;
    private final MonitoringService monitoringService;

    @EventListener
    public void handleAmlStatusChanged(AmlStatusChangedEvent event) {
        AmlStatusDto amlDto = event.getAmlStatusDto();
        String legalId = amlDto.getCustomerInfo() != null ? amlDto.getCustomerInfo().getLegalId() : "N/A";

        log.info("Processing post-update events for AML ID: {}, Legal ID: {}", amlDto.getId(), legalId);

        try {
            accountOnlineOpenFinalService.updateFinalLogWithAml(amlDto);
        } catch (Exception e) {
            log.error("Failed to update final log with AML for Legal ID: {}. Error: {}", legalId, e.getMessage());
        }

        try {
            monitoringService.sendAmlActionAlert(amlDto);
        } catch (Exception e) {
            log.error("Failed to send AML action Telegram alert for Legal ID: {}. Error: {}", legalId, e.getMessage());
        }
    }
}





