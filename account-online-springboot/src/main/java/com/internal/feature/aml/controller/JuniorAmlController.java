package com.internal.feature.aml.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.internal.feature.aml.dto.request.AllAmlHistoryRequestDto;
import com.internal.feature.aml.dto.request.AllAmlRequestDto;
import com.internal.feature.aml.dto.request.UpdateAmlStatusDto;
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
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/junior-aml")
@RequiredArgsConstructor
@Slf4j
public class JuniorAmlController {

    private final JuniorAmlService juniorAmlService;

    @PostMapping("/all-status")
    public ResponseEntity<ApiResponse<PaginationResponse<JuniorAmlStatus>>> getAllJuniorAmlStatus(
            @Valid @RequestBody AllAmlRequestDto request) {
        log.info("Fetching Junior AML status with search: {}", request.getSearch());
        Pageable pageable = PaginationUtil.createPageable(request);
        Page<JuniorAmlStatus> page = juniorAmlService.getAllJuniorAmlStatus(request.getAmlStatusString(), request.getSearch(), pageable);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.AML_STATUSES_RETRIEVED, PaginationResponse.fromPage(page)));
    }

    @PostMapping("/all-history")
    public ResponseEntity<ApiResponse<PaginationResponse<JuniorAmlStatus>>> getAllJuniorAmlHistory(
            @Valid @RequestBody AllAmlHistoryRequestDto request) {
        log.info("Fetching Junior AML history with search: {}", request.getSearch());
        Pageable pageable = PaginationUtil.createPageable(request);
        Page<JuniorAmlStatus> page = juniorAmlService.getAllJuniorAmlHistory(request.getSearch(), pageable);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.AML_HISTORY_RETRIEVED, PaginationResponse.fromPage(page)));
    }

    @PostMapping("/update/{id}")
    public ResponseEntity<ApiResponse<JuniorAmlStatus>> updateJuniorAmlStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAmlStatusDto req) throws JsonProcessingException {
        log.info("Updating Junior AML status for ID: {} to {}", id, req.getStatus());
        JuniorAmlStatus updated = juniorAmlService.updateJuniorAmlStatus(id, req);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.AML_STATUS_UPDATED, updated));
    }
}
