package com.internal.feature.customer_image.repository;

import com.internal.feature.customer_image.models.JuniorCustomerImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JuniorCustomerImageRepository extends JpaRepository<JuniorCustomerImage, UUID> {
    Optional<JuniorCustomerImage> findByTypeAndName(String type, String name);
    Optional<JuniorCustomerImage> findByName(String name);
}
