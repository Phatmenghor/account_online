package com.internal.feature.open_account.dto.response;

import com.internal.enumation.AccountOpeningRequestStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingAccountOpeningRequestHistoryDto {

    private Long id;
    private Long requestId;
    private String legalId;
    private AccountOpeningRequestStatusEnum status;
    private String actionUsername;
    private String remark;
    private String createdAt;

    // === LEGAL / NID INFO ===
    private String legalDocName;
    private String legalHolderName;
    private String legalFirstNameEn;
    private String legalLastNameEn;
    private String legalFirstNameKh;
    private String legalLastNameKh;
    private String legalDateOfBirth;
    private String legalGender;
    private String legalAddress;
    private String legalPlaceOfBirth;
    private String legalMRZ1;
    private String legalMRZ2;
    private String legalMRZ3;

    // === CUSTOMER INFO ===
    private String phoneNumber;
    private String branchCode;
    private String occupation;
    private String companyName;
    private String email;
    private String maritalStatus;
    private String nationality;
    private String amlStatus;

    // === CUSTOMER ADDRESS ===
    private String customerProvince;
    private String customerDistrict;
    private String customerCommune;
    private String customerVillage;

    // === PLACE OF BIRTH ===
    private String customerPobProvince;
    private String customerPobDistrict;
    private String customerPobCommune;
    private String customerPobVillage;

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
