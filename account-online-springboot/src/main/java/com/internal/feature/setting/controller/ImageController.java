package com.internal.feature.setting.controller;

import com.internal.feature.setting.dto.request.ImageDto;
import com.internal.feature.setting.dto.request.ImageUploadRequest;
import com.internal.feature.setting.dto.response.ImageResponse;
import com.internal.feature.setting.service.ImageService;
import com.internal.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
@Slf4j
public class ImageController {
    
    private final ImageService imageService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<ImageDto>> uploadImage(@Valid @RequestBody ImageUploadRequest request) {
        log.info("[ImageController] Image upload request received");
        ImageDto uploadedImage = imageService.uploadImage(request);
        log.info("[ImageController] Image uploaded successfully. id={}", uploadedImage.getId());
        return new ResponseEntity<>(ApiResponse.success("Image uploaded successfully", uploadedImage), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getImageData(@PathVariable UUID id) {
        log.info("[ImageController] Fetching image data. id={}", id);
        ImageResponse imageResponse = imageService.getImageById(id);
        return ResponseEntity
                .ok()
                .cacheControl(CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic())
                .contentType(MediaType.valueOf(imageResponse.getType()))
                .body(imageResponse.getData());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@PathVariable UUID id) {
        log.info("[ImageController] Image deletion request. id={}", id);
        imageService.deleteImage(id);
        log.info("[ImageController] Image deleted successfully. id={}", id);
        return ResponseEntity.ok(ApiResponse.success("Image deleted successfully", null));
    }
}
