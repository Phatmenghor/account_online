package com.internal.feature.customer_image.service;

import com.internal.feature.customer_image.models.JuniorCustomerImage;

import java.util.Optional;

public interface JuniorCustomerImageService {
    JuniorCustomerImage saveImage(String type, String imageName, String legalId, String guardianLegalId);
    Optional<JuniorCustomerImage> findByName(String name);
}
