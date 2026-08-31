package com.internal.feature.open_account.controller;

import com.internal.feature.customer_image.component.CustomerImageStorageComponent;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.UUID;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@Slf4j
public class PublicUploadController {

    private final CustomerImageStorageComponent storageComponent;

    @Data
    public static class Base64UploadRequest {
        private String fileBase64;
        private String fileName;
        private String type;
        private String legalId;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadBase64Document(@RequestBody Base64UploadRequest request) {
        try {
            log.info("[PublicUploadController] Base64 upload request received. type={}, legalId={}, fileName={}",
                    request.getType(), request.getLegalId(), request.getFileName());

            if (request.getFileBase64() == null || request.getFileBase64().isBlank()) {
                log.warn("[PublicUploadController] Empty fileBase64 provided");
                return ResponseEntity.badRequest()
                        .body(Collections.singletonMap("error", "File base64 is empty"));
            }

            String legalId = request.getLegalId();
            String type = request.getType() != null ? request.getType() : "nid";
            String prefix = type.toLowerCase().contains("selfie") ? "selfie_" : "nid_";
            String identifier = (legalId != null && !legalId.isBlank()) ? legalId : UUID.randomUUID().toString();
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS"));

            String finalFilename = prefix + identifier + "_" + timestamp + ".jpg";

            Path weekDir = storageComponent.resolveWeekFolder(type);
            Path filePath = weekDir.resolve(finalFilename);

            storageComponent.saveBase64ToFile(request.getFileBase64(), filePath.toString());

            log.info("[PublicUploadController] Base64 document saved successfully. filename={}, path={}", finalFilename, filePath);
            return ResponseEntity.ok(Collections.singletonMap("filename", finalFilename));

        } catch (Exception e) {
            log.error("[PublicUploadController] Failed to upload base64 document. type={}, legalId={}, error={}",
                    request.getType(), request.getLegalId(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Failed to upload document: " + e.getMessage()));
        }
    }
}
