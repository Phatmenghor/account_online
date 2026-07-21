package com.internal.feature.logs_report.dto.response;

import com.internal.feature.auth.dto.response.UserResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountOnlineFinalResponseDto {

    private UUID id;

    // === ACCOUNT INFO ===
    private String cif;
    private String khrAccount;
    private String usdAccount;
    private String mnemonic;

    // === LEGAL / NID INFO ===
    private String legalId;
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
    private String maritalStatus;
    private String nationality;
    private String companyName;
    private String occupation;
    private String averageIncome;
    private String referralId;
    private String releasedBy;

    // === BRANCH INFO ===
    private String branchCode;
    private String branchNameKh;

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

    // === CONTACT INFO ===
    private String phoneNumber;

    // === IMAGES ===
    private String nidImageName;
    private String selfieImageName;

    // === MOBILE BANKING ===
    private String mbActivationCode;
    private String mbAppDownloadLink;

    private String categoryAccount;

    // === SUBMITTED BY ===
    private String submittedBy;
    private UserResponseDto submittedByUser;

    // === TRACE FIELDS ===
    private LocalDateTime createdAt;
}

