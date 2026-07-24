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

@Component
@RequiredArgsConstructor
public class OpenAccountAmlStatusMapper {

        private final MasterDataServiceHelper masterDataServiceHelper;
        private final ObjectMapper objectMapper;

        // -------------------- ENTITY → DTO --------------------
        public AmlStatusDto toDto(AmlStatus entity) {
                if (entity == null)
                        return null;

                return AmlStatusDto.builder()
                                .id(entity.getId())
                                .status(entity.getStatus())
                                .screeningResult(entity.getScreeningResult())
                                .riskLevel(entity.getAmlExternalRiskLevel())
                                .actionTaken(entity.getAmlExternalActionTaken())
                                .rulesTriggered(entity.getAmlExternalRulesTriggered())
                                .serviceName(entity.getAmlExternalServiceName())
                                .totalRulesScore(entity.getAmlExternalTotalRulesScore() == null ? 0
                                                : entity.getAmlExternalTotalRulesScore())
                                .trxnID(entity.getAmlExternalTrxnID())
                                .customerInfo(toCustomerDto(entity))
                                .approvedBy(mapUser(entity.getApprovedBy()))
                                .rejectedBy(mapUser(entity.getRejectedBy()))
                                .currentAddressName(entity.getCurrentAddressName())
                                .currentAddressCode(entity.getCurrentAddressCode())
                                .placeOfBirthName(entity.getPlaceOfBirthName())
                                .placeOfBirthCode(entity.getPlaceOfBirthCode())
                                .maritalStatus(entity.getMaritalStatus())
                                .occupationCode(entity.getOccupationCode())
                                .occupationStatus(entity.getOccupationStatus())
                                .remarks(entity.getRemarks())
                                .nidImageName(entity.getNidImageName())
                                .selfieImageName(entity.getSelfieImageName())
                                .createdAt(entity.getCreatedAt())
                                .updatedAt(entity.getUpdatedAt())
                                .build();
        }

        private CustomerAmlDto toCustomerDto(AmlStatus entity) {
                return CustomerAmlDto.builder()
                                .legalId(entity.getLegalId())
                                .familyName(entity.getFamilyName())
                                .givenName(entity.getGivenName())
                                .firstNameKh(entity.getFirstNameKh())
                                .lastNameKh(entity.getLastNameKh())
                                .dateOfBirth(entity.getDateOfBirth())
                                .gender(entity.getGender())
                                .nationality(entity.getNationality())
                                .legalAddress(entity.getCurrentAddressName())
                                .issuedDate(entity.getIssuedDate())
                                .expiredDate(entity.getExpiredDate())
                                .phoneNumber(entity.getPhoneNumber())
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

                String fullNameEn = request.getFamilyName() + " " + request.getGivenName();
                String fullNameKh = (request.getLastNameKh() != null ? request.getLastNameKh() : "") + " "
                                + (request.getFirstNameKh() != null ? request.getFirstNameKh() : "");

                CustomerAmlDto customerDto = CustomerAmlDto.builder()
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
                                .build();

                String currentAddressCode = null;
                if (request.getCustomerCurrentProvince() != null) {
                        try {
                                LocationCodesDto loc = masterDataServiceHelper.resolveAddress(
                                                request.getCustomerCurrentProvince(),
                                                request.getCustomerCurrentDistrict(),
                                                request.getCustomerCurrentCommune(),
                                                request.getCustomerCurrentVillage());
                                currentAddressCode = masterDataServiceHelper.buildFullAddressCode(loc);
                        } catch (Exception ignored) {
                        }
                }

                String placeOfBirthCode = null;
                if (request.getCustomerPobProvince() != null) {
                        try {
                                LocationCodesDto loc = masterDataServiceHelper.resolveAddress(
                                                request.getCustomerPobProvince(),
                                                request.getCustomerPobDistrict(),
                                                request.getCustomerPobCommune(),
                                                request.getCustomerPobVillage());
                                placeOfBirthCode = masterDataServiceHelper.buildFullAddressCode(loc);
                        } catch (Exception ignored) {
                        }
                }

                return AmlStatusDto.builder()
                                .status(status)
                                .customerInfo(customerDto)
                                .currentAddressCode(currentAddressCode)
                                .placeOfBirthCode(placeOfBirthCode)
                                .currentAddressName(request.getLegalAddress())
                                .maritalStatus(request.getMaritalStatus())
                                .occupationCode(request.getOccupation())
                                .riskLevel(amlResponse != null ? amlResponse.getRiskLevel() : null)
                                .actionTaken(amlResponse != null ? amlResponse.getActionTaken() : null)
                                .serviceName(amlResponse != null ? amlResponse.getServiceName() : null)
                                .totalRulesScore(amlResponse != null ? amlResponse.getTotalRulesScore() : 0)
                                .trxnID(amlResponse != null ? amlResponse.getTrxnID() : null)
                                .nidImageName(request.getNidImageName())
                                .selfieImageName(request.getSelfieImageName())
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

                return CustomerAmlRequest.builder()
                                .customerId(request.getLegalId())
                                .custCreateDate(LocalDateTime.now()
                                                .format(DateTimeFormatter.ofPattern("ddMMyyHHmm")))
                                .customerType(StatusData.ACTIVE.toString())
                                .custName(request.getFamilyName() + " " + request.getGivenName())
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






