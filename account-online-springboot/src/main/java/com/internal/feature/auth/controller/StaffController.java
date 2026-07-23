package com.internal.feature.auth.controller;

import com.internal.shared.response.ApiResponse;
import com.internal.feature.auth.dto.response.StaffResponseDto;
import com.internal.feature.auth.service.StaffLookupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/staff")
@RequiredArgsConstructor
@Slf4j
public class StaffController {

    private final StaffLookupService staffLookupService;

    @GetMapping("/{idCard}")
    public ResponseEntity<ApiResponse<StaffResponseDto>> getStaffByIdCard(@PathVariable String idCard) {
        log.info("Staff lookup request for ID Card: {}", idCard);
        StaffResponseDto staff = staffLookupService.findByIdCard(idCard);
        return ResponseEntity.ok(ApiResponse.success("Staff information found.", staff));
    }
}
