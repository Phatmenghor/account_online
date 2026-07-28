package com.internal.feature.aml.event;

import com.internal.enumation.AmlStatusEnum;
import com.internal.feature.aml.dto.response.AmlStatusDto;
import com.internal.feature.aml.models.AmlStatus;
import com.internal.feature.aml.repository.AmlStatusRepository;
import com.internal.feature.open_account.service.AccountFinalService;
import com.internal.feature.open_account.dto.request.CustomerRequest;
import com.internal.feature.open_account.mapper.OpenAccountAmlStatusMapper;
import com.internal.feature.open_account.service.OpenAccountService;
import com.internal.feature.telegram_alerts.service.MonitoringService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Component
@RequiredArgsConstructor
@Slf4j
public class AmlStatusChangedEventListener {

    private final AccountFinalService accountOnlineOpenFinalService;
    private final MonitoringService monitoringService;
    private final OpenAccountService openAccountService;
    private final OpenAccountAmlStatusMapper openAccountAmlStatusMapper;
    private final AmlStatusRepository amlStatusRepository;

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

        // When AML status is updated to APPROVE, trigger background account opening without re-checking AML
        if (amlDto.getStatus() == AmlStatusEnum.APPROVE) {
            log.info("AML status is APPROVED for Legal ID: {}. Triggering background account creation...", legalId);
            CompletableFuture.runAsync(() -> {
                try {
                    AmlStatus amlStatus = amlStatusRepository.findById(amlDto.getId()).orElse(null);
                    if (amlStatus != null) {
                        CustomerRequest customerRequest = openAccountAmlStatusMapper.toCustomerRequest(amlStatus);
                        log.info("Executing background account opening for Legal ID: {}", legalId);
                        openAccountService.processAccountOpening(customerRequest);
                        log.info("Background account opening process completed successfully for Legal ID: {}", legalId);
                    }
                } catch (Exception e) {
                    log.error("Background account opening encountered an exception for Legal ID: {}. AML status remains APPROVED. Details: {}",
                            legalId, e.getMessage(), e);
                }
            });
        }
    }
}





