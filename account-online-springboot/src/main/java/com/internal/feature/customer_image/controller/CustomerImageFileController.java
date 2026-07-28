package com.internal.feature.customer_image.controller;

import com.internal.feature.customer_image.dto.response.CustomerImageFileDto;
import com.internal.feature.customer_image.service.CustomerImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/customer-images")
@RequiredArgsConstructor
@Slf4j
public class CustomerImageFileController {

    private final CustomerImageService customerImageService;

    @GetMapping("/{filename:.+}")
    public ResponseEntity<byte[]> getImage(@PathVariable String filename) {
        Optional<CustomerImageFileDto> imageFile = customerImageService.getCustomerImageFile(filename);

        return imageFile
                .map(file -> ResponseEntity.ok()
                        .contentType(file.getMediaType())
                        .body(file.getContent()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
