package com.internal.feature.junior_account.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Response DTO for customer info looked up by CIF.
 * Maps ALL fields returned by T24 CustomerCreationSee SOAP XML response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CustomerInfoResponse {

    private String cif;
    private String mnemonic;
    private String customerType;
    private String customerStatus;

    // Names
    private List<String> shortNames;
    private List<String> names;
    private String khShortName;

    // Address (Current)
    private List<String> streets;
    private String province;
    private String district;
    private String commune;
    private String village;

    // Address (Place of Birth)
    private String pobProvince;
    private String pobDistrict;
    private String pobCommune;
    private String pobVillage;

    // Legal ID
    private String legalId;
    private String legalDocName;
    private String legalHolderName;
    private String legalIssAuth;
    private String legalIssDate;
    private String legalIdDocName;

    // Personal & Organizational
    private String birthDate;
    private String nationality;
    private String residence;
    private String language;
    private String sector;
    private String industry;
    private String target;
    private String customerRating;
    private String custOwnership;

    // Staff & Referral
    private String accountOfficer;
    private String relManager;
    private String referralBy;

    // Contact
    private List<String> phones;

    // Banking & Compliance
    private String companyBook;
    private String coCode;
    private String deptCode;
    private String internetBankingService;
    private String mobileBankingService;
    private String amlCheck;
    private String amlResult;
    private String lcpbCusAsset;

    // Audit Info
    private String currNo;
    private String inputter;
    private String dateTime;
    private String authoriser;
}
