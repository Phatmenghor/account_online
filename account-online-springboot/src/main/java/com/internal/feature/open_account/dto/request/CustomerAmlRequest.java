package com.internal.feature.open_account.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerAmlRequest {

    @JsonProperty("customer_id")
    private String customerId;

    @JsonProperty("cust_create_date")
    private String custCreateDate;

    @JsonProperty("customer_type")
    private String customerType;

    @JsonProperty("cust_name")
    private String custName;

    @JsonProperty("short_name")
    private String shortName;

    @JsonProperty("given_name")
    private String givenName;

    @JsonProperty("family_name")
    private String familyName;

    @JsonProperty("gender")
    private String gender;

    @JsonProperty("date_of_birth")
    private String dateOfBirth;

    @JsonProperty("nationality")
    private String nationality;

    @JsonProperty("address")
    private String legalAddress;

    @JsonProperty("cust_district")
    private String custDistrict;

    @JsonProperty("cust_province")
    private String custProvince;

    @JsonProperty("country")
    private String country;

    @JsonProperty("sms_1")
    private String sms1;

    @JsonProperty("phone_1")
    private String phoneNumber;

    @JsonProperty("off_phone")
    private String offPhone;

    @JsonProperty("occupation")
    private String occupation;

    @JsonProperty("legal_id")
    private String legalId;

    @JsonProperty("marital_status")
    private String maritalStatus;

    @JsonProperty("business_sector")
    private String businessSector;

    @JsonProperty("target")
    private String target;

    @JsonProperty("income")
    private Integer income;

    @JsonProperty("dob_year")
    private Integer dobYear;

    @JsonProperty("dob_month")
    private Integer dobMonth;

    @JsonProperty("dob_day")
    private Integer dobDay;

    @JsonProperty("legal_doc_name")
    private String legalDocName;

    @JsonProperty("legal_exp_date")
    private String legalExpDate;

    @JsonProperty("customer_rating")
    private String customerRating;
}

