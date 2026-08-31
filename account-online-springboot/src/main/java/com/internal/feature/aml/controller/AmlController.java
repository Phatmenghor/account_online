package com.internal.feature.aml.controller;

import com.internal.feature.aml.dto.request.AllAmlHistoryRequestDto;
import com.internal.feature.aml.dto.request.AllAmlRequestDto;
import com.internal.feature.aml.dto.request.UpdateAmlStatusDto;
import com.internal.feature.aml.dto.response.AllAmlHistoryResponseDto;
import com.internal.feature.aml.dto.response.AllAmlResponseDto;
import com.internal.feature.aml.dto.response.AmlHistoryDto;
import com.internal.feature.aml.dto.response.AmlStatusDto;
import com.internal.feature.aml.service.AmlService;
import com.internal.shared.constant.ResponseMessage;
import com.internal.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/aml")
@RequiredArgsConstructor
@Slf4j
public class AmlController {

    private final AmlService service;

    @PostMapping("/all-history")
    public ResponseEntity<ApiResponse<AllAmlHistoryResponseDto>> getAllHistory(@Valid @RequestBody AllAmlHistoryRequestDto request) {
        log.info("[AmlController] Fetching all AML history");
        AllAmlHistoryResponseDto list = service.getAllAmlHistory(request);
        log.info("[AmlController] Successfully retrieved {} AML history records", list.getContent() != null ? list.getContent().size() : 0);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.AML_HISTORY_RETRIEVED, list));
    }

    @PostMapping("/all-status")
    public ResponseEntity<ApiResponse<AllAmlResponseDto>> getAllStatus(@Valid @RequestBody AllAmlRequestDto request) {
        log.info("[AmlController] Fetching all AML statuses. search={}", request.getSearch());
        AllAmlResponseDto list = service.getAllAml(request);
        log.info("[AmlController] Successfully retrieved {} AML status records", list.getContent() != null ? list.getContent().size() : 0);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.AML_STATUSES_RETRIEVED, list));
    }

    @PostMapping("/status-by-id/{id}")
    public ResponseEntity<ApiResponse<AmlStatusDto>> getAmlById(@PathVariable Long id) {
        log.info("[AmlController] Fetching AML status by id={}", id);
        AmlStatusDto amlStatusDto = service.getAmlById(id);
        log.info("[AmlController] Successfully retrieved AML status record. id={}", id);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.AML_STATUS_RETRIEVED, amlStatusDto));
    }

    @PostMapping("/history-by-id/{id}")
    public ResponseEntity<ApiResponse<AmlHistoryDto>> getAmlHistoryById(@PathVariable Long id) {
        log.info("[AmlController] Fetching AML history by id={}", id);
        AmlHistoryDto amlStatusDto = service.getAmlHistoryById(id);
        log.info("[AmlController] Successfully retrieved AML history record. id={}", id);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.AML_STATUS_RETRIEVED, amlStatusDto));
    }

    @PostMapping("/update/{id}")
    public ResponseEntity<ApiResponse<AmlStatusDto>> updateAmlStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAmlStatusDto req
    ) {
        log.info("[AmlController] Updating AML status. id={}, newStatus={}", id, req.getStatus());
        AmlStatusDto updatedStatus = service.updateAmlStatus(id, req);
        log.info("[AmlController] AML status updated successfully. id={}", updatedStatus.getId());
        return ResponseEntity.ok(ApiResponse.success(
                ResponseMessage.AML_STATUS_UPDATED, updatedStatus
        ));
    }
}
