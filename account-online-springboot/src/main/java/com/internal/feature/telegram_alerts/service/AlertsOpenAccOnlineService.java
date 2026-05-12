package com.internal.feature.telegram_alerts.service;

import com.internal.enumation.OpenAccStatusEnum;
import com.internal.feature.aml.dto.response.AmlStatusDto;
import com.internal.feature.open_account.dto.response.PendingAccountOpeningRequestDto;

public interface AlertsOpenAccOnlineService {
    void sendTelegramAccountOnlineError(String idNumber, OpenAccStatusEnum status, StringBuilder remarkBuilder);
    void sendTelegramInternalError(String idNumber, OpenAccStatusEnum status, StringBuilder remarkBuilder);
    void sendTelegramAmlProcess(AmlStatusDto request);
    void sendAccountOpeningAlert(PendingAccountOpeningRequestDto request, String eventType);
}
