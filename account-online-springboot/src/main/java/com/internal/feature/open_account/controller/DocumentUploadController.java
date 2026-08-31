package com.internal.feature.open_account.controller;

import com.internal.feature.customer_image.service.CustomerImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/document")
@RequiredArgsConstructor
@Slf4j
public class DocumentUploadController {

    private final CustomerImageService customerImageService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "legalId", required = false) String legalId) {
        try {
            log.info("[DocumentUploadController] Multipart upload request received. type={}, legalId={}, fileSize={}",
                    type, legalId, file.getSize());

            if (file.isEmpty()) {
                log.warn("[DocumentUploadController] Empty file uploaded");
                return ResponseEntity.badRequest()
                        .body(Collections.singletonMap("error", "File is empty"));
            }

            String filename = buildFilename(type, legalId);
            String savedFilename = customerImageService.saveUploadedFile(file, filename);

            log.info("[DocumentUploadController] Multipart upload saved successfully. filename={}", savedFilename);
            return ResponseEntity.ok(Collections.singletonMap("filename", savedFilename));

        } catch (Exception e) {
            log.error("[DocumentUploadController] Failed to upload multipart document. type={}, legalId={}, error={}", type, legalId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Failed to upload document"));
        }
    }

    private String buildFilename(String type, String legalId) {
        String identifier = (legalId != null && !legalId.isBlank()) ? legalId : UUID.randomUUID().toString();
        String prefix = (type != null && type.toLowerCase().contains("selfie")) ? "selfie_" : "nid_";
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS"));
        return prefix + identifier + "_" + timestamp + ".jpg";
    }
}
