package com.internal.feature.aml.controller;

import com.internal.feature.aml.dto.request.AllAmlHistoryRequestDto;
import com.internal.feature.aml.dto.request.AllAmlRequestDto;
import com.internal.feature.aml.dto.request.UpdateAmlStatusDto;
import com.internal.feature.aml.models.JuniorAmlHistory;
import com.internal.feature.aml.models.JuniorAmlStatus;
import com.internal.feature.aml.service.JuniorAmlService;
import com.internal.shared.constant.ResponseMessage;
import com.internal.shared.pagination.PaginationResponse;
import com.internal.shared.pagination.PaginationUtil;
import com.internal.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/junior-aml")
@RequiredArgsConstructor
@Slf4j
public class JuniorAmlController {

    private final JuniorAmlService juniorAmlService;

    /**
     * GET all Junior AML pending/filtered statuses from junior_aml_status table.
     */
    @PostMapping("/all-status")
    public ResponseEntity<ApiResponse<PaginationResponse<JuniorAmlStatus>>> getAllJuniorAmlStatus(
            @Valid @RequestBody AllAmlRequestDto request) {
        log.info("[JuniorAmlController] Fetching Junior AML status. search={}", request.getSearch());
        Pageable pageable = PaginationUtil.createPageable(request);
        Page<JuniorAmlStatus> page = juniorAmlService.getAllJuniorAmlStatus(request.getAmlStatusString(), request.getSearch(), pageable);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.AML_STATUSES_RETRIEVED, PaginationResponse.fromPage(page)));
    }

    /**
     * GET all Junior AML records (all statuses) from junior_aml_status table.
     */
    @PostMapping("/all-history")
    public ResponseEntity<ApiResponse<PaginationResponse<JuniorAmlStatus>>> getAllJuniorAmlHistory(
            @Valid @RequestBody AllAmlHistoryRequestDto request) {
        log.info("[JuniorAmlController] Fetching Junior AML history. search={}", request.getSearch());
        Pageable pageable = PaginationUtil.createPageable(request);
        Page<JuniorAmlStatus> page = juniorAmlService.getAllJuniorAmlHistory(request.getSearch(), pageable);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.AML_HISTORY_RETRIEVED, PaginationResponse.fromPage(page)));
    }

    /**
     * GET Junior AML history audit trail from junior_aml_history table (per status update).
     */
    @PostMapping("/history-records")
    public ResponseEntity<ApiResponse<PaginationResponse<JuniorAmlHistory>>> getJuniorAmlHistoryRecords(
            @Valid @RequestBody AllAmlHistoryRequestDto request) {
        log.info("[JuniorAmlController] Fetching Junior AML history records. search={}", request.getSearch());
        Page<JuniorAmlHistory> page = juniorAmlService.getJuniorAmlHistoryByStatusId(null, request);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.AML_HISTORY_RETRIEVED, PaginationResponse.fromPage(page)));
    }

    /**
     * GET single Junior AML history record by id.
     */
    @GetMapping("/history/{id}")
    public ResponseEntity<ApiResponse<JuniorAmlHistory>> getJuniorAmlHistoryById(@PathVariable Long id) {
        log.info("[JuniorAmlController] Fetching Junior AML history record by id={}", id);
        JuniorAmlHistory history = juniorAmlService.getJuniorAmlHistoryById(id);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.AML_HISTORY_RETRIEVED, history));
    }

    /**
     * UPDATE Junior AML status (approve/reject) — also saves a record to junior_aml_history.
     */
    @PostMapping("/update/{id}")
    public ResponseEntity<ApiResponse<JuniorAmlStatus>> updateJuniorAmlStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAmlStatusDto req) {
        log.info("[JuniorAmlController] Updating Junior AML status. id={}, newStatus={}", id, req.getStatus());
        JuniorAmlStatus updated = juniorAmlService.updateJuniorAmlStatus(id, req);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.AML_STATUS_UPDATED, updated));
    }
}
