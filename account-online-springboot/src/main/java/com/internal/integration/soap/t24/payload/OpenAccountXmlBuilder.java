package com.internal.integration.soap.t24.payload;

import com.internal.config.CpbProperties;
import com.internal.config.DefaultProperties;
import com.internal.feature.open_account.dto.request.CustomerRequest;
import com.internal.shared.constant.DefaultConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import static com.internal.integration.soap.t24.util.T24XmlUtils.*;

/**
 * Dedicated XML builder for Regular Account Opening T24 SOAP requests.
 * Uses Regular Account defaults (Sector: 6011, Product: SAVE.ACCT.ONLINE).
 * Shared helpers (toSwiftSafe, xmlEscape, date formatting) delegated to T24XmlUtils.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OpenAccountXmlBuilder {

    private final CpbProperties cpbProperties;
    private final DefaultProperties defaultProperties;

    public String buildCustomerCreationXml(CustomerRequest request) {
        log.info("Building customer creation XML for Legal ID: {}", request.getLegalId());

        String username = cpbProperties.getT24().getUsername();
        String password = cpbProperties.getT24().getPassword();

        String branchCode = getOrDefault(request.getBranchCode(), defaultProperties.getBranchCode());
        String maritalStatus = mapMaritalStatus(request.getMaritalStatus());

        boolean isStaffRequest = isAuthenticated();
        String relationManager = isStaffRequest ? getOrDefault(request.getRelationManager(), "") : "";

        String legalAddress = toSwiftSafe(getOrDefault(request.getLegalAddress(), ""));

        String custProvince = getOrDefault(request.getCustomerCurrentProvince(), "");
        String custDistrict = getOrDefault(request.getCustomerCurrentDistrict(), "");
        String custCommune = getOrDefault(request.getCustomerCurrentCommune(), "");
        String custVillage = getOrDefault(request.getCustomerCurrentVillage(), "");

        String pobProvince = getOrDefault(request.getCustomerPobProvince(), "");
        String pobDistrict = getOrDefault(request.getCustomerPobDistrict(), "");
        String pobCommune = getOrDefault(request.getCustomerPobCommune(), "");
        String pobVillage = getOrDefault(request.getCustomerPobVillage(), "");

        String dateOfBirth = formatDateForT24(request.getDateOfBirth());
        String legalIssueDate = formatLegalIssueDateWithDefault(request.getLegalIssueDate());
        String legalExpDate = formatDateForT24NoFutureCheck(request.getLegalExpireDate());
        log.info("T24 date fields | DOB={} | IssDate={} (raw='{}') | ExpDate={}", dateOfBirth, legalIssueDate, request.getLegalIssueDate(), legalExpDate);

        String title = getOrDefault(request.getTitle(), determineTitle(request.getGender()));
        String sectorCode = getOrDefault(request.getSector(), defaultProperties.getSector());

        String englishFullName = safe(request.getFamilyName()) + " " + safe(request.getGivenName());
        String khmerFullName = safe(request.getLastNameKh()) + " " + safe(request.getFirstNameKh());

        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<soapenv:Envelope xmlns:soapenv=\"" + DefaultConstants.SOAP_ENV_NS + "\" "
                + "xmlns:oaow=\"" + DefaultConstants.OAOW_NS + "\" "
                + "xmlns:cus=\"" + DefaultConstants.CUSTOMER_NS + "\">"
                + "<soapenv:Header/>"
                + "<soapenv:Body>"
                + "<oaow:OAOCUSTOMERCREATION>"
                + "<WebRequestCommon>"
                + "<company>" + branchCode + "</company>"
                + "<password>" + xmlEscape(password) + "</password>"
                + "<userName>" + username + "</userName>"
                + "</WebRequestCommon>"
                + "<OfsFunction/>"
                + "<CUSTOMERCPBCREATEOAOType id=\"\">"

                // gSHORTNAME — two entries: English + Khmer
                + "<cus:gSHORTNAME g=\"1\">"
                + "<cus:ShortName>" + englishFullName + "</cus:ShortName>"
                + "<cus:ShortName>" + khmerFullName + "</cus:ShortName>"
                + "</cus:gSHORTNAME>"

                // gNAME1 — two entries: English + Khmer
                + "<cus:gNAME1 g=\"1\">"
                + "<cus:FullName>" + englishFullName + "</cus:FullName>"
                + "<cus:FullName>" + khmerFullName + "</cus:FullName>"
                + "</cus:gNAME1>"

                // STREET — sanitized to SWIFT-safe characters
                + "<cus:gSTREET g=\"1\"><cus:STREET>" + legalAddress + "</cus:STREET></cus:gSTREET>"

                // Organizational fields — Sector 6011
                + "<cus:Sector>" + sectorCode + "</cus:Sector>"
                + "<cus:CostCenter>" + defaultProperties.getCostCenter() + "</cus:CostCenter>"
                + "<cus:Industry>" + defaultProperties.getIndustry() + "</cus:Industry>"
                + "<cus:Target>" + defaultProperties.getTarget() + "</cus:Target>"
                + "<cus:Nationality>" + defaultProperties.getNationality() + "</cus:Nationality>"
                + "<cus:CustomerStatus>" + defaultProperties.getCustomerStatus() + "</cus:CustomerStatus>"
                + "<cus:Residence>" + defaultProperties.getNationality() + "</cus:Residence>"

                // Legal identification
                + "<cus:gLEGALID g=\"1\"><cus:mLEGALID m=\"1\">"
                + "<cus:LegalId>" + request.getLegalId() + "</cus:LegalId>"
                + "<cus:LegalDocName>" + request.getLegalDocType() + "</cus:LegalDocName>"
                + "<cus:LegalHolderName>" + defaultProperties.getLegalHolderName() + "</cus:LegalHolderName>"
                + "<cus:LegalIssAuth>" + getOrDefault(request.getLegalIssAuth(), request.getGivenName())
                + "</cus:LegalIssAuth>"
                + "<cus:LegalIssDate>" + legalIssueDate + "</cus:LegalIssDate>"
                + "<cus:LegalExpDate>" + request.getLegalExpireDate() + "</cus:LegalExpDate>"
                + "</cus:mLEGALID></cus:gLEGALID>"

                // Language
                + "<cus:Language>" + defaultProperties.getLanguage() + "</cus:Language>"

                // Customer rating
                + "<cus:gCUSTOMERRATING g=\"1\"><cus:CustomerRating>" + defaultProperties.getCustomerRating()
                + "</cus:CustomerRating></cus:gCUSTOMERRATING>"

                // Personal details
                + "<cus:TITLE>" + title + "</cus:TITLE>"
                + "<cus:GIVENNAMES>" + request.getGivenName() + "</cus:GIVENNAMES>"
                + "<cus:FAMILYNAME>" + request.getFamilyName() + "</cus:FAMILYNAME>"
                + "<cus:Gender>" + request.getGender() + "</cus:Gender>"
                + "<cus:DateofBirth>" + dateOfBirth + "</cus:DateofBirth>"
                + "<cus:MaritalStatus>" + maritalStatus + "</cus:MaritalStatus>"

                // Phone details
                + "<cus:gPHONE1 g=\"1\"><cus:mPHONE1 m=\"1\">"
                + "<cus:PHONE1>" + request.getPhoneNumber() + "</cus:PHONE1>"
                + "<cus:SMS1>" + request.getPhoneNumber() + "</cus:SMS1>"
                + "<cus:EMAIL1/>"
                + "</cus:mPHONE1></cus:gPHONE1>"

                // Customer type
                + "<cus:CustomerType>" + defaultProperties.getCustomerType() + "</cus:CustomerType>"

                // Current address (administrative codes)
                + "<cus:CustProvince>" + custProvince + "</cus:CustProvince>"
                + "<cus:CustDistrict>" + custDistrict + "</cus:CustDistrict>"
                + "<cus:CustCommune>" + custCommune + "</cus:CustCommune>"
                + "<cus:CustVillage>" + custVillage + "</cus:CustVillage>"

                // Ownership and staff
                + "<cus:Ownership>" + defaultProperties.getOwnership() + "</cus:Ownership>"
                + "<cus:RelationManager>" + relationManager + "</cus:RelationManager>"
                + "<cus:LoanOfficer></cus:LoanOfficer>"
                + "<cus:Staff></cus:Staff>"
                + "<cus:ReferralBy></cus:ReferralBy>"

                // Place of birth address (Primary P fields)
                + "<cus:CUSTPROVINCEP>" + pobProvince + "</cus:CUSTPROVINCEP>"
                + "<cus:CUSTDISTRICTP>" + pobDistrict + "</cus:CUSTDISTRICTP>"
                + "<cus:CUSTCOMMUNEP>" + pobCommune + "</cus:CUSTCOMMUNEP>"
                + "<cus:CUSTVILLAGEP>" + pobVillage + "</cus:CUSTVILLAGEP>"

                + "</CUSTOMERCPBCREATEOAOType>"
                + "</oaow:OAOCUSTOMERCREATION>"
                + "</soapenv:Body>"
                + "</soapenv:Envelope>";
    }

    public String buildAccountCreationXml(CustomerRequest request, String cif, String currency) {

        String username = cpbProperties.getT24().getUsername();
        String password = cpbProperties.getT24().getPassword();
        String branchCode = getOrDefault(request.getBranchCode(), defaultProperties.getBranchCode());
        String productCode = getOrDefault(request.getProductAccount(), defaultProperties.getProductCode());

        String englishFullName = safe(request.getFamilyName()) + " " + safe(request.getGivenName());
        String khmerFullName = safe(request.getLastNameKh() + " " + request.getFirstNameKh());

        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<soapenv:Envelope xmlns:soapenv=\"" + DefaultConstants.SOAP_ENV_NS + "\" "
                + "xmlns:oaow=\"" + DefaultConstants.OAOW_NS + "\" "
                + "xmlns:aaar=\"" + DefaultConstants.ACCOUNT_NS + "\">"

                + "<soapenv:Header/>"
                + "<soapenv:Body>"
                + "<oaow:ACCREATIONOAO>"

                + "<WebRequestCommon>"
                + "<company>" + branchCode + "</company>"
                + "<password>" + xmlEscape(password) + "</password>"
                + "<userName>" + username + "</userName>"
                + "</WebRequestCommon>"

                + "<OfsFunction/>"

                + "<AAARRANGEMENTACTIVITYAANEWOAOType id=\"\">"
                + "<aaar:Arrangement>" + defaultProperties.getNewArrangement() + "</aaar:Arrangement>"
                + "<aaar:Activity>" + defaultProperties.getAccountActivity() + "</aaar:Activity>"

                // CUSTOMER
                + "<aaar:gCUSTOMER g=\"1\">"
                + "<aaar:mCUSTOMER m=\"1\">"
                + "<aaar:Customer>" + cif + "</aaar:Customer>"
                + "<aaar:CustomerRole>OWNER</aaar:CustomerRole>"
                + "</aaar:mCUSTOMER>"
                + "</aaar:gCUSTOMER>"

                // PRODUCT + CURRENCY
                + "<aaar:Product>" + productCode + "</aaar:Product>"
                + "<aaar:Currency>" + currency + "</aaar:Currency>"

                // PROPERTY BLOCK
                + "<aaar:gPROPERTY g=\"1\">"
                + "<aaar:mPROPERTY m=\"1\">"
                + "<aaar:Property>BALANCE</aaar:Property>"

                + "<aaar:sgFIELDNAME sg=\"1\">"

                // SHORT.TITLE:1 — English
                + "<aaar:FieldName s=\"1\">"
                + "<aaar:FieldName>SHORT.TITLE:1</aaar:FieldName>"
                + "<aaar:FieldValue>" + englishFullName + "</aaar:FieldValue>"
                + "</aaar:FieldName>"

                // SHORT.TITLE:2 — Khmer
                + "<aaar:FieldName s=\"1\">"
                + "<aaar:FieldName>SHORT.TITLE:2</aaar:FieldName>"
                + "<aaar:FieldValue>" + khmerFullName + "</aaar:FieldValue>"
                + "</aaar:FieldName>"

                // ACCOUNT.TITLE.1:1 — English
                + "<aaar:FieldName s=\"1\">"
                + "<aaar:FieldName>ACCOUNT.TITLE.1:1</aaar:FieldName>"
                + "<aaar:FieldValue>" + englishFullName + "</aaar:FieldValue>"
                + "</aaar:FieldName>"

                + "</aaar:sgFIELDNAME>"

                + "</aaar:mPROPERTY>"
                + "</aaar:gPROPERTY>"

                + "</AAARRANGEMENTACTIVITYAANEWOAOType>"
                + "</oaow:ACCREATIONOAO>"
                + "</soapenv:Body>"
                + "</soapenv:Envelope>";
    }
}