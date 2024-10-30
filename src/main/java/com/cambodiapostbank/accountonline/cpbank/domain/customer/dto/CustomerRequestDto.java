package com.cambodiapostbank.accountonline.cpbank.domain.customer.dto;

import com.cambodiapostbank.accountonline.cpbank.utils.validator.date.AllowedAge;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import javax.validation.constraints.NotNull;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CustomerRequestDto {
    @JsonProperty("fullname1")
    private String fullName1;

    @JsonProperty("fullname2")
    private String fullName2;

    @JsonProperty("firstNameKh")
    private String firstNameKh;

    @JsonProperty("lastNameKh")
    private String lastNameKh;

    @JsonProperty("family_name")
    @NotNull(message = "The familyName field is required.")
    private String familyName;

    @JsonProperty("given_name")
    @NotNull(message = "The givenName field is required.")
    private String givenName;

    @JsonProperty("short_name")
    private String shortName;

    @JsonProperty("email")
    private String email;

    @JsonProperty("date_of_birth")
    @AllowedAge(message = "The age must be greater than or equal to 18 years.", minAge=18)
    private String dateOfBirth;
    @JsonProperty("marital_status")
    private String maritalStatus;
    @JsonProperty("sms")
    @NotNull(message = "The contactNumber field is required.")
    private String contactNumber;
    @JsonProperty("gender")
    @NotNull(message = "The gender field is required.")
    private String gender;
    @JsonProperty("customer_rate")
    private String customerRate;
    @JsonProperty("sector")
    private String sector;
    @JsonProperty("cost_center")
    private String costCenter;
    @JsonProperty("industry")
    private String industry;
    @JsonProperty("nationality")
    private String nationality;
    @JsonProperty("customer_type")
    private String customerType;
    @JsonProperty("customer_status")
    private String customerStatus;
    @JsonProperty("cust_province")
    private String customerProvince;
    @JsonProperty("cust_district")
    private String customerDistrict;
    @JsonProperty("cust_commune")
    private String customerCommune;
    @JsonProperty("cust_village")
    private String customerVillage;

    @JsonProperty("cust_pob_province")
    private String customerPobProvince;
    @JsonProperty("cust_pob_district")
    private String customerPobDistrict;
    @JsonProperty("cust_pob_commune")
    private String customerPobCommune;
    @JsonProperty("cust_pob_village")
    private String customerPobVillage;

    @JsonProperty("residence")
    private String residence;

    @JsonProperty("product_account")
    private String productAccount;

    @JsonProperty("legal_id")
    @NotNull(message = "The legal ID field is required.")
    private String legalId;
    @JsonProperty("legal_doc_name")
    @NotNull(message = "The legal type field is required.")
    private String legalDocName;

    @JsonProperty("legal_holder_name")
    private String legalHolderName;
    @JsonProperty("legal_iss_auth")
    private String legalIssueAuth;
    @JsonProperty("legal_iss_date")
    private String legalIssueDate;
    @JsonProperty("legal_exp_date")
    private String legalExpDate;
    @JsonProperty("language")
    private String language;
    @JsonProperty("title")
    private String title;
    @JsonProperty("ownership")
    private String ownership;
    @JsonProperty("loan_officer")
    private String loanOfficer;
    @JsonProperty("staff")
    private String staff;
    @JsonProperty("target")
    private String target;
    @JsonProperty("img_selfie")
    private String imageSelfie;
    @JsonProperty("img_id")
    private String imageId;
    @JsonProperty("branch_code")
    private String branchCode;
    @JsonProperty("average_income")
    private String averageIncome;

    @JsonProperty("company")
    private String company;

    @JsonProperty("staff_code")
    private String staffCode;

    @JsonProperty("otp_code")
    private String otpCode;

    @JsonProperty("phone_number")
    private String phoneNumber;

    @JsonProperty("occupation")
    @NotNull(message = "The occupation field is required.")
    private String occupation;

    @JsonProperty("released_by")
//  @NotNull(message = "The releasedBy field is required.")
    private  String releasedBy;

    @JsonProperty("customer_address")
    private String customerAddress;

    @JsonProperty("customer_place_of_birth")
    private String customerPlaceOfBirth;

    @JsonProperty("nid_image")
    private String customerNidImage;

    @JsonProperty("selfie_image")
    private String customerSelfieImage;

    @JsonProperty("rec_id")
    private String recordId;

    @JsonProperty("category_account")
    private String categoryAccount;

    @JsonProperty("customer_role")
    private String customerRole;

    @JsonProperty("relation_manager")
    private String relationManager;

    @JsonProperty("place_of_birth")
    private String placeOfBirth;

    @JsonProperty("address")
    private String Address;

    public String toJSON() throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
            return mapper.writeValueAsString(this);
    }
}
