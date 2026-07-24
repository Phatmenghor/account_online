package com.internal.feature.junior_account.dto.request;

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
}
