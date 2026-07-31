package com.internal.feature.aml.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.internal.config.entity.BaseEntity;
import com.internal.feature.auth.models.UserEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import jakarta.persistence.*;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "junior_aml_history")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class JuniorAmlHistory extends BaseEntity {


    @Column(name = "status", length = 30, nullable = false)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private UserEntity approvedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rejected_by")
    private UserEntity rejectedBy;

    // ============================================
    // CUSTOMER IDENTIFICATION
    // ============================================
    @Column(name = "legal_id", length = 50, nullable = false)
    private String legalId;

    // ============================================
    // CUSTOMER NAME (ENGLISH)
    // ============================================
    @Column(name = "family_name", length = 100)
    private String familyName;

    @Column(name = "given_name", length = 100)
    private String givenName;

    // ============================================
    // CUSTOMER NAME (KHMER)
    // ============================================
    @Column(name = "last_name_kh", length = 100)
    private String lastNameKh;

    @Column(name = "first_name_kh", length = 100)
    private String firstNameKh;

    // ============================================
    // PERSONAL INFORMATION
    // ============================================
    @Column(name = "date_of_birth", length = 20)
    private String dateOfBirth;

    @Column(name = "gender", length = 10)
    private String gender;

    @Column(name = "nationality", length = 50)
    private String nationality;

    @Column(name = "phone_number", length = 30)
    private String phoneNumber;

    @Column(name = "branch", length = 100)
    private String branch;

    @Column(name = "marital_status", length = 50)
    private String maritalStatus;

    @Column(name = "has_nid")
    private Boolean hasNid;

    // ============================================
    // DOCUMENT INFORMATION
    // ============================================
    @Column(name = "issued_date", length = 30)
    private String issuedDate;

    @Column(name = "expired_date", length = 30)
    private String expiredDate;

    // ============================================
    // OCCUPATION
    // ============================================
    @Column(name = "occupation_code", length = 50)
    private String occupationCode;

    // ============================================
    // GUARDIAN INFORMATION
    // ============================================
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

    // ============================================
    // ADDRESS
    // ============================================
    @Column(name = "legal_address", columnDefinition = "TEXT")
    private String legalAddress;

    @Column(name = "place_of_birth")
    private String placeOfBirth;

    // ============================================
    // CURRENT ADDRESS (resolved EN+KH name & code)
    // ============================================
    @Column(name = "current_address_code")
    private String currentAddressCode;

    @Column(name = "current_address_name", columnDefinition = "TEXT")
    private String currentAddressName;

    // ============================================
    // PLACE OF BIRTH (resolved EN+KH name & code)
    // ============================================
    @Column(name = "place_of_birth_code")
    private String placeOfBirthCode;

    @Column(name = "place_of_birth_name", columnDefinition = "TEXT")
    private String placeOfBirthName;

    // ============================================
    // OCCUPATION STATUS
    // ============================================
    @Column(name = "occupation_status")
    private String occupationStatus;

    // ============================================
    // AML SCREENING INFORMATION
    // ============================================
    @Column(name = "aml_ext_risk_level")
    private String amlExternalRiskLevel;

    @Column(name = "aml_ext_action_taken")
    private String amlExternalActionTaken;

    @Column(name = "aml_ext_rules_triggered", columnDefinition = "TEXT")
    private String amlExternalRulesTriggered;

    @Column(name = "aml_ext_service_name")
    private String amlExternalServiceName;

    @Column(name = "aml_ext_total_rules_score")
    private Integer amlExternalTotalRulesScore;

    @Column(name = "aml_ext_trxn_id")
    private String amlExternalTrxnID;

    // ============================================
    // SUBMITTED BY
    // ============================================
    @Column(name = "submitted_by", length = 100)
    private String submittedBy;

    // ============================================
    // DOCUMENT REFERENCE
    // ============================================
    @Column(name = "reference_doc_type", length = 50)
    private String referenceDocType;

    @Column(name = "reference_doc_name", length = 100)
    private String referenceDocName;

    // ============================================
    // IMAGE FILENAMES
    // ============================================
    @Column(name = "nid_image_name", length = 255)
    private String nidImageName;

    @Column(name = "selfie_image_name", length = 255)
    private String selfieImageName;

    // ============================================
    // ADMIN REMARKS & PAYLOAD
    // ============================================
    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "request_payload", columnDefinition = "TEXT")
    private String requestPayload;

}

