package com.internal.feature.junior_account.models;

import com.internal.config.entity.BaseNoIdEntity;
import com.internal.enumation.AmlStatusEnum;
import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "junior_open_final")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JuniorAccountFinal extends BaseNoIdEntity {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    // === ACCOUNT INFO ===
    @Column(name = "cif")
    private String cif;

    @Column(name = "khr_account")
    private String khrAccount;

    @Column(name = "usd_account")
    private String usdAccount;

    @Column(name = "mnemonic")
    private String mnemonic;

    // === NID / NO-NID MODE ===
    @Builder.Default
    @Column(name = "has_nid", nullable = false)
    private Boolean hasNid = true;

    // === JUNIOR / CHILD LEGAL INFO ===
    @Column(name = "legal_id", nullable = false)
    private String legalId;

    @Column(name = "legal_doc_name")
    private String legalDocName;

    @Column(name = "legal_first_name_en")
    private String legalFirstNameEn;

    @Column(name = "legal_last_name_en")
    private String legalLastNameEn;

    @Column(name = "legal_first_name_kh")
    private String legalFirstNameKh;

    @Column(name = "legal_last_name_kh")
    private String legalLastNameKh;

    @Column(name = "legal_date_of_birth")
    private LocalDate legalDateOfBirth;

    @Column(name = "legal_gender")
    private String legalGender;

    @Column(name = "legal_address")
    private String legalAddress;

    @Column(name = "legal_place_of_birth")
    private String legalPlaceOfBirth;

    @Column(name = "legal_issued_date")
    private LocalDate legalIssuedDate;

    @Column(name = "legal_expired_date")
    private LocalDate legalExpiredDate;

    // === GUARDIAN INFO ===
    @Column(name = "guardian_legal_id")
    private String guardianLegalId;

    @Column(name = "reference_doc_type")
    private String referenceDocType;

    @Column(name = "reference_doc_name")
    private String referenceDocName;

    @Column(name = "guardian_name")
    private String guardianName;

    @Column(name = "guardian_phone")
    private String guardianPhone;

    @Column(name = "guardian_relationship")
    private String guardianRelationship;

    @Column(name = "guardian_cif")
    private String guardianCif;

    @Column(name = "guardian_doc_type")
    private String guardianDocType;

    @Column(name = "guardian_dob")
    private String guardianDob;

    @Column(name = "guardian_address", columnDefinition = "TEXT")
    private String guardianAddress;

    @Column(name = "guardian_info_json", columnDefinition = "TEXT")
    private String guardianInfoJson;

    // === CUSTOMER INFO ===
    @Column(name = "marital_status")
    private String maritalStatus;

    @Column(name = "nationality")
    private String nationality;

    @Column(name = "occupation")
    private String occupation;

    @Column(name = "branch_code")
    private String branchCode;

    @Column(name = "branch_name_kh")
    private String branchNameKh;

    @Column(name = "submitted_by")
    private String submittedBy;

    @Column(name = "legal_holder_name")
    private String legalHolderName;

    @Column(name = "phone_number")
    private String phoneNumber;

    // === CURRENT ADDRESS CODES & NAMES ===
    @Column(name = "customer_province_code")
    private String customerProvinceCode;

    @Column(name = "customer_province")
    private String customerProvince;

    @Column(name = "customer_district_code")
    private String customerDistrictCode;

    @Column(name = "customer_district")
    private String customerDistrict;

    @Column(name = "customer_commune_code")
    private String customerCommuneCode;

    @Column(name = "customer_commune")
    private String customerCommune;

    @Column(name = "customer_village_code")
    private String customerVillageCode;

    @Column(name = "customer_village")
    private String customerVillage;

    // === PLACE OF BIRTH CODES & NAMES ===
    @Column(name = "customer_pob_province_code")
    private String customerPobProvinceCode;

    @Column(name = "customer_pob_province")
    private String customerPobProvince;

    @Column(name = "customer_pob_district_code")
    private String customerPobDistrictCode;

    @Column(name = "customer_pob_district")
    private String customerPobDistrict;

    @Column(name = "customer_pob_commune_code")
    private String customerPobCommuneCode;

    @Column(name = "customer_pob_commune")
    private String customerPobCommune;

    @Column(name = "customer_pob_village_code")
    private String customerPobVillageCode;

    @Column(name = "customer_pob_village")
    private String customerPobVillage;

    @Column(name = "referral_id")
    private String referralId;

    // === AML & STATUS ===
    @Enumerated(EnumType.STRING)
    @Column(name = "aml_status")
    private AmlStatusEnum amlStatus;

    @Column(name = "status")
    private String status;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "nid_image_name")
    private String nidImageName;

    @Column(name = "selfie_image_name")
    private String selfieImageName;

    @Column(name = "request_payload", columnDefinition = "TEXT")
    private String requestPayload;
}
