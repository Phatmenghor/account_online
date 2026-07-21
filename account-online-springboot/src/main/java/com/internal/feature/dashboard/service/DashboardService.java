package com.internal.feature.dashboard.service;

import com.internal.feature.aml.repository.AmlHistoryRepository;
import com.internal.feature.aml.repository.AmlStatusRepository;
import com.internal.feature.dashboard.dto.response.DailyCountResponse;
import com.internal.feature.dashboard.dto.response.TopAmlActionUserResponse;
import com.internal.feature.dashboard.dto.response.TopUserOpenAccountResponse;
import com.internal.feature.logs_report.repository.AccountOnlineFinalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AccountOnlineFinalRepository accountOnlineFinalRepository;
    private final AmlStatusRepository amlStatusRepository;
    private final AmlHistoryRepository amlHistoryRepository;

    public List<DailyCountResponse> getAccountOpeningChart(LocalDate fromDate, LocalDate toDate) {
        LocalDateTime from = fromDate.atStartOfDay();
        LocalDateTime to = toDate.plusDays(1).atStartOfDay();
        List<Object[]> rows = accountOnlineFinalRepository.countByDateRange(from, to);
        return rows.stream()
                .map(r -> new DailyCountResponse(
                        String.valueOf(r[0]),
                        ((Number) r[1]).longValue()))
                .collect(Collectors.toList());
    }

    public List<TopUserOpenAccountResponse> getTopUsersOpenAccount() {
        List<Object[]> rows = accountOnlineFinalRepository.findTopUsersByAccountCount();
        return rows.stream()
                .map(r -> new TopUserOpenAccountResponse(
                        r[0] != null ? ((Number) r[0]).longValue() : null,
                        (String) r[1],
                        (String) r[2],
                        (String) r[3],
                        (String) r[4],
                        ((Number) r[5]).longValue()))
                .collect(Collectors.toList());
    }

    public List<DailyCountResponse> getAmlHitsChart(LocalDate fromDate, LocalDate toDate) {
        LocalDateTime from = fromDate.atStartOfDay();
        LocalDateTime to = toDate.plusDays(1).atStartOfDay();
        List<Object[]> rows = amlStatusRepository.countByDateRange(from, to);
        return rows.stream()
                .map(r -> new DailyCountResponse(
                        String.valueOf(r[0]),
                        ((Number) r[1]).longValue()))
                .collect(Collectors.toList());
    }

    public List<TopAmlActionUserResponse> getTopAmlActionUsers() {
        List<Object[]> rows = amlHistoryRepository.findTopAmlActionUsers();
        return rows.stream()
                .map(r -> new TopAmlActionUserResponse(
                        r[0] != null ? ((Number) r[0]).longValue() : null,
                        (String) r[1],
                        (String) r[2],
                        (String) r[3],
                        (String) r[4],
                        ((Number) r[5]).longValue(),
                        ((Number) r[6]).longValue(),
                        ((Number) r[7]).longValue()))
                .collect(Collectors.toList());
    }
}





