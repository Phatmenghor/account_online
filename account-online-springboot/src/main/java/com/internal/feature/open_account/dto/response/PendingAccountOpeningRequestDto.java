package com.internal.feature.open_account.dto.response;

import com.internal.enumation.AccountOpeningRequestStatusEnum;
import com.internal.enumation.AmlStatusEnum;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PendingAccountOpeningRequestDto {

    private Long id;
    private String legalId;
    private AccountOpeningRequestStatusEnum status;
    private AmlStatusEnum amlStatus;
    private String remark;
    private Long createdAt;
    private String message;

    // Customer personal details
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

    // Current address
    private String customerCurrentProvince;
    private String customerCurrentDistrict;
    private String customerCurrentCommune;
    private String customerCurrentVillage;

    // Legal information
    private String legalAddress;
    private String legalDocType;
    private String legalHolderName;
    private String legalIssAuth;
    private String legalIssueDate;
    private String legalExpireDate;

    // Place of birth
    private String customerPobProvince;
    private String customerPobDistrict;
    private String customerPobCommune;
    private String customerPobVillage;
    private String placeOfBirth;

    // Employment and business
    private String customerType;
    private String companyName;
    private String occupation;
    private String industry;
    private String sector;
    private String averageIncome;

    // Bank and account details
    private String branchCode;
    private String productAccount;
    private String categoryAccount;
    private String customerRole;

    // Document images
    private String nidImageName;
    private String selfieImageName;

    // AML and compliance
    private String amlResultData;
}
