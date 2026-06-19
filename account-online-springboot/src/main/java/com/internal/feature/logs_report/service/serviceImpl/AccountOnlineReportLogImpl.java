package com.internal.feature.logs_report.service.serviceImpl;

import com.internal.enumation.OpenAccStatusEnum;
import com.internal.feature.logs_report.dto.request.AccountOnlineReportLogDto;
import com.internal.feature.logs_report.dto.response.AccountOnlineReportLogResponse;
import com.internal.feature.logs_report.dto.response.AccountOnlineReportProjection;
import com.internal.feature.logs_report.dto.response.AccountOnlineReportResponse;
import com.internal.feature.logs_report.mapper.AccountOnlineReportMapper;
import com.internal.feature.logs_report.model.AccountOnlineReportLog;
import com.internal.feature.logs_report.repository.AccountOnlineReportLogRepository;
import com.internal.feature.logs_report.service.AccountOnlineReportLogService;
import com.internal.utils.pagination.PaginationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountOnlineReportLogImpl implements AccountOnlineReportLogService {

    private final AccountOnlineReportLogRepository repository;
    private final AccountOnlineReportMapper accountOnlineReportMapper;

    @Override
    public void saveLogReport(String idNumber, OpenAccStatusEnum status, String remark) {
        repository.save(AccountOnlineReportLog.builder()
                .idNumber(idNumber)
                .status(status)
                .remark(remark)
                .build());
        log.info("Saved report log: idNumber={}, status={}", idNumber, status);
    }

    @Override
    public List<AccountOnlineReportResponse> getReportByDateRange(LocalDate fromDate, LocalDate toDate) {
        List<AccountOnlineReportProjection> projections = repository.getReportByDateRange(
                fromDate.atStartOfDay(),
                toDate.plusDays(1).atStartOfDay());
        List<AccountOnlineReportResponse> responses = accountOnlineReportMapper.projectionsToResponses(projections);
        log.info("Report by date range: from={}, to={}, records={}", fromDate, toDate, responses.size());
        return responses;
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createAccountOpeningLog(String idNumber, OpenAccStatusEnum status, String stepInfo, Exception exception) {
        StringBuilder remark = new StringBuilder("Step: ").append(stepInfo);
        if (exception != null) {
            remark.append(" | Error: ").append(exception.getClass().getSimpleName())
                    .append(" | Message: ").append(exception.getMessage());
            log.error("Account opening failed: idNumber={}, step={}, error={}", idNumber, stepInfo, exception.getMessage());
        }
        repository.save(AccountOnlineReportLog.builder()
                .idNumber(idNumber)
                .status(status)
                .remark(remark.toString())
                .build());
    }

    @Override
    public List<AccountOnlineReportLogResponse> getAllLogs(AccountOnlineReportLogDto request) {
        LocalDateTime fromDateTime = request.getFromDate() != null ? request.getFromDate().atStartOfDay() : null;
        LocalDateTime toDateTime = request.getToDate() != null ? request.getToDate().plusDays(1).atStartOfDay() : null;

        List<AccountOnlineReportLog> logs = repository.findByDateRangeAndStatuses(fromDateTime, toDateTime, request.getStatus());
        List<AccountOnlineReportLogResponse> responses = accountOnlineReportMapper.toResponseList(logs);
        log.info("Retrieved {} log records", responses.size());
        return responses;
    }

    @Override
    public PaginationResponse<AccountOnlineReportLogResponse> getLogsWithPagination(AccountOnlineReportLogDto request) {
        LocalDateTime fromDateTime = request.getFromDate() != null ? request.getFromDate().atStartOfDay() : null;
        LocalDateTime toDateTime = request.getToDate() != null ? request.getToDate().plusDays(1).atStartOfDay() : null;

        List<AccountOnlineReportLog> logs = repository.findByDateRangeAndStatuses(fromDateTime, toDateTime, request.getStatus());
        List<AccountOnlineReportLogResponse> responses = accountOnlineReportMapper.toResponseList(logs);

        PaginationResponse<AccountOnlineReportLogResponse> response = new PaginationResponse<>(
                responses, 1, responses.size(), responses.size());
        log.info("Retrieved {} log records (paginated)", responses.size());
        return response;
    }
}
