package com.internal.feature.customer_image.service.impl;

import com.internal.feature.customer_image.component.CustomerImageStorageComponent;
import com.internal.feature.customer_image.dto.response.CustomerImageFileDto;
import com.internal.feature.customer_image.dto.response.CustomerImageUploadResponseDto;
import com.internal.feature.customer_image.models.CustomerImage;
import com.internal.feature.customer_image.repository.CustomerImageRepository;
import com.internal.feature.customer_image.service.CustomerImageService;
import com.internal.feature.open_account.dto.request.CustomerFileUploadRequestDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerImageServiceImpl implements CustomerImageService {

    private final CustomerImageRepository customerImageRepository;
    private final CustomerImageStorageComponent storageComponent;

    @Value("${file.upload.nid:/nid}")
    private String nidPath;

    @Value("${file.upload.selfie:/selfie}")
    private String selfiePath;

    @Override
    public CustomerImageUploadResponseDto saveCustomerImages(CustomerFileUploadRequestDto request) {
        try {
            String uploadDir = storageComponent.getUploadDir();
            new File(uploadDir + nidPath).mkdirs();
            new File(uploadDir + selfiePath).mkdirs();

            String legalId = request.getLegal_id();
            String nidFileName;
            String selfieFileName;

            if (request.getNidImage() != null && !request.getNidImage().isEmpty()) {
                if (request.getNidImage().startsWith("nid_")) {
                    nidFileName = request.getNidImage();
                } else {
                    nidFileName = "nid_" + legalId + ".jpg";
                    Path weekDir = storageComponent.resolveWeekFolder("nid");
                    storageComponent.saveBase64ToFile(request.getNidImage(), weekDir.resolve(nidFileName).toString());
                }
            } else {
                Path existing = storageComponent.findLatestFileRecursive(
                        Paths.get(uploadDir, "nid"), "nid_" + legalId + "_");
                nidFileName = (existing != null) ? existing.getFileName().toString() : null;
            }

            if (request.getSelfieImage() != null && !request.getSelfieImage().isEmpty()) {
                if (request.getSelfieImage().startsWith("selfie_")) {
                    selfieFileName = request.getSelfieImage();
                } else {
                    selfieFileName = "selfie_" + legalId + ".jpg";
                    Path weekDir = storageComponent.resolveWeekFolder("selfie");
                    storageComponent.saveBase64ToFile(request.getSelfieImage(), weekDir.resolve(selfieFileName).toString());
                }
            } else {
                Path existing = storageComponent.findLatestFileRecursive(
                        Paths.get(uploadDir, "selfie"), "selfie_" + legalId + "_");
                selfieFileName = (existing != null) ? existing.getFileName().toString() : null;
            }

            if (nidFileName != null) {
                customerImageRepository.save(CustomerImage.builder()
                        .type("NID")
                        .legal_id(legalId)
                        .name(nidFileName)
                        .filePath(storageComponent.getCurrentWeekFolder() + "/" + nidFileName)
                        .build());
            }

            if (selfieFileName != null) {
                customerImageRepository.save(CustomerImage.builder()
                        .type("SELFIE")
                        .legal_id(legalId)
                        .name(selfieFileName)
                        .filePath(storageComponent.getCurrentWeekFolder() + "/" + selfieFileName)
                        .build());
            }

            return CustomerImageUploadResponseDto.builder()
                    .nidImagePath(nidFileName)
                    .selfieImagePath(selfieFileName)
                    .build();

        } catch (Exception e) {
            log.error("Failed to save customer images: {}", e.getMessage(), e);
            throw new RuntimeException("Error saving images", e);
        }
    }

    @Override
    public String saveBase64File(String base64, String filename, String type) throws Exception {
        String baseType;
        if (type != null && type.toLowerCase().contains("selfie")) {
            baseType = "selfie";
        } else if (type != null && (type.toLowerCase().contains("doc") || type.toLowerCase().contains("ref"))) {
            baseType = "document";
        } else {
            baseType = "nid";
        }
        boolean isJunior = (type != null && type.toLowerCase().contains("junior"));
        String subFolder = isJunior ? "junior/" + baseType : baseType;

        Path weekDir = storageComponent.resolveWeekFolder(subFolder);
        String filePath = weekDir.resolve(filename).toString();

        storageComponent.saveBase64ToFile(base64, filePath);

        String legalId = storageComponent.extractLegalIdFromFilename(filename);

        customerImageRepository.save(CustomerImage.builder()
                .type((isJunior ? "JUNIOR_" : "") + baseType.toUpperCase())
                .legal_id(legalId)
                .name(filename)
                .filePath(subFolder + "/" + storageComponent.getCurrentWeekFolder() + "/" + filename)
                .build());

        log.info("Saved base64 file: {} → week folder: {}", filename, weekDir);
        return filename;
    }

    @Override
    public String saveUploadedFile(MultipartFile file, String filename) throws Exception {
        String baseType = filename.startsWith("selfie_") ? "selfie" : "nid";
        boolean isJunior = filename.toLowerCase().contains("junior");
        String subFolder = isJunior ? "junior/" + baseType : baseType;

        Path weekDir = storageComponent.resolveWeekFolder(subFolder);
        Path targetPath = weekDir.resolve(filename);

        storageComponent.saveCompressedImage(file.getBytes(), targetPath.toString());

        String legalId = storageComponent.extractLegalIdFromFilename(filename);

        customerImageRepository.save(CustomerImage.builder()
                .type((isJunior ? "JUNIOR_" : "") + baseType.toUpperCase())
                .legal_id(legalId)
                .name(filename)
                .filePath(subFolder + "/" + storageComponent.getCurrentWeekFolder() + "/" + filename)
                .build());

        log.info("Saved uploaded file: {} → week folder: {}", filename, weekDir);
        return filename;
    }

    private Path getJuniorParentPath() {
        return Paths.get(storageComponent.getUploadDir());
    }

    @Override
    public Resource getNidImageResourceForEmail(String customerId) {
        try {
            Optional<Path> found = storageComponent.findFileByName("junior/document", "ref_doc_" + customerId);
            if (found.isEmpty()) {
                found = storageComponent.findFileByName("junior/nid", "nid_" + customerId);
            }
            if (found.isEmpty()) {
                found = storageComponent.findFileByName("junior", "ref_doc_" + customerId);
            }
            if (found.isEmpty()) {
                found = storageComponent.findFileByName("junior", "nid_" + customerId);
            }
            if (found.isEmpty()) {
                found = storageComponent.findFileByName("nid", "nid_" + customerId);
            }
            if (found.isPresent() && Files.exists(found.get())) {
                log.info("Found document/NID resource for Telegram/email: {}", found.get());
                return new FileSystemResource(found.get().toFile());
            }
            log.warn("Document/NID resource not found for customerId: {}", customerId);
            return null;
        } catch (Exception e) {
            log.error("Failed to get NID image resource: {}", e.getMessage(), e);
            return null;
        }
    }

    @Override
    public byte[] getNidImageBytes(String customerId) {
        try {
            Resource res = getNidImageResourceForEmail(customerId);
            if (res != null && res.exists()) {
                return Files.readAllBytes(res.getFile().toPath());
            }
            return null;
        } catch (IOException e) {
            log.error("Failed to read NID image bytes: {}", e.getMessage(), e);
            return null;
        }
    }

    @Override
    public Resource getSelfieImageResourceForEmail(String customerId) {
        try {
            Optional<Path> found = storageComponent.findFileByName("junior/selfie", "selfie_" + customerId);
            if (found.isEmpty()) {
                found = storageComponent.findFileByName("junior", "selfie_" + customerId);
            }
            if (found.isEmpty()) {
                found = storageComponent.findFileByName("selfie", "selfie_" + customerId);
            }
            if (found.isPresent() && Files.exists(found.get())) {
                log.info("Found Selfie resource for Telegram/email: {}", found.get());
                return new FileSystemResource(found.get().toFile());
            }
            log.warn("Selfie resource not found for customerId: {}", customerId);
            return null;
        } catch (Exception e) {
            log.error("Failed to get Selfie image resource: {}", e.getMessage(), e);
            return null;
        }
    }

    @Override
    public byte[] getSelfieImageBytes(String customerId) {
        try {
            String uploadDir = storageComponent.getUploadDir();
            Path imagePath = storageComponent.findLatestFileRecursive(
                    Paths.get(uploadDir, "selfie"), "selfie_" + customerId + "_");
            if (imagePath == null) {
                imagePath = storageComponent.findLatestFileRecursive(
                        getJuniorParentPath().resolve("junior/selfie"), "selfie_" + customerId + "_");
            }
            if (imagePath == null) {
                return null;
            }
            return Files.readAllBytes(imagePath);
        } catch (IOException e) {
            log.error("Failed to read Selfie image bytes: {}", e.getMessage(), e);
            return null;
        }
    }

    @Override
    public boolean nidImageExists(String customerId) {
        String uploadDir = storageComponent.getUploadDir();
        return storageComponent.findLatestFileRecursive(
                Paths.get(uploadDir, "nid"), "nid_" + customerId + "_") != null;
    }

    @Override
    public boolean selfieImageExists(String customerId) {
        String uploadDir = storageComponent.getUploadDir();
        return storageComponent.findLatestFileRecursive(
                Paths.get(uploadDir, "selfie"), "selfie_" + customerId + "_") != null;
    }

    public Optional<Path> findFileByName(String subFolder, String filename) {
        return storageComponent.findFileByName(subFolder, filename);
    }

    @Override
    public Optional<CustomerImageFileDto> getCustomerImageFile(String filename) {
        if (filename == null || filename.isBlank()) {
            return Optional.empty();
        }

        String lowerName = filename.toLowerCase();
        String subFolder;
        if (lowerName.startsWith("selfie")) {
            subFolder = "selfie";
        } else if (lowerName.startsWith("ref_doc") || lowerName.contains("doc")) {
            subFolder = "document";
        } else {
            subFolder = "nid";
        }

        Optional<Path> found = storageComponent.findFileByName(subFolder, filename);
        if (found.isEmpty()) {
            found = storageComponent.findFileByName("junior_document", filename);
        }
        if (found.isEmpty()) {
            found = storageComponent.findFileByName("junior/" + subFolder, filename);
        }
        if (found.isEmpty()) {
            found = storageComponent.findFileByName("junior/document", filename);
        }
        if (found.isEmpty()) {
            found = storageComponent.findFileByName("document", filename);
        }
        if (found.isEmpty()) {
            found = storageComponent.findFileByName("junior_nid", filename);
        }
        if (found.isEmpty()) {
            found = storageComponent.findFileByName("junior/nid", filename);
        }
        if (found.isEmpty()) {
            found = storageComponent.findFileByName("nid", filename);
        }

        if (found.isEmpty() && filename.contains(".")) {
            String baseName = filename.substring(0, filename.lastIndexOf('.'));
            found = storageComponent.findFileByName(subFolder, baseName + ".jpg");
            if (found.isEmpty()) {
                found = storageComponent.findFileByName("junior/" + subFolder, baseName + ".jpg");
            }
        }

        if (found.isEmpty()) {
            return Optional.empty();
        }

        try {
            Path filePath = found.get();
            byte[] bytes = Files.readAllBytes(filePath);
            MediaType mediaType = resolveMediaType(filePath);
            return Optional.of(CustomerImageFileDto.builder()
                    .content(bytes)
                    .mediaType(mediaType)
                    .build());
        } catch (IOException e) {
            log.error("Failed to read customer image {}: {}", filename, e.getMessage());
            return Optional.empty();
        }
    }

    private MediaType resolveMediaType(Path filePath) {
        if (filePath != null) {
            String lower = filePath.getFileName().toString().toLowerCase();
            if (lower.endsWith(".pdf")) {
                return MediaType.APPLICATION_PDF;
            } else if (lower.endsWith(".png")) {
                return MediaType.IMAGE_PNG;
            } else if (lower.endsWith(".webp")) {
                return MediaType.parseMediaType("image/webp");
            } else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
                return MediaType.IMAGE_JPEG;
            }
            try {
                String contentType = Files.probeContentType(filePath);
                if (contentType != null) {
                    return org.springframework.http.MediaType.parseMediaType(contentType);
                }
            } catch (Exception ignored) {}
        }
        return org.springframework.http.MediaType.IMAGE_JPEG;
    }
}
