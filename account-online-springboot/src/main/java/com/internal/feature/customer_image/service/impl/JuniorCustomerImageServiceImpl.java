package com.internal.feature.customer_image.service.impl;

import com.internal.feature.customer_image.models.JuniorCustomerImage;
import com.internal.feature.customer_image.repository.JuniorCustomerImageRepository;
import com.internal.feature.customer_image.service.JuniorCustomerImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class JuniorCustomerImageServiceImpl implements JuniorCustomerImageService {

    private final JuniorCustomerImageRepository juniorCustomerImageRepository;

    @Override
    @Transactional
    public JuniorCustomerImage saveImage(String type, String imageName, String legalId, String guardianLegalId) {
        if (imageName == null || imageName.isBlank()) {
            return null;
        }

        JuniorCustomerImage image = JuniorCustomerImage.builder()
                .type(type)
                .name(imageName)
                .filePath("customer-images/" + imageName)
                .legal_id(legalId)
                .guardianLegalId(guardianLegalId)
                .build();

        JuniorCustomerImage saved = juniorCustomerImageRepository.save(image);
        log.info("Saved JuniorCustomerImage record ID: {} | Type: {} | Name: {}", saved.getId(), type, imageName);
        return saved;
    }

    @Override
    public Optional<JuniorCustomerImage> findByName(String name) {
        return juniorCustomerImageRepository.findByName(name);
    }
}
