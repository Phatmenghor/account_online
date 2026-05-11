package com.internal.feature.open_account.dto.response;

import com.internal.enumation.AccountOpeningRequestStatusEnum;
import com.internal.enumation.AmlStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingAccountAdminReviewDto {

    // Request ID & Status
    private Long requestId;
    private String legalId;
    private AccountOpeningRequestStatusEnum status;
    private AmlStatusEnum amlStatus;
    private Long createdAt;

    // Customer Personal Info
    private String title;
    private String givenName;
    private String familyName;
    private String firstNameKh;
    private String lastNameKh;
    private String gender;
    private String dateOfBirth;
    private String nationality;
    private String maritalStatus;
    private String phoneNumber;
    private String email;

    // Customer Address
    private String customerCurrentProvince;
    private String customerCurrentDistrict;
    private String customerCurrentCommune;
    private String customerCurrentVillage;
    private String legalAddress;

    // Place of Birth
    private String customerPobProvince;
    private String customerPobDistrict;
    private String customerPobCommune;
    private String customerPobVillage;
    private String placeOfBirth;

    // Legal Document
    private String legalDocType;
    private String legalHolderName;
    private String legalIssAuth;
    private String legalIssueDate;
    private String legalExpireDate;

    // Business Info
    private String customerType;
    private String companyName;
    private String occupation;
    private String industry;
    private String sector;
    private String averageIncome;

    // Bank Info
    private String branchCode;
    private String productAccount;
    private String categoryAccount;
    private String customerRole;

    // Images
    private String nidImageName;
    private String selfieImageName;

    // AML Result
    private String amlResultData;

    // Admin Review
    private String remark;
    private String approvedBy;
    private String rejectedBy;
    private Long approvedAt;
    private Long rejectedAt;
}
