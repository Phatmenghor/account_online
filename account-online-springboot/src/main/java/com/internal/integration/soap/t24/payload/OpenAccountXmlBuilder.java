package com.internal.integration.soap.t24.payload;

import com.internal.config.CpbProperties;
import com.internal.config.DefaultProperties;
import com.internal.feature.open_account.dto.request.CustomerRequest;
import com.internal.integration.soap.t24.util.T24XmlUtils;
import com.internal.shared.constant.AppConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OpenAccountXmlBuilder {

    private final CpbProperties cpbProperties;
    private final DefaultProperties defaultProperties;
    private final T24XmlUtils xmlUtils;

    public String buildCustomerCreationXml(CustomerRequest request) {
        log.info("Building Customer Creation XML for Legal ID: {}", request.getLegalId());

        String username = cpbProperties.getT24().getUsername();
        String password = cpbProperties.getT24().getPassword();

        String branchCode = xmlUtils.formatCompanyCode(request.getBranchCode(), defaultProperties.getBranchCode());
        String maritalStatus = xmlUtils.mapMaritalStatus(request.getMaritalStatus());

        String relationManager = xmlUtils.getOrDefault(request.getRelationManager(), xmlUtils.getOrDefault(request.getReferralId(), ""));
        String loanOfficer = xmlUtils.getOrDefault(request.getLoanOfficer(), "");
        String staff = xmlUtils.getOrDefault(request.getStaff(), "");
        String referralBy = xmlUtils.getOrDefault(request.getReferralBy(), "");

        String legalAddress = xmlUtils.toSwiftSafe(xmlUtils.getOrDefault(request.getLegalAddress(), ""));

        String custProvince = xmlUtils.safe(request.getCustomerCurrentProvince());
        String custDistrict = xmlUtils.safe(request.getCustomerCurrentDistrict());
        String custCommune = xmlUtils.safe(request.getCustomerCurrentCommune());
        String custVillage = xmlUtils.safe(request.getCustomerCurrentVillage());

        String pobProvince = xmlUtils.safe(request.getCustomerPobProvince());
        String pobDistrict = xmlUtils.safe(request.getCustomerPobDistrict());
        String pobCommune = xmlUtils.safe(request.getCustomerPobCommune());
        String pobVillage = xmlUtils.safe(request.getCustomerPobVillage());

        String dateOfBirth = xmlUtils.formatDateForT24(request.getDateOfBirth());
        String legalIssueDate = xmlUtils.formatLegalIssueDateWithDefault(request.getLegalIssueDate());
        String legalExpDate = xmlUtils.formatLegalExpireDateWithDefault(request.getLegalExpireDate());
        String gender = xmlUtils.mapGender(request.getGender());
        String legalDocType = xmlUtils.mapLegalDocType(request.getLegalDocType(), true);

        String title = xmlUtils.getOrDefault(request.getTitle(), xmlUtils.determineTitle(request.getGender()));

        String englishFullName = xmlUtils.safe(request.getFamilyName()) + " " + xmlUtils.safe(request.getGivenName());
        String khmerFullName = xmlUtils.safe(request.getLastNameKh()) + " " + xmlUtils.safe(request.getFirstNameKh());

        String holderName = xmlUtils.getOrDefault(request.getLegalHolderName(), xmlUtils.getOrDefault(englishFullName.trim(), defaultProperties.getLegalHolderName()));

        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<soapenv:Envelope xmlns:soapenv=\"" + AppConstants.SOAP_ENV_NS + "\" "
                + "xmlns:oaow=\"" + AppConstants.OAOW_NS + "\" "
                + "xmlns:cus=\"" + AppConstants.CUSTOMER_NS + "\">"
                + "<soapenv:Header/>"
                + "<soapenv:Body>"
                + "<oaow:OAOCUSTOMERCREATION>"
                + "<WebRequestCommon>"
                + "<company>" + branchCode + "</company>"
                + "<password>" + xmlUtils.xmlEscape(password) + "</password>"
                + "<userName>" + username + "</userName>"
                + "</WebRequestCommon>"
                + "<OfsFunction/>"
                + "<CUSTOMERCPBCREATEOAOType id=\"\">"

                // gSHORTNAME
                + "<cus:gSHORTNAME g=\"1\">"
                + "<cus:ShortName>" + englishFullName + "</cus:ShortName>"
                + "<cus:ShortName>" + khmerFullName + "</cus:ShortName>"
                + "</cus:gSHORTNAME>"

                // gNAME1
                + "<cus:gNAME1 g=\"1\">"
                + "<cus:FullName>" + englishFullName + "</cus:FullName>"
                + "<cus:FullName>" + khmerFullName + "</cus:FullName>"
                + "</cus:gNAME1>"

                // STREET
                + "<cus:gSTREET g=\"1\"><cus:STREET>" + legalAddress + "</cus:STREET></cus:gSTREET>"

                // Organizational fields — Configurable Sector via defaultProperties.getSector()
                + "<cus:Sector>" + defaultProperties.getSector() + "</cus:Sector>"
                + "<cus:CostCenter>" + defaultProperties.getCostCenter() + "</cus:CostCenter>"
                + "<cus:Industry>" + defaultProperties.getIndustry() + "</cus:Industry>"
                + "<cus:Target>" + defaultProperties.getTarget() + "</cus:Target>"
                + "<cus:Nationality>" + defaultProperties.getNationality() + "</cus:Nationality>"
                + "<cus:CustomerStatus>" + defaultProperties.getCustomerStatus() + "</cus:CustomerStatus>"
                + "<cus:Residence>" + defaultProperties.getNationality() + "</cus:Residence>"

                // Legal identification
                + "<cus:gLEGALID g=\"1\"><cus:mLEGALID m=\"1\">"
                + "<cus:LegalId>" + request.getLegalId() + "</cus:LegalId>"
                + "<cus:LegalDocName>" + legalDocType + "</cus:LegalDocName>"
                + "<cus:LegalHolderName>" + holderName + "</cus:LegalHolderName>"
                + "<cus:LegalIssAuth>" + xmlUtils.getOrDefault(request.getLegalIssAuth(), xmlUtils.getOrDefault(request.getGivenName(), "NID")) + "</cus:LegalIssAuth>"
                + "<cus:LegalIssDate>" + legalIssueDate + "</cus:LegalIssDate>"
                + (legalExpDate == null || legalExpDate.isBlank() ? "<cus:LegalExpDate/>" : "<cus:LegalExpDate>" + legalExpDate + "</cus:LegalExpDate>")
                + "</cus:mLEGALID></cus:gLEGALID>"

                // Language
                + "<cus:Language>" + defaultProperties.getLanguage() + "</cus:Language>"

                // Customer rating
                + "<cus:gCUSTOMERRATING g=\"1\"><cus:CustomerRating>" + defaultProperties.getCustomerRating() + "</cus:CustomerRating></cus:gCUSTOMERRATING>"

                // Personal details
                + "<cus:TITLE>" + title + "</cus:TITLE>"
                + "<cus:GIVENNAMES>" + request.getGivenName() + "</cus:GIVENNAMES>"
                + "<cus:FAMILYNAME>" + request.getFamilyName() + "</cus:FAMILYNAME>"
                + "<cus:Gender>" + gender + "</cus:Gender>"
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

                // Current address
                + "<cus:CustProvince>" + custProvince + "</cus:CustProvince>"
                + "<cus:CustDistrict>" + custDistrict + "</cus:CustDistrict>"
                + "<cus:CustCommune>" + custCommune + "</cus:CustCommune>"
                + "<cus:CustVillage>" + custVillage + "</cus:CustVillage>"

                // Ownership and staff
                + "<cus:Ownership>" + defaultProperties.getOwnership() + "</cus:Ownership>"
                + "<cus:RelationManager>" + relationManager + "</cus:RelationManager>"
                + "<cus:LoanOfficer>" + loanOfficer + "</cus:LoanOfficer>"
                + "<cus:Staff>" + staff + "</cus:Staff>"

                // Place of birth address
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
        log.info("Building Account Creation XML for CIF: {} | Currency: {}", cif, currency);

        String username = cpbProperties.getT24().getUsername();
        String password = cpbProperties.getT24().getPassword();
        String branchCode = xmlUtils.formatCompanyCode(request.getBranchCode(), defaultProperties.getBranchCode());

        String englishFullName = xmlUtils.safe(request.getFamilyName()) + " " + xmlUtils.safe(request.getGivenName());
        String khmerFullName = xmlUtils.safe(request.getLastNameKh()) + " " + xmlUtils.safe(request.getFirstNameKh());

        String productCode = (request.getProductAccount() != null && !request.getProductAccount().isBlank())
                ? request.getProductAccount().trim()
                : AppConstants.PRODUCT_CODE;

        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<soapenv:Envelope xmlns:soapenv=\"" + AppConstants.SOAP_ENV_NS + "\" "
                + "xmlns:oaow=\"" + AppConstants.OAOW_NS + "\" "
                + "xmlns:aaar=\"" + AppConstants.ACCOUNT_NS + "\">"

                + "<soapenv:Header/>"
                + "<soapenv:Body>"
                + "<oaow:ACCREATIONOAO>"

                + "<WebRequestCommon>"
                + "<company>" + branchCode + "</company>"
                + "<password>" + xmlUtils.xmlEscape(password) + "</password>"
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

                // PRODUCT + CURRENCY — Category / Product lookup code
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

                // ACCOUNT.TITLE.1:2 — Khmer
                + "<aaar:FieldName s=\"1\">"
                + "<aaar:FieldName>ACCOUNT.TITLE.1:2</aaar:FieldName>"
                + "<aaar:FieldValue>" + khmerFullName + "</aaar:FieldValue>"
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