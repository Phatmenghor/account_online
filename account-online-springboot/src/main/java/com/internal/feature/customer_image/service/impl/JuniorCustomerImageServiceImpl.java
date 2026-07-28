package com.internal.feature.customer_image.service.impl;

import com.internal.config.FileProperties;
import com.internal.feature.customer_image.models.JuniorCustomerImage;
import com.internal.feature.customer_image.repository.JuniorCustomerImageRepository;
import com.internal.feature.customer_image.service.JuniorCustomerImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service implementation for saving and querying JuniorCustomerImage database records.
 * Uses FileProperties to store files under /app/customer-image/junior subfolder.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class JuniorCustomerImageServiceImpl implements JuniorCustomerImageService {

    private final JuniorCustomerImageRepository juniorCustomerImageRepository;
    private final FileProperties fileProperties;

    @Override
    @Transactional
    public JuniorCustomerImage saveImage(String type, String imageName, String legalId, String guardianLegalId) {
        if (imageName == null || imageName.isBlank()) {
            return null;
        }

        String juniorPath = fileProperties.getUpload().getJunior().replaceFirst("^/", "");
        String fullRelativePath = juniorPath + "/" + imageName;

        JuniorCustomerImage image = JuniorCustomerImage.builder()
                .type(type)
                .name(imageName)
                .filePath(fullRelativePath)
                .legal_id(legalId)
                .guardianLegalId(guardianLegalId)
                .build();

        JuniorCustomerImage saved = juniorCustomerImageRepository.save(image);
        log.info("Saved JuniorCustomerImage record ID: {} | Type: {} | Name: {} | Path: {}", saved.getId(), type, imageName, fullRelativePath);
        return saved;
    }

    @Override
    public Optional<JuniorCustomerImage> findByName(String name) {
        return juniorCustomerImageRepository.findByName(name);
    }
}
