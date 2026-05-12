package com.internal.feature.open_account.models;

import com.internal.config.entity.BaseEntity;
import com.internal.enumation.AccountOpeningRequestStatusEnum;
import com.internal.enumation.AmlStatusEnum;
import com.internal.feature.open_account.dto.request.CustomerRequest;
import lombok.*;

import javax.persistence.*;
import java.time.LocalDate;
import java.util.Map;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "acc_online_pending_account_opening")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingAccountOpeningRequest extends BaseEntity {

    // === REQUEST METADATA ===
    @Column(nullable = false, length = 50)
    private String legalId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountOpeningRequestStatusEnum status;

    @Enumerated(EnumType.STRING)
    private AmlStatusEnum amlStatus;

    @Column(name = "remark", columnDefinition = "TEXT")
    private String remark;

    // === RAW JSON DATA (BACKUP) ===
    @Lob
    @Column(columnDefinition = "TEXT")
    private String requestData;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String customerInfo;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String amlResultData;

    // === LEGAL / NID INFO ===
    @Column(name = "legal_doc_name")
    private String legalDocName;

    @Column(name = "legal_holder_name")
    private String legalHolderName;

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

    @Column(name = "legal_mrz1")
    private String legalMRZ1;

    @Column(name = "legal_mrz2")
    private String legalMRZ2;

    @Column(name = "legal_mrz3")
    private String legalMRZ3;

    // === CUSTOMER INFO ===
    @Column(name = "title")
    private String title;

    @Column(name = "marital_status")
    private String maritalStatus;

    @Column(name = "nationality")
    private String nationality;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "occupation")
    private String occupation;

    @Column(name = "industry")
    private String industry;

    @Column(name = "sector")
    private String sector;

    @Column(name = "average_income")
    private String averageIncome;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "email")
    private String email;

    // === CURRENT ADDRESS ===
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

    // === PLACE OF BIRTH ===
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

    // === BRANCH INFO ===
    @Column(name = "branch_code")
    private String branchCode;

    @Column(name = "branch_name_kh")
    private String branchNameKh;

    // === BANKING INFO ===
    @Column(name = "product_account")
    private String productAccount;

    @Column(name = "category_account")
    private String categoryAccount;

    @Column(name = "customer_role")
    private String customerRole;

    @Column(name = "loan_officer")
    private String loanOfficer;

    @Column(name = "released_by")
    private String releasedBy;

    @Column(name = "customer_type")
    private String customerType;

    // === IMAGES ===
    @Column(name = "nid_image_name")
    private String nidImageName;

    @Column(name = "selfie_image_name")
    private String selfieImageName;

    // === AML DETAILS ===
    @Column(name = "aml_risk_level")
    private String amlRiskLevel;

    @Column(name = "aml_action_taken")
    private String amlActionTaken;

    @Column(name = "aml_total_rules_score")
    private Integer amlTotalRulesScore;

    @Column(name = "aml_trxn_id")
    private String amlTrxnId;

    @Column(name = "service_name")
    private String serviceName;

    @Column(name = "aml_rules_triggered", columnDefinition = "TEXT")
    private String amlRulesTriggered;

    // === ACCOUNT DETAILS (populated after approval) ===
    @Column(name = "cif", length = 50)
    private String cif;

    @Column(name = "mnemonic", length = 50)
    private String mnemonic;

    @Column(name = "khr_account", length = 50)
    private String khrAccount;

    @Column(name = "usd_account", length = 50)
    private String usdAccount;
}
