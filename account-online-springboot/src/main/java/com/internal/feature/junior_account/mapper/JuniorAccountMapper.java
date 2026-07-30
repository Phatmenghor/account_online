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

import java.util.Locale;

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
    @Mapping(target = "legalDateOfBirth", source = "request.dateOfBirth")
    @Mapping(target = "legalGender", source = "request.gender")
    @Mapping(target = "maritalStatus", source = "request.maritalStatus")
    @Mapping(target = "phoneNumber", source = "request.phoneNumber")
    @Mapping(target = "branchCode", source = "request.branchCode")
    @Mapping(target = "legalIssuedDate", source = "request.legalIssueDate")
    @Mapping(target = "legalExpiredDate", source = "request.legalExpireDate")
    @Mapping(target = "occupation", source = "request.occupation")
    @Mapping(target = "legalPlaceOfBirth", source = "request.placeOfBirth")
    @Mapping(target = "legalAddress", source = "request.legalAddress")
    @Mapping(target = "guardianLegalId", source = "request.guardianLegalId")
    @Mapping(target = "guardianName", source = "request.guardianName")
    @Mapping(target = "guardianPhone", source = "request.guardianPhone")
    @Mapping(target = "guardianRelationship", source = "request.guardianRelationship")
    @Mapping(target = "guardianCif", source = "request.guardianCif")
    @Mapping(target = "guardianAddress", source = "request.guardianAddress")
    @Mapping(target = "referenceDocType", source = "request.referenceDocType")
    @Mapping(target = "referenceDocName", source = "request.referenceDocName")
    @Mapping(target = "nidImageName", source = "request.nidImageName")
    @Mapping(target = "selfieImageName", source = "request.selfieImageName")
    @Mapping(target = "cif", source = "context.cif")
    @Mapping(target = "khrAccount", source = "context.khrAccount")
    @Mapping(target = "usdAccount", source = "context.usdAccount")
    @Mapping(target = "mnemonic", source = "context.mnemonic")
    @Mapping(target = "submittedBy", source = "context.submittedBy")
    @Mapping(target = "customerProvinceCode", source = "request.customerCurrentProvince")
    @Mapping(target = "customerDistrictCode", source = "request.customerCurrentDistrict")
    @Mapping(target = "customerCommuneCode", source = "request.customerCurrentCommune")
    @Mapping(target = "customerVillageCode", source = "request.customerCurrentVillage")
    @Mapping(target = "customerProvince", expression = "java(firstNonBlank(request.getCustomerProvinceKh(), request.getCustomerProvinceEn()))")
    @Mapping(target = "customerDistrict", expression = "java(firstNonBlank(request.getCustomerDistrictKh(), request.getCustomerDistrictEn()))")
    @Mapping(target = "customerCommune", expression = "java(firstNonBlank(request.getCustomerCommuneKh(), request.getCustomerCommuneEn()))")
    @Mapping(target = "customerVillage", expression = "java(firstNonBlank(request.getCustomerVillageKh(), request.getCustomerVillageEn()))")
    @Mapping(target = "customerPobProvinceCode", source = "request.customerPobProvince")
    @Mapping(target = "customerPobDistrictCode", source = "request.customerPobDistrict")
    @Mapping(target = "customerPobCommuneCode", source = "request.customerPobCommune")
    @Mapping(target = "customerPobVillageCode", source = "request.customerPobVillage")
    @Mapping(target = "customerPobProvince", expression = "java(firstNonBlank(request.getCustomerPobProvinceKh(), request.getCustomerPobProvinceEn()))")
    @Mapping(target = "customerPobDistrict", expression = "java(firstNonBlank(request.getCustomerPobDistrictKh(), request.getCustomerPobDistrictEn()))")
    @Mapping(target = "customerPobCommune", expression = "java(firstNonBlank(request.getCustomerPobCommuneKh(), request.getCustomerPobCommuneEn()))")
    @Mapping(target = "customerPobVillage", expression = "java(firstNonBlank(request.getCustomerPobVillageKh(), request.getCustomerPobVillageEn()))")
    @Mapping(target = "hasNid", source = "hasNid")
    @Mapping(target = "status", constant = "COMPLETED")
    JuniorAccountFinal toJuniorAccountFinal(JuniorCustomerRequest request, OpenAccountContext context, boolean hasNid);

    default String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) return a;
        if (b != null && !b.isBlank()) return b;
        return null;
    }




    @Mapping(target = "branch", source = "request.branchCode")
    @Mapping(target = "maritalStatus", expression = "java(resolveMaritalStatus(request.getMaritalStatus()))")
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

    default String resolveMaritalStatus(String status) {
        if (status == null || status.isBlank()) {
            return "SINGLE";
        }
        String trimmed = status.trim().toUpperCase(Locale.ROOT);
        return switch (trimmed) {
            case "2" -> "MARRIED";
            case "3" -> "DIVORCED";
            case "4" -> "WIDOWED";
            default -> trimmed.equals("1") ? "SINGLE" : trimmed;
        };
    }
}
