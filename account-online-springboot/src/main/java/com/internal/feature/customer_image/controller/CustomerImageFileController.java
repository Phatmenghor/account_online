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

@RestController
@RequestMapping("/api/customer-images")
@RequiredArgsConstructor
@Slf4j
public class CustomerImageFileController {

    private final CustomerImageService customerImageService;

    @GetMapping("/{filename:.+}")
    public ResponseEntity<byte[]> getImage(@PathVariable String filename) {
        if (filename == null || filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            log.warn("Invalid image filename request: {}", filename);
            return ResponseEntity.badRequest().build();
        }

        Optional<CustomerImageFileDto> imageFile = customerImageService.getCustomerImageFile(filename);

        return imageFile
                .map(file -> ResponseEntity.ok()
                        .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS).cachePublic())
                        .contentType(file.getMediaType())
                        .body(file.getContent()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
