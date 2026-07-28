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

        String branchCode = xmlUtils.getOrDefault(request.getBranchCode(), defaultProperties.getBranchCode());
        String maritalStatus = xmlUtils.mapMaritalStatus(request.getMaritalStatus());

        boolean isStaffRequest = xmlUtils.isAuthenticated();
        String relationManager = isStaffRequest ? xmlUtils.getOrDefault(request.getRelationManager(), "") : "";
        String loanOfficer = isStaffRequest ? xmlUtils.getOrDefault(request.getLoanOfficer(), "") : "";
        String staff = isStaffRequest ? xmlUtils.getOrDefault(request.getStaff(), "") : "";
        String referralBy = isStaffRequest ? xmlUtils.getOrDefault(request.getReferralBy(), "") : "";

        String legalAddress = xmlUtils.toSwiftSafe(xmlUtils.getOrDefault(request.getLegalAddress(), ""));

        String custProvince = xmlUtils.getOrDefault(request.getCustomerCurrentProvince(), "12");
        String custDistrict = xmlUtils.getOrDefault(request.getCustomerCurrentDistrict(), "1201");
        String custCommune = xmlUtils.getOrDefault(request.getCustomerCurrentCommune(), "120101");
        String custVillage = xmlUtils.getOrDefault(request.getCustomerCurrentVillage(), "12010101");

        String pobProvince = xmlUtils.getOrDefault(request.getCustomerPobProvince(), custProvince);
        String pobDistrict = xmlUtils.getOrDefault(request.getCustomerPobDistrict(), custDistrict);
        String pobCommune = xmlUtils.getOrDefault(request.getCustomerPobCommune(), custCommune);
        String pobVillage = xmlUtils.getOrDefault(request.getCustomerPobVillage(), custVillage);

        String dateOfBirth = xmlUtils.formatDateForT24(request.getDateOfBirth());
        String legalIssueDate = xmlUtils.formatLegalIssueDateWithDefault(request.getLegalIssueDate());

        String title = xmlUtils.getOrDefault(request.getTitle(), xmlUtils.determineTitle(request.getGender()));

        String englishFullName = xmlUtils.safe(request.getFamilyName()) + " " + xmlUtils.safe(request.getGivenName());
        String khmerFullName = xmlUtils.safe(request.getLastNameKh()) + " " + xmlUtils.safe(request.getFirstNameKh());

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
                + "<cus:LegalDocName>" + request.getLegalDocType() + "</cus:LegalDocName>"
                + "<cus:LegalHolderName>" + defaultProperties.getLegalHolderName() + "</cus:LegalHolderName>"
                + "<cus:LegalIssAuth>" + xmlUtils.getOrDefault(request.getLegalIssAuth(), request.getGivenName()) + "</cus:LegalIssAuth>"
                + "<cus:LegalIssDate>" + legalIssueDate + "</cus:LegalIssDate>"
                + "<cus:LegalExpDate>" + request.getLegalExpireDate() + "</cus:LegalExpDate>"
                + "</cus:mLEGALID></cus:gLEGALID>"

                // Language
                + "<cus:Language>" + defaultProperties.getLanguage() + "</cus:Language>"

                // Customer rating
                + "<cus:gCUSTOMERRATING g=\"1\"><cus:CustomerRating>" + defaultProperties.getCustomerRating() + "</cus:CustomerRating></cus:gCUSTOMERRATING>"

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
                + "<cus:ReferralBy>" + referralBy + "</cus:ReferralBy>"

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
        String branchCode = xmlUtils.getOrDefault(request.getBranchCode(), defaultProperties.getBranchCode());

        String englishFullName = xmlUtils.safe(request.getFamilyName()) + " " + xmlUtils.safe(request.getGivenName());
        String khmerFullName = xmlUtils.safe(request.getLastNameKh() + " " + request.getFirstNameKh());

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

                // PRODUCT + CURRENCY — Direct Standard Product (SAVE.ACCT.ONLINE)
                + "<aaar:Product>" + AppConstants.PRODUCT_CODE + "</aaar:Product>"
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