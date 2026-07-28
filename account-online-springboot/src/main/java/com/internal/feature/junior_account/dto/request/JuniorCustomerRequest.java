package com.internal.feature.junior_account.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.internal.feature.open_account.dto.request.CustomerRequest;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class JuniorCustomerRequest extends CustomerRequest {

    @JsonProperty("has_nid")
    @JsonAlias({"hasNid", "has_nid"})
    @Builder.Default
    private Boolean hasNid = true;

    @JsonProperty("guardian_legal_id")
    @JsonAlias({"guardianLegalId", "guardian_legal_id"})
    private String guardianLegalId;

    @JsonProperty("guardian_name")
    @JsonAlias({"guardianName", "guardian_name"})
    private String guardianName;

    @JsonProperty("guardian_phone")
    @JsonAlias({"guardianPhone", "guardian_phone"})
    private String guardianPhone;

    @JsonProperty("guardian_relationship")
    @JsonAlias({"guardianRelationship", "guardian_relationship"})
    private String guardianRelationship;

    @JsonProperty("guardian_cif")
    @JsonAlias({"guardianCif", "guardian_cif", "jointCif", "joint_cif"})
    private String guardianCif;
}
