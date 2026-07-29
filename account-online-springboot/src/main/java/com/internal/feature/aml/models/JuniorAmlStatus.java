package com.internal.feature.aml.models;

import com.internal.config.entity.BaseEntity;
import lombok.*;

import jakarta.persistence.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "junior_aml_status")
public class JuniorAmlStatus extends BaseEntity {

    @Column(name = "legal_id", length = 50)
    private String legalId;

    @Column(name = "family_name", length = 100)
    private String familyName;

    @Column(name = "given_name", length = 100)
    private String givenName;

    @Column(name = "first_name_kh", length = 100)
    private String firstNameKh;

    @Column(name = "last_name_kh", length = 100)
    private String lastNameKh;

    @Column(name = "date_of_birth", length = 20)
    private String dateOfBirth;

    @Column(name = "gender", length = 10)
    private String gender;

    @Column(name = "phone_number", length = 30)
    private String phoneNumber;

    @Column(name = "branch", length = 100)
    private String branch;

    @Column(name = "marital_status", length = 50)
    private String maritalStatus;

    @Column(name = "issued_date", length = 30)
    private String issuedDate;

    @Column(name = "expired_date", length = 30)
    private String expiredDate;

    @Column(name = "occupation_code", length = 50)
    private String occupationCode;

    @Column(name = "nid_image_name", length = 255)
    private String nidImageName;

    @Column(name = "selfie_image_name", length = 255)
    private String selfieImageName;

    @Column(name = "status", length = 30)
    private String status;

    @Column(name = "guardian_legal_id", length = 50)
    private String guardianLegalId;

    @Column(name = "guardian_name", length = 100)
    private String guardianName;

    @Column(name = "guardian_phone", length = 30)
    private String guardianPhone;

    @Column(name = "guardian_relationship", length = 50)
    private String guardianRelationship;

    @Column(name = "guardian_cif", length = 50)
    private String guardianCif;

    @Column(name = "guardian_address", columnDefinition = "TEXT")
    private String guardianAddress;

    @Column(name = "legal_address", columnDefinition = "TEXT")
    private String legalAddress;

    @Column(name = "place_of_birth")
    private String placeOfBirth;

    @Column(name = "reference_doc_type", length = 50)
    private String referenceDocType;

    @Column(name = "reference_doc_name", length = 100)
    private String referenceDocName;

    @Column(name = "nationality", length = 50)
    private String nationality;

    @Column(name = "has_nid")
    private Boolean hasNid;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private com.internal.feature.auth.models.UserEntity approvedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rejected_by")
    private com.internal.feature.auth.models.UserEntity rejectedBy;

    @Column(name = "customer_info_json", columnDefinition = "TEXT")
    private String customerInfoJson;

    @Column(name = "request_payload", columnDefinition = "TEXT")
    private String requestPayload;
}
