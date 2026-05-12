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
    private String remark;
    private AmlStatusEnum amlStatus;

    // AML RESULT DATA (parsed JSON)
    @JsonRawValue
    private String amlResultData;

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

    // === CURRENT ADDRESS ===
    private String customerProvince;
    private String customerDistrict;
    private String customerCommune;
    private String customerVillage;

    // === PLACE OF BIRTH ===
    private String customerPobProvince;
    private String customerPobDistrict;
    private String customerPobCommune;
    private String customerPobVillage;

    // === BRANCH INFO ===
    private String branchCode;

    // === BANKING INFO ===
    private String productAccount;
    private String categoryAccount;
    private String customerRole;
    private String loanOfficer;
    private String releasedBy;

    // === IMAGES ===
    private String nidImageName;
    private String selfieImageName;
}
