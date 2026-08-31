package com.internal.feature.camdx.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.internal.shared.response.ApiResponse;
import com.internal.feature.camdx.dto.request.CamdxFaceRequest;
import com.internal.feature.camdx.dto.request.CamdxValidateNidRequest;
import com.internal.feature.camdx.service.CamdxService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/public/nid")
@RequiredArgsConstructor
@Slf4j
public class CamdxController {

    private final CamdxService nidService;

    /**
     * Validate NID Information
     */
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<?>> validateNid(@Valid @RequestBody CamdxValidateNidRequest request) {
        log.info("[CamdxController] Processing NID validation request. idNumber={}", request.getIdNumber());
        JsonNode response = nidService.validateNid(request);
        log.info("[CamdxController] NID validation completed successfully. idNumber={}", request.getIdNumber());
        return ResponseEntity.ok(ApiResponse.success("NID validated successfully", response));
    }

    /**
     * Extract NID information via OCR
     */
    @PostMapping("/extract")
    public ResponseEntity<ApiResponse<?>> extractNid(@Valid @RequestBody CamdxFaceRequest request) {
        log.info("[CamdxController] Processing NID OCR extraction request.");
        JsonNode response = nidService.extractNid(request);
        log.info("[CamdxController] NID OCR extraction completed successfully.");
        return ResponseEntity.ok(ApiResponse.success("NID extracted successfully", response));
    }
}
