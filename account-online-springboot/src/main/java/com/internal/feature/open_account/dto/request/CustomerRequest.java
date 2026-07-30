package com.internal.feature.open_account.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.experimental.SuperBuilder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;

import com.fasterxml.jackson.annotation.JsonAlias;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequest {

    @JsonProperty("rec_id")
    private String recId;

    @JsonProperty("branch_code")
    @JsonAlias({"branchCode", "branch_code"})
    private String branchCode;

    @JsonProperty("short_name")
    private String shortName;

    @JsonProperty("fullname1")
    private String fullName1;

    @JsonProperty("fullname2")
    private String fullName2;

    @JsonProperty("sector")
    private String sector;

    @JsonProperty("cost_center")
    private String costCenter;

    @JsonProperty("industry")
    private String industry;

    @JsonProperty("nationality")
    private String nationality;

    @JsonProperty("customer_status")
    private String customerStatus;

    @JsonProperty("residence")
    private String residence;

    @JsonProperty("email")
    private String email;

    @JsonProperty("legal_id")
    @JsonAlias({"legalId", "idNumber", "legal_id"})
    private String legalId;

    @JsonProperty("legal_doc_name")
    @JsonAlias({"legalDocType", "legalDocName", "legal_doc_name"})
    private String legalDocType;

    @JsonProperty("legal_holder_name")
    private String legalHolderName;

    @JsonProperty("legal_iss_auth")
    private String legalIssAuth;

    @JsonProperty("legal_iss_date")
    @JsonAlias({"legalIssueDate", "issuedDate", "legal_iss_date"})
    private String legalIssueDate;

    @JsonProperty("legal_exp_date")
    @JsonAlias({"legalExpireDate", "expiredDate", "legal_exp_date"})
    private String legalExpireDate;

    @JsonProperty("address")
    @JsonAlias({"legalAddress", "address"})
    private String legalAddress;

    @JsonProperty("language")
    private String language;

    @JsonProperty("customer_rate")
    private String customerRate;

    @JsonProperty("title")
    private String title;

    @NotBlank(message = "Given name is required")
    @JsonProperty("given_name")
    @JsonAlias({"givenName", "firstNameEn", "given_name"})
    private String givenName;

    @NotBlank(message = "Family name is required")
    @JsonProperty("family_name")
    @JsonAlias({"familyName", "lastNameEn", "family_name"})
    private String familyName;

    @NotBlank(message = "Gender is required")
    @JsonProperty("gender")
    @JsonAlias({"gender"})
    private String gender;

    @NotBlank(message = "Date of birth is required")
    @JsonProperty("date_of_birth")
    @JsonAlias({"dateOfBirth", "dob", "date_of_birth"})
    private String dateOfBirth;

    @JsonProperty("marital_status")
    @JsonAlias({"maritalStatus", "marital_status"})
    private String maritalStatus;

    @NotBlank(message = "Phone number is required")
    @JsonProperty("sms")
    @JsonAlias({"phoneNumber", "phone_number", "sms"})
    private String phoneNumber;

    @JsonProperty("customer_type")
    private String customerType;

    @JsonProperty("cust_province")
    @JsonAlias({"customerCurrentProvince", "cust_province", "customerProvinceCode", "customer_province_code"})
    private String customerCurrentProvince;

    @JsonProperty("cust_district")
    @JsonAlias({"customerCurrentDistrict", "cust_district", "customerDistrictCode", "customer_district_code"})
    private String customerCurrentDistrict;

    @JsonProperty("cust_commune")
    @JsonAlias({"customerCurrentCommune", "cust_commune", "customerCommuneCode", "customer_commune_code"})
    private String customerCurrentCommune;

    @JsonProperty("cust_village")
    @JsonAlias({"customerCurrentVillage", "cust_village", "customerVillageCode", "customer_village_code"})
    private String customerCurrentVillage;

    @JsonProperty("cust_pob_province")
    @JsonAlias({"customerPobProvince", "cust_pob_province", "customerPobProvinceCode", "customer_pob_province_code"})
    private String customerPobProvince;

    @JsonProperty("cust_pob_district")
    @JsonAlias({"customerPobDistrict", "cust_pob_district", "customerPobDistrictCode", "customer_pob_district_code"})
    private String customerPobDistrict;

    @JsonProperty("cust_pob_commune")
    @JsonAlias({"customerPobCommune", "cust_pob_commune", "customerPobCommuneCode", "customer_pob_commune_code"})
    private String customerPobCommune;

    @JsonProperty("cust_pob_village")
    @JsonAlias({"customerPobVillage", "cust_pob_village", "customerPobVillageCode", "customer_pob_village_code"})
    private String customerPobVillage;


    @JsonProperty("ownership")
    private String ownership;

    @JsonProperty("loan_officer")
    private String loanOfficer;

    @JsonProperty("staff")
    private String staff;

    @JsonProperty("target")
    private String target;

    @JsonProperty("average_income")
    private String averageIncome;

    @JsonProperty("occupation")
    private String occupation;

    @JsonProperty("company")
    private String companyName;

    @JsonProperty("staff_code")
    private String referralId;

    @JsonProperty("released_by")
    private String releasedBy;

    @JsonProperty("nid_image_name")
    @JsonAlias({"nidImageName", "nid_image_name", "nidImage", "nid_image"})
    private String nidImageName; // Filename from upload

    @JsonProperty("selfie_image_name")
    @JsonAlias({"selfieImageName", "selfie_image_name", "selfieImage", "selfie_image"})
    private String selfieImageName; // Filename from upload

    private String legalMrz1;
    private String legalMrz2;
    private String legalMrz3;

    @JsonProperty("product_account")
    private String productAccount;

    @JsonProperty("category_account")
    private String categoryAccount;

    @JsonProperty("customer_role")
    private String customerRole;

    @JsonProperty("referral_by")
    private String referralBy;

    @JsonProperty("relation_manager")
    private String relationManager;

    @JsonProperty("place_of_birth")
    @JsonAlias({"placeOfBirth", "place_of_birth", "pob"})
    private String placeOfBirth;

    @JsonProperty("firstNameKh")
    @JsonAlias({"firstNameKh", "first_name_kh"})
    @NotBlank(message = "First name in Khmer is required")
    private String firstNameKh;

    @JsonProperty("lastNameKh")
    @JsonAlias({"lastNameKh", "last_name_kh"})
    @NotBlank(message = "Last name in Khmer is required")
    private String lastNameKh;

    // === CURRENT ADDRESS NAMES (ENGLISH) ===
    @JsonProperty("customer_province_en")
    @JsonAlias({"customerProvinceEn", "customer_province_en"})
    private String customerProvinceEn;

    @JsonProperty("customer_district_en")
    @JsonAlias({"customerDistrictEn", "customer_district_en"})
    private String customerDistrictEn;

    @JsonProperty("customer_commune_en")
    @JsonAlias({"customerCommuneEn", "customer_commune_en"})
    private String customerCommuneEn;

    @JsonProperty("customer_village_en")
    @JsonAlias({"customerVillageEn", "customer_village_en"})
    private String customerVillageEn;

    // === CURRENT ADDRESS NAMES (KHMER) ===
    @JsonProperty("customer_province_kh")
    @JsonAlias({"customerProvinceKh", "customer_province_kh"})
    private String customerProvinceKh;

    @JsonProperty("customer_district_kh")
    @JsonAlias({"customerDistrictKh", "customer_district_kh"})
    private String customerDistrictKh;

    @JsonProperty("customer_commune_kh")
    @JsonAlias({"customerCommuneKh", "customer_commune_kh"})
    private String customerCommuneKh;

    @JsonProperty("customer_village_kh")
    @JsonAlias({"customerVillageKh", "customer_village_kh"})
    private String customerVillageKh;

    // === PLACE OF BIRTH NAMES (ENGLISH) ===
    @JsonProperty("customer_pob_province_en")
    @JsonAlias({"customerPobProvinceEn", "customer_pob_province_en"})
    private String customerPobProvinceEn;

    @JsonProperty("customer_pob_district_en")
    @JsonAlias({"customerPobDistrictEn", "customer_pob_district_en"})
    private String customerPobDistrictEn;

    @JsonProperty("customer_pob_commune_en")
    @JsonAlias({"customerPobCommuneEn", "customer_pob_commune_en"})
    private String customerPobCommuneEn;

    @JsonProperty("customer_pob_village_en")
    @JsonAlias({"customerPobVillageEn", "customer_pob_village_en"})
    private String customerPobVillageEn;

    // === PLACE OF BIRTH NAMES (KHMER) ===
    @JsonProperty("customer_pob_province_kh")
    @JsonAlias({"customerPobProvinceKh", "customer_pob_province_kh"})
    private String customerPobProvinceKh;

    @JsonProperty("customer_pob_district_kh")
    @JsonAlias({"customerPobDistrictKh", "customer_pob_district_kh"})
    private String customerPobDistrictKh;

    @JsonProperty("customer_pob_commune_kh")
    @JsonAlias({"customerPobCommuneKh", "customer_pob_commune_kh"})
    private String customerPobCommuneKh;

    @JsonProperty("customer_pob_village_kh")
    @JsonAlias({"customerPobVillageKh", "customer_pob_village_kh"})
    private String customerPobVillageKh;

    @JsonProperty("account_type")
    @JsonAlias({"accountType", "account_type"})
    private String accountType;
}

