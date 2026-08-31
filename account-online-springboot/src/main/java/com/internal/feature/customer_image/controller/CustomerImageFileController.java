package com.internal.feature.customer_image.controller;

import com.internal.feature.customer_image.dto.response.CustomerImageFileDto;
import com.internal.feature.customer_image.service.CustomerImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("/api/customer-images")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequiredArgsConstructor
@Slf4j
public class CustomerImageFileController {

    private final CustomerImageService customerImageService;

    @GetMapping("/{filename:.+}")
    public ResponseEntity<byte[]> getImage(@PathVariable String filename) {
        log.info("[CustomerImageFileController] Received request for image file: {}", filename);
        if (filename == null || filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            log.warn("[CustomerImageFileController] Rejected invalid filename path traversal attempt: {}", filename);
            return ResponseEntity.badRequest().build();
        }

        Optional<CustomerImageFileDto> imageFile = customerImageService.getCustomerImageFile(filename);

        return imageFile
                .map(file -> {
                    log.info("[CustomerImageFileController] Served image file: {} | Size: {} bytes | Type: {}",
                            filename, file.getContent().length, file.getMediaType());
                    return ResponseEntity.ok()
                            .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic())
                            .contentType(file.getMediaType())
                            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                            .body(file.getContent());
                })
                .orElseGet(() -> {
                    log.warn("[CustomerImageFileController] Image file not found: {}", filename);
                    return ResponseEntity.notFound().build();
                });
    }
}
