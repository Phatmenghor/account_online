package com.internal.feature.junior_account.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Response DTO for customer info looked up by CIF.
 * Maps key fields from the SOAP response XML.
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

    // Address
    private List<String> streets;
    private String province;
    private String district;
    private String commune;
    private String village;

    // Legal ID
    private String legalId;
    private String legalDocName;
    private String legalHolderName;
    private String legalIssAuth;
    private String legalIssDate;

    // Personal
    private String birthDate;
    private String nationality;
    private String residence;
    private String language;
    private String sector;
    private String industry;
    private String accountOfficer;
    private String relManager;
    private String referralBy;

    // Contact
    private List<String> phones;

    // Banking
    private String companyBook;
    private String internetBankingService;
    private String mobileBankingService;

    // Khmer short name
    private String khShortName;
}
