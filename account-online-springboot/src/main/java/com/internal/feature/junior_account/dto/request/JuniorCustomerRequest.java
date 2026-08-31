package com.internal.feature.junior_account.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.internal.feature.open_account.dto.request.CustomerRequest;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Data
@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class JuniorCustomerRequest extends CustomerRequest {

    @JsonProperty("has_nid")
    @Builder.Default
    private Boolean hasNid = true;

    @JsonProperty("guardian_legal_id")
    private String guardianLegalId;

    @JsonProperty("guardian_name")
    private String guardianName;

    @JsonProperty("guardian_phone")
    private String guardianPhone;

    @JsonProperty("guardian_relationship")
    private String guardianRelationship;

    @JsonProperty("guardian_cif")
    private String guardianCif;

    @JsonProperty("guardian_doc_type")
    private String guardianDocType;

    @JsonProperty("guardian_dob")
    private String guardianDob;

    @JsonProperty("guardian_address")
    private String guardianAddress;

    @JsonProperty("guardian_info_json")
    private String guardianInfoJson;

    @JsonProperty("referral_id")
    private String referralId;

    @JsonProperty("reference_doc_type")
    private String referenceDocType;

    @JsonProperty("reference_doc_name")
    private String referenceDocName;

    @JsonProperty("reference_doc_image")
    private String referenceDocImage;

    @JsonProperty("selfie_image_base64")
    private String selfieImageBase64;
}
