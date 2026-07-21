package com.internal.feature.customer_image.repository;

import com.internal.feature.customer_image.models.CustomerImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CustomerImageRepository extends JpaRepository<CustomerImage, UUID> {
    Optional<CustomerImage> findByTypeAndId(String type, UUID id);
}






