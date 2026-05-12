package com.internal.feature.open_account.dto.response;

import com.internal.enumation.AccountOpeningRequestStatusEnum;
import com.internal.enumation.AmlStatusEnum;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonRawValue;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PendingAccountOpeningRequestDto {

    // REQUEST METADATA
    private Long id;
    private String legalId;
    private AccountOpeningRequestStatusEnum status;
    private String createdAt;
    private String message;
    private String remark;
    private AmlStatusEnum amlStatus;

    // RAW JSON DATA (BACKUP)
    @JsonRawValue
    private String amlResultData;
    private Object requestData;
    private Object customerInfo;

    // === LEGAL / NID INFO ===
    private String legalDocName;
    private String legalHolderName;
    private String legalFirstNameEn;
    private String legalLastNameEn;
    private String legalFirstNameKh;
    private String legalLastNameKh;
    private LocalDate legalDateOfBirth;
    private String legalGender;
    private String legalAddress;
    private String legalPlaceOfBirth;
    private LocalDate legalIssuedDate;
    private LocalDate legalExpiredDate;
    private String legalMRZ1;
    private String legalMRZ2;
    private String legalMRZ3;

    // === CUSTOMER INFO ===
    private String title;
    private String maritalStatus;
    private String nationality;
    private String companyName;
    private String occupation;
    private String industry;
    private String sector;
    private String averageIncome;
    private String phoneNumber;
    private String email;
    private String customerType;

    // === CURRENT ADDRESS ===
    private String customerProvinceCode;
    private String customerProvince;
    private String customerDistrictCode;
    private String customerDistrict;
    private String customerCommuneCode;
    private String customerCommune;
    private String customerVillageCode;
    private String customerVillage;

    // === PLACE OF BIRTH ===
    private String customerPobProvinceCode;
    private String customerPobProvince;
    private String customerPobDistrictCode;
    private String customerPobDistrict;
    private String customerPobCommuneCode;
    private String customerPobCommune;
    private String customerPobVillageCode;
    private String customerPobVillage;

    // === BRANCH INFO ===
    private String branchCode;
    private String branchNameKh;

    // === BANKING INFO ===
    private String productAccount;
    private String categoryAccount;
    private String customerRole;
    private String loanOfficer;
    private String releasedBy;

    // === IMAGES ===
    private String nidImageName;
    private String selfieImageName;

    // === AML DETAILS ===
    private String amlRiskLevel;
    private String amlActionTaken;
    private Integer amlTotalRulesScore;
    private String amlTrxnId;
    private String serviceName;
    private String amlRulesTriggered;
}
