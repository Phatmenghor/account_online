package com.internal.feature.open_account.service;

import com.internal.feature.open_account.models.CifActivationLog;
import com.internal.feature.open_account.repository.CifActivationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CifActivationLogService {

    private final CifActivationLogRepository cifActivationLogRepository;

    public void saveLog(CifActivationLog logEntry) {
        try {
            cifActivationLogRepository.save(logEntry);
        } catch (Exception e) {
            log.error("Failed to save CifActivationLog: {}", e.getMessage(), e);
        }
    }
}
