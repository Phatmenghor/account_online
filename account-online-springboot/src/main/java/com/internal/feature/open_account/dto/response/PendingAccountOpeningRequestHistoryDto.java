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

    // === CUSTOMER INFO ===
    private String phoneNumber;
    private String branchCode;
    private String occupation;
    private String companyName;
    private String email;
    private String maritalStatus;
    private String nationality;
    private String amlStatus;

    // === IMAGES ===
    private String nidImageName;
    private String selfieImageName;
}
