package com.internal.feature.open_account.mapper;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.internal.enumation.AmlStatusEnum;
import com.internal.enumation.StatusData;
import com.internal.feature.aml.dto.request.CreateAmlRequestDto;
import com.internal.feature.aml.dto.request.CustomerAmlDto;
import com.internal.feature.aml.dto.response.AmlStatusDto;
import com.internal.feature.aml.models.AmlStatus;
import com.internal.feature.auth.dto.response.UserResponseDto;
import com.internal.feature.auth.models.UserEntity;
import com.internal.feature.master_data.dto.response.LocationCodesDto;
import com.internal.feature.open_account.dto.request.CustomerAmlRequest;
import com.internal.feature.open_account.dto.request.CustomerRequest;
import com.internal.feature.open_account.dto.response.AmlExternalResponseDto;
import com.internal.feature.open_account.dto.response.CustomerResponse;
import lombok.RequiredArgsConstructor;
import org.mapstruct.Named;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import com.internal.feature.customer_image.component.CustomerImageStorageComponent;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
@RequiredArgsConstructor
public class OpenAccountAmlStatusMapper {

        private final MasterDataServiceHelper masterDataServiceHelper;
        private final ObjectMapper objectMapper;
        private final CustomerImageStorageComponent storageComponent;

        private String resolveNidImage(String imageFromRequest, String legalId) {
                if (imageFromRequest != null && !imageFromRequest.isBlank()) {
                        return imageFromRequest;
                }
                if (legalId != null && storageComponent != null) {
                        try {
                                Path match = storageComponent.findLatestFileRecursive(
                                                Paths.get(storageComponent.getUploadDir(), "nid"), "nid_" + legalId + "_");
                                if (match != null) {
                                        return match.getFileName().toString();
                                }
                        } catch (Exception ignored) {}
                }
                return "";
        }

        private String resolveSelfieImage(String imageFromRequest, String legalId) {
                if (imageFromRequest != null && !imageFromRequest.isBlank()) {
                        return imageFromRequest;
                }
                if (legalId != null && storageComponent != null) {
                        try {
                                Path match = storageComponent.findLatestFileRecursive(
                                                Paths.get(storageComponent.getUploadDir(), "selfie"), "selfie_" + legalId + "_");
                                if (match != null) {
                                        return match.getFileName().toString();
                                }
                        } catch (Exception ignored) {}
                }
                return "";
        }

        private String formatFastAddress(String en, String kh, String code) {
                if (en != null && !en.isBlank() && kh != null && !kh.isBlank()) {
                        return en + " / " + kh;
                }
                if (kh != null && !kh.isBlank()) return kh;
                if (en != null && !en.isBlank()) return en;
                return code != null ? code : "";
        }

        private String joinNonEmpty(String delimiter, String... parts) {
                java.util.List<String> list = new java.util.ArrayList<>();
                for (String p : parts) {
                        if (p != null && !p.isBlank()) {
                                list.add(p);
                        }
                }
                return String.join(delimiter, list);
        }

        // -------------------- ENTITY → DTO --------------------
        public AmlStatusDto toDto(AmlStatus entity) {
                if (entity == null)
                        return null;

                return AmlStatusDto.builder()
                                .id(entity.getId())
                                .status(entity.getStatus())
                                .screeningResult(entity.getScreeningResult() != null ? entity.getScreeningResult() : "CLEAN")
                                .riskLevel(entity.getAmlExternalRiskLevel() != null ? entity.getAmlExternalRiskLevel() : "LOW")
                                .actionTaken(entity.getAmlExternalActionTaken() != null ? entity.getAmlExternalActionTaken() : "PASS")
                                .rulesTriggered(entity.getAmlExternalRulesTriggered() != null ? entity.getAmlExternalRulesTriggered() : "")
                                .serviceName(entity.getAmlExternalServiceName() != null ? entity.getAmlExternalServiceName() : "AML_CHECK")
                                .totalRulesScore(entity.getAmlExternalTotalRulesScore() == null ? 0
                                                : entity.getAmlExternalTotalRulesScore())
                                .trxnID(entity.getAmlExternalTrxnID() != null ? entity.getAmlExternalTrxnID() : "")
                                .customerInfo(toCustomerDto(entity))
                                .approvedBy(mapUser(entity.getApprovedBy()))
                                .rejectedBy(mapUser(entity.getRejectedBy()))
                                .currentAddressName(entity.getCurrentAddressName() != null ? entity.getCurrentAddressName() : "")
                                .currentAddressCode(entity.getCurrentAddressCode() != null ? entity.getCurrentAddressCode() : "")
                                .placeOfBirthName(entity.getPlaceOfBirthName() != null ? entity.getPlaceOfBirthName() : (entity.getCurrentAddressName() != null ? entity.getCurrentAddressName() : ""))
                                .placeOfBirthCode(entity.getPlaceOfBirthCode() != null ? entity.getPlaceOfBirthCode() : "")
                                .maritalStatus(entity.getMaritalStatus() != null ? entity.getMaritalStatus() : "SINGLE")
                                .occupationCode(entity.getOccupationCode() != null ? entity.getOccupationCode() : "")
                                .occupationStatus(entity.getOccupationStatus() != null ? entity.getOccupationStatus() : "")
                                .remarks(entity.getRemarks() != null ? entity.getRemarks() : "Approved")
                                .nidImageName(resolveNidImage(entity.getNidImageName(), entity.getLegalId()))
                                .selfieImageName(resolveSelfieImage(entity.getSelfieImageName(), entity.getLegalId()))
                                .createdAt(entity.getCreatedAt())
                                .updatedAt(entity.getUpdatedAt())
                                .build();
        }

        private CustomerAmlDto toCustomerDto(AmlStatus entity) {
                return CustomerAmlDto.builder()
                                .legalId(entity.getLegalId() != null ? entity.getLegalId() : "")
                                .familyName(entity.getFamilyName() != null ? entity.getFamilyName() : "")
                                .givenName(entity.getGivenName() != null ? entity.getGivenName() : "")
                                .firstNameKh(entity.getFirstNameKh() != null ? entity.getFirstNameKh() : "")
                                .lastNameKh(entity.getLastNameKh() != null ? entity.getLastNameKh() : "")
                                .dateOfBirth(entity.getDateOfBirth() != null ? entity.getDateOfBirth() : "")
                                .gender(entity.getGender() != null ? entity.getGender() : "M")
                                .nationality(entity.getNationality() != null ? entity.getNationality() : "KH")
                                .legalAddress(entity.getCurrentAddressName() != null ? entity.getCurrentAddressName() : "")
                                .issuedDate(entity.getIssuedDate() != null ? entity.getIssuedDate() : "")
                                .expiredDate(entity.getExpiredDate() != null ? entity.getExpiredDate() : "")
                                .phoneNumber(entity.getPhoneNumber() != null ? entity.getPhoneNumber() : "")
                                .build();
        }

        private UserResponseDto mapUser(UserEntity user) {
                if (user == null)
                        return null;
                return UserResponseDto.builder()
                                .id(user.getId())
                                .idCard(user.getUsername())
                                .userRole(user.getPosition())
                                .userStatus(String.valueOf(user.getStatus()))
                                .fullName(user.getFullName())
                                .position(user.getPosition())
                                .profileUrl(user.getProfileUrl())
                                .createdAt(user.getCreatedAt())
                                .updatedAt(user.getUpdatedAt())
                                .build();
        }

        // -------------------- REQUEST + AML RESPONSE DTO --------------------
        public AmlStatusDto fromRequestAndResponse(
                        CustomerRequest request,
                        AmlExternalResponseDto amlResponse,
                        AmlStatusEnum status) {

                CustomerAmlDto customerDto = CustomerAmlDto.builder()
                                .legalId(request.getLegalId())
                                .familyName(request.getFamilyName() != null ? request.getFamilyName() : "")
                                .givenName(request.getGivenName() != null ? request.getGivenName() : "")
                                .firstNameKh(request.getFirstNameKh() != null ? request.getFirstNameKh() : "")
                                .lastNameKh(request.getLastNameKh() != null ? request.getLastNameKh() : "")
                                .dateOfBirth(request.getDateOfBirth() != null ? request.getDateOfBirth() : "")
                                .gender(request.getGender() != null ? request.getGender() : "M")
                                .nationality("KH")
                                .legalAddress(request.getLegalAddress() != null ? request.getLegalAddress() : "")
                                .issuedDate(request.getLegalIssueDate() != null ? request.getLegalIssueDate() : "")
                                .expiredDate(request.getLegalExpireDate() != null ? request.getLegalExpireDate() : "")
                                .phoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber() : "")
                                .build();

                String currentAddressCode = joinNonEmpty(", ",
                                request.getCustomerCurrentProvince(),
                                request.getCustomerCurrentDistrict(),
                                request.getCustomerCurrentCommune(),
                                request.getCustomerCurrentVillage());

                String placeOfBirthCode = joinNonEmpty(", ",
                                request.getCustomerPobProvince(),
                                request.getCustomerPobDistrict(),
                                request.getCustomerPobCommune(),
                                request.getCustomerPobVillage());

                String resolvedCurrentAddress = joinNonEmpty(", ",
                                formatFastAddress(request.getCustomerVillageEn(), request.getCustomerVillageKh(), request.getCustomerCurrentVillage()),
                                formatFastAddress(request.getCustomerCommuneEn(), request.getCustomerCommuneKh(), request.getCustomerCurrentCommune()),
                                formatFastAddress(request.getCustomerDistrictEn(), request.getCustomerDistrictKh(), request.getCustomerCurrentDistrict()),
                                formatFastAddress(request.getCustomerProvinceEn(), request.getCustomerProvinceKh(), request.getCustomerCurrentProvince()));

                if (resolvedCurrentAddress.isBlank()) {
                        resolvedCurrentAddress = request.getLegalAddress() != null ? request.getLegalAddress() : "";
                }

                String resolvedPob = request.getPlaceOfBirth();
                if (resolvedPob == null || resolvedPob.isBlank()) {
                        resolvedPob = joinNonEmpty(", ",
                                        formatFastAddress(request.getCustomerPobVillageEn(), request.getCustomerPobVillageKh(), request.getCustomerPobVillage()),
                                        formatFastAddress(request.getCustomerPobCommuneEn(), request.getCustomerPobCommuneKh(), request.getCustomerPobCommune()),
                                        formatFastAddress(request.getCustomerPobDistrictEn(), request.getCustomerPobDistrictKh(), request.getCustomerPobDistrict()),
                                        formatFastAddress(request.getCustomerPobProvinceEn(), request.getCustomerPobProvinceKh(), request.getCustomerPobProvince()));
                }
                if (resolvedPob == null || resolvedPob.isBlank()) {
                        resolvedPob = resolvedCurrentAddress;
                }

                String resolvedNid = resolveNidImage(request.getNidImageName(), request.getLegalId());
                String resolvedSelfie = resolveSelfieImage(request.getSelfieImageName(), request.getLegalId());

                return AmlStatusDto.builder()
                                .status(status)
                                .customerInfo(customerDto)
                                .currentAddressCode(currentAddressCode)
                                .placeOfBirthCode(placeOfBirthCode)
                                .currentAddressName(resolvedCurrentAddress != null ? resolvedCurrentAddress : "")
                                .placeOfBirthName(resolvedPob != null ? resolvedPob : "")
                                .maritalStatus(request.getMaritalStatus() != null ? request.getMaritalStatus() : "SINGLE")
                                .occupationCode(request.getOccupation() != null ? request.getOccupation() : "")
                                .branch(request.getBranchCode() != null ? request.getBranchCode() : "")
                                .riskLevel(amlResponse != null && amlResponse.getRiskLevel() != null ? amlResponse.getRiskLevel() : "LOW")
                                .actionTaken(amlResponse != null && amlResponse.getActionTaken() != null ? amlResponse.getActionTaken() : "PASS")
                                .serviceName(amlResponse != null && amlResponse.getServiceName() != null ? amlResponse.getServiceName() : "AML_CHECK")
                                .totalRulesScore(amlResponse != null ? amlResponse.getTotalRulesScore() : 0)
                                .trxnID(amlResponse != null && amlResponse.getTrxnID() != null ? amlResponse.getTrxnID() : "")
                                .nidImageName(resolvedNid)
                                .selfieImageName(resolvedSelfie)
                                .build();
        }

        public CustomerResponse buildCustomerAccInfo(String cif, String khrAccount, String usdAccount,
                        String mnemonic) {
                return CustomerResponse.builder()
                                .cif(cif)
                                .khrAccount(khrAccount)
                                .usdAccount(usdAccount)
                                .mnemonic(mnemonic)
                                .build();
        }

        @Named("mapCustomerInfo")
        private CustomerAmlDto mapCustomerInfo(CustomerRequest request) {
                if (request == null)
                        return null;
                return CustomerAmlDto.builder()
                                .legalId(request.getLegalId())
                                .givenName(request.getGivenName())
                                .familyName(request.getFamilyName())
                                .firstNameKh(request.getFirstNameKh())
                                .lastNameKh(request.getLastNameKh())
                                .dateOfBirth(request.getDateOfBirth())
                                .gender(request.getGender())
                                .phoneNumber(request.getPhoneNumber())
                                .nationality("KH")
                                .issuedDate(request.getLegalIssueDate())
                                .expiredDate(request.getLegalExpireDate())
                                .legalAddress(request.getLegalAddress())
                                .build();
        }

        // -------------------- CREATE REQUEST FOR HIGH RISK --------------------
        public CreateAmlRequestDto toCreateRequest(
                        CustomerAmlRequest amlRequest,
                        AmlExternalResponseDto amlResponse,
                        CustomerRequest request,
                        String occupationStatus,
                        AmlStatusEnum status) throws Exception {

                String requestPayloadJson = null;
                try {
                        requestPayloadJson = objectMapper.writeValueAsString(request);
                } catch (Exception e) {
                        // ignore if serialization fails
                }

                return CreateAmlRequestDto.builder()
                                .status(status)
                                .legalId(request.getLegalId())
                                .familyName(request.getFamilyName())
                                .givenName(request.getGivenName())
                                .firstNameKh(request.getFirstNameKh())
                                .lastNameKh(request.getLastNameKh())
                                .dateOfBirth(request.getDateOfBirth())
                                .gender(request.getGender())
                                .nationality("KH")
                                .legalAddress(request.getLegalAddress())
                                .issuedDate(request.getLegalIssueDate())
                                .expiredDate(request.getLegalExpireDate())
                                .phoneNumber(request.getPhoneNumber())
                                .branch(request.getBranchCode())
                                .maritalStatus(request.getMaritalStatus())
                                .occupationCode(request.getOccupation())
                                .occupationStatus(occupationStatus)
                                .customerCurrentProvince(request.getCustomerCurrentProvince())
                                .customerCurrentDistrict(request.getCustomerCurrentDistrict())
                                .customerCurrentCommune(request.getCustomerCurrentCommune())
                                .customerCurrentVillage(request.getCustomerCurrentVillage())
                                .customerPobProvince(request.getCustomerPobProvince())
                                .customerPobDistrict(request.getCustomerPobDistrict())
                                .customerPobCommune(request.getCustomerPobCommune())
                                .customerPobVillage(request.getCustomerPobVillage())
                                .screeningResult(objectMapper.writeValueAsString(amlResponse))
                                .riskLevel(amlResponse.getRiskLevel())
                                .actionTaken(amlResponse.getActionTaken())
                                .rulesTriggered(objectMapper.writeValueAsString(amlResponse.getRulesTriggered()))
                                .serviceName(amlResponse.getServiceName())
                                .totalRulesScore(amlResponse.getTotalRulesScore())
                                .trxnID(amlResponse.getTrxnID())
                                .nidImageName(request.getNidImageName())
                                .selfieImageName(request.getSelfieImageName())
                                .requestPayload(requestPayloadJson)
                                .build();
        }

        public CustomerAmlRequest buildAmlRequestDto(CustomerRequest request) {
                // Resolve English Address
                String englishAddress = "NA";
                if (request.getCustomerCurrentProvince() != null) {
                        try {
                                LocationCodesDto loc = masterDataServiceHelper.resolveAddress(
                                                request.getCustomerCurrentProvince(),
                                                request.getCustomerCurrentDistrict(),
                                                request.getCustomerCurrentCommune(),
                                                request.getCustomerCurrentVillage());
                                String resolved = masterDataServiceHelper.buildEnglishAddress(loc);
                                if (resolved != null && !resolved.isEmpty()) {
                                        englishAddress = resolved;
                                }
                        } catch (Exception e) {
                                // Fallback
                                englishAddress = request.getLegalAddress() != null ? request.getLegalAddress() : "NA";
                        }
                } else {
                        englishAddress = request.getLegalAddress() != null ? request.getLegalAddress() : "NA";
                }

                String khmerFullName = joinNonEmpty(" ", request.getLastNameKh(), request.getFirstNameKh());
                if (khmerFullName.isBlank()) {
                    khmerFullName = joinNonEmpty(" ", request.getFamilyName(), request.getGivenName());
                }
                String englishFullName = joinNonEmpty(" ", request.getFamilyName(), request.getGivenName());

                return CustomerAmlRequest.builder()
                                .customerId(request.getLegalId())
                                .custCreateDate(LocalDateTime.now()
                                                .format(DateTimeFormatter.ofPattern("ddMMyyHHmm")))
                                .customerType(StatusData.ACTIVE.toString())
                                .custName(englishFullName)
                                .shortName(khmerFullName)
                                .givenName(request.getGivenName())
                                .familyName(request.getFamilyName())
                                .gender(request.getGender())
                                .dateOfBirth(formatDateForAml(request.getDateOfBirth()))
                                .nationality("KH")
                                // Use the English address
                                .legalAddress(englishAddress)
                                .custDistrict(request.getCustomerPobDistrict())
                                .custProvince(request.getCustomerPobProvince())
                                .country("Cambodia")
                                .sms1(null)
                                .phoneNumber(request.getPhoneNumber())
                                .offPhone(null)
                                .occupation(request.getOccupation())
                                .legalId(request.getLegalId() + "-NATIONAL.ID")
                                .maritalStatus(request.getMaritalStatus())
                                .businessSector(null)
                                .target("220")
                                .income(0)
                                .dobYear(null)
                                .dobMonth(null)
                                .dobDay(null)
                                .legalDocName("NATIONAL.ID")
                                .legalExpDate(formatDateForAml(request.getLegalExpireDate()))
                                .customerRating("1")
                                .build();
        }

        public CustomerRequest toCustomerRequest(AmlStatus entity) {
                if (entity == null) return null;

                if (entity.getRequestPayload() != null && !entity.getRequestPayload().isBlank()) {
                        try {
                                CustomerRequest req = objectMapper.readValue(entity.getRequestPayload(), CustomerRequest.class);
                                if (req != null) {
                                        return req;
                                }
                        } catch (Exception e) {
                                // Fallback to field mapping below if deserialization fails
                        }
                }

                String currentProvince = null;
                String currentDistrict = null;
                String currentCommune = null;
                String currentVillage = null;
                if (entity.getCurrentAddressCode() != null && !entity.getCurrentAddressCode().isBlank()) {
                        String[] parts = entity.getCurrentAddressCode().split(",\\s*");
                        if (parts.length > 0) currentProvince = parts[0];
                        if (parts.length > 1) currentDistrict = parts[1];
                        if (parts.length > 2) currentCommune = parts[2];
                        if (parts.length > 3) currentVillage = parts[3];
                }

                String pobProvince = null;
                String pobDistrict = null;
                String pobCommune = null;
                String pobVillage = null;
                if (entity.getPlaceOfBirthCode() != null && !entity.getPlaceOfBirthCode().isBlank()) {
                        String[] parts = entity.getPlaceOfBirthCode().split(",\\s*");
                        if (parts.length > 0) pobProvince = parts[0];
                        if (parts.length > 1) pobDistrict = parts[1];
                        if (parts.length > 2) pobCommune = parts[2];
                        if (parts.length > 3) pobVillage = parts[3];
                }

                return CustomerRequest.builder()
                                .legalId(entity.getLegalId())
                                .givenName(entity.getGivenName() != null ? entity.getGivenName() : "")
                                .familyName(entity.getFamilyName() != null ? entity.getFamilyName() : "")
                                .firstNameKh(entity.getFirstNameKh() != null ? entity.getFirstNameKh() : "")
                                .lastNameKh(entity.getLastNameKh() != null ? entity.getLastNameKh() : "")
                                .dateOfBirth(entity.getDateOfBirth())
                                .gender(entity.getGender())
                                .nationality(entity.getNationality() != null ? entity.getNationality() : "KH")
                                .phoneNumber(entity.getPhoneNumber())
                                .branchCode(entity.getBranch())
                                .maritalStatus(entity.getMaritalStatus())
                                .legalIssueDate(entity.getIssuedDate())
                                .legalExpireDate(entity.getExpiredDate())
                                .customerCurrentProvince(currentProvince)
                                .customerCurrentDistrict(currentDistrict)
                                .customerCurrentCommune(currentCommune)
                                .customerCurrentVillage(currentVillage)
                                .customerPobProvince(pobProvince)
                                .customerPobDistrict(pobDistrict)
                                .customerPobCommune(pobCommune)
                                .customerPobVillage(pobVillage)
                                .occupation(entity.getOccupationCode())
                                .nidImageName(entity.getNidImageName())
                                .selfieImageName(entity.getSelfieImageName())
                                .build();
        }

        private String formatDateForAml(String date) {
                if (date == null)
                        return null;
                return date.replace("-", "");
        }

}






