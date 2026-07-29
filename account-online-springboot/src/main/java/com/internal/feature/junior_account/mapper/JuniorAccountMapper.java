package com.internal.feature.junior_account.mapper;

import com.internal.feature.aml.models.JuniorAmlStatus;
import com.internal.feature.junior_account.dto.request.JuniorCustomerRequest;
import com.internal.feature.junior_account.models.JuniorAccountFinal;
import com.internal.feature.open_account.dto.request.OpenAccountContext;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

/**
 * MapStruct Mapper for Junior Account DTOs <-> Entities
 */
@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface JuniorAccountMapper {

    @Mapping(target = "legalFirstNameEn", source = "request.givenName")
    @Mapping(target = "legalLastNameEn", source = "request.familyName")
    @Mapping(target = "legalFirstNameKh", source = "request.firstNameKh")
    @Mapping(target = "legalLastNameKh", source = "request.lastNameKh")
    @Mapping(target = "legalGender", source = "request.gender")
    @Mapping(target = "legalAddress", source = "request.legalAddress")
    @Mapping(target = "legalPlaceOfBirth", source = "request.placeOfBirth")
    @Mapping(target = "legalDocName", source = "request.legalDocType")
    @Mapping(target = "branchCode", source = "request.branchCode")
    @Mapping(target = "maritalStatus", source = "request.maritalStatus")
    @Mapping(target = "nationality", source = "request.nationality")
    @Mapping(target = "occupation", source = "request.occupation")
    @Mapping(target = "phoneNumber", source = "request.phoneNumber")
    @Mapping(target = "nidImageName", source = "request.nidImageName")
    @Mapping(target = "selfieImageName", source = "request.selfieImageName")
    @Mapping(target = "cif", source = "context.cif")
    @Mapping(target = "khrAccount", source = "context.khrAccount")
    @Mapping(target = "usdAccount", source = "context.usdAccount")
    @Mapping(target = "mnemonic", source = "context.mnemonic")
    @Mapping(target = "guardianLegalId", source = "request.guardianLegalId")
    @Mapping(target = "guardianName", source = "request.guardianName")
    @Mapping(target = "guardianPhone", source = "request.guardianPhone")
    @Mapping(target = "guardianRelationship", source = "request.guardianRelationship")
    @Mapping(target = "guardianCif", source = "request.guardianCif")
    @Mapping(target = "guardianDocType", source = "request.guardianDocType")
    @Mapping(target = "guardianDob", source = "request.guardianDob")
    @Mapping(target = "guardianAddress", source = "request.guardianAddress")
    @Mapping(target = "guardianInfoJson", source = "request.guardianInfoJson")
    @Mapping(target = "referenceDocType", source = "request.referenceDocType")
    @Mapping(target = "referenceDocName", source = "request.referenceDocName")
    @Mapping(target = "referralId", source = "request.referralId")
    @Mapping(target = "hasNid", source = "hasNid")
    @Mapping(target = "status", constant = "COMPLETED")
    JuniorAccountFinal toJuniorAccountFinal(JuniorCustomerRequest request, OpenAccountContext context, boolean hasNid);

    @Mapping(target = "branch", source = "request.branchCode")
    @Mapping(target = "issuedDate", source = "request.legalIssueDate")
    @Mapping(target = "expiredDate", source = "request.legalExpireDate")
    @Mapping(target = "occupationCode", source = "request.occupation")
    @Mapping(target = "placeOfBirth", source = "request.placeOfBirth")
    @Mapping(target = "legalAddress", source = "request.legalAddress")
    @Mapping(target = "guardianLegalId", source = "request.guardianLegalId")
    @Mapping(target = "guardianName", source = "request.guardianName")
    @Mapping(target = "guardianPhone", source = "request.guardianPhone")
    @Mapping(target = "guardianRelationship", source = "request.guardianRelationship")
    @Mapping(target = "guardianCif", source = "request.guardianCif")
    @Mapping(target = "guardianAddress", source = "request.guardianAddress")
    @Mapping(target = "referenceDocType", source = "request.referenceDocType")
    @Mapping(target = "referenceDocName", source = "request.referenceDocName")
    @Mapping(target = "nationality", source = "request.nationality")
    @Mapping(target = "status", constant = "APPROVE")
    @Mapping(target = "hasNid", source = "hasNid")
    void updateJuniorAmlStatusFromRequest(JuniorCustomerRequest request, boolean hasNid, @MappingTarget JuniorAmlStatus amlStatus);
}
