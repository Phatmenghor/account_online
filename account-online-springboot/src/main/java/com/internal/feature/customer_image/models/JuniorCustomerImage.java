package com.internal.feature.customer_image.models;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "junior_customer_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JuniorCustomerImage {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "type")
    private String type; // NID / SELFIE / GUARDIAN_NID

    private String name;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "legal_id")
    private String legal_id;

    @Column(name = "guardian_legal_id")
    private String guardianLegalId;

    @Column(name = "created_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Phnom_Penh")
    private ZonedDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = ZonedDateTime.now(ZoneId.of("Asia/Phnom_Penh"));
    }
}
