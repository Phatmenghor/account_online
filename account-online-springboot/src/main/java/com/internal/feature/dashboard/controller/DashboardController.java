package com.internal.feature.dashboard.controller;

import com.internal.shared.response.ApiResponse;
import com.internal.feature.dashboard.dto.response.DailyCountResponse;
import com.internal.feature.dashboard.dto.response.TopAmlActionUserResponse;
import com.internal.feature.dashboard.dto.response.TopUserOpenAccountResponse;
import com.internal.feature.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/account-opening-chart")
    public ResponseEntity<ApiResponse<List<DailyCountResponse>>> getAccountOpeningChart(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return ResponseEntity.ok(ApiResponse.success("OK",
                dashboardService.getAccountOpeningChart(fromDate, toDate)));
    }

    @GetMapping("/top-users-open-account")
    public ResponseEntity<ApiResponse<List<TopUserOpenAccountResponse>>> getTopUsersOpenAccount() {
        return ResponseEntity.ok(ApiResponse.success("OK",
                dashboardService.getTopUsersOpenAccount()));
    }

    @GetMapping("/aml-hits-chart")
    public ResponseEntity<ApiResponse<List<DailyCountResponse>>> getAmlHitsChart(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return ResponseEntity.ok(ApiResponse.success("OK",
                dashboardService.getAmlHitsChart(fromDate, toDate)));
    }

    @GetMapping("/top-aml-action-users")
    public ResponseEntity<ApiResponse<List<TopAmlActionUserResponse>>> getTopAmlActionUsers() {
        return ResponseEntity.ok(ApiResponse.success("OK",
                dashboardService.getTopAmlActionUsers()));
    }
}


