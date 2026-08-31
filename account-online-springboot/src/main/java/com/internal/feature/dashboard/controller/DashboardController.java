package com.internal.feature.dashboard.controller;

import com.internal.shared.response.ApiResponse;
import com.internal.feature.dashboard.dto.response.DailyCountResponse;
import com.internal.feature.dashboard.dto.response.TopAmlActionUserResponse;
import com.internal.feature.dashboard.dto.response.TopUserOpenAccountResponse;
import com.internal.feature.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Slf4j
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/account-opening-chart")
    public ResponseEntity<ApiResponse<List<DailyCountResponse>>> getAccountOpeningChart(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        log.info("[DashboardController] Fetching account opening chart data. fromDate={}, toDate={}", fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success("Account opening chart data retrieved successfully",
                dashboardService.getAccountOpeningChart(fromDate, toDate)));
    }

    @GetMapping("/top-users-open-account")
    public ResponseEntity<ApiResponse<List<TopUserOpenAccountResponse>>> getTopUsersOpenAccount() {
        log.info("[DashboardController] Fetching top users for account opening");
        return ResponseEntity.ok(ApiResponse.success("Top account opening users retrieved successfully",
                dashboardService.getTopUsersOpenAccount()));
    }

    @GetMapping("/aml-hits-chart")
    public ResponseEntity<ApiResponse<List<DailyCountResponse>>> getAmlHitsChart(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        log.info("[DashboardController] Fetching AML hits chart data. fromDate={}, toDate={}", fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success("AML hits chart data retrieved successfully",
                dashboardService.getAmlHitsChart(fromDate, toDate)));
    }

    @GetMapping("/top-aml-action-users")
    public ResponseEntity<ApiResponse<List<TopAmlActionUserResponse>>> getTopAmlActionUsers() {
        log.info("[DashboardController] Fetching top AML action users");
        return ResponseEntity.ok(ApiResponse.success("Top AML action users retrieved successfully",
                dashboardService.getTopAmlActionUsers()));
    }
}
