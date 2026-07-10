package com.internal.feature.logs_report.mapper;


import com.internal.feature.auth.dto.response.UserResponseDto;
import com.internal.feature.auth.mapper.UserMapper;
import com.internal.feature.auth.models.UserEntity;
import com.internal.feature.logs_report.dto.response.AccountOnlineFinalExcelResponseDto;
import com.internal.feature.logs_report.dto.response.AccountOnlineFinalResponseDto;
import com.internal.feature.logs_report.dto.response.AllAccountOnlineFinalExcelResponseDto;
import com.internal.feature.logs_report.dto.response.AllAccountOnlineFinalResponseDto;
import com.internal.feature.logs_report.model.AccountOnlineFinal;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface AccountOnlineFinalMapper {

    @Named("userEntityToDto")
    default UserResponseDto userEntityToDto(UserEntity user) {
        if (user == null) return null;
        return UserResponseDto.builder()
                .id(user.getId())
                .idCard(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .position(user.getPosition())
                .profileUrl(user.getProfileUrl())
                .phoneNumber(user.getPhoneNumber())
                .branch(user.getBranch())
                .department(user.getDepartment())
                .userRole(user.getRoles() != null && !user.getRoles().isEmpty()
                        ? user.getRoles().stream()
                            .map(r -> r.getName().name())
                            .collect(java.util.stream.Collectors.joining(", "))
                        : null)
                .build();
    }

    @Mapping(target = "submittedByUser", source = "submittedByUser", qualifiedByName = "userEntityToDto")
    AccountOnlineFinalResponseDto toDto(AccountOnlineFinal history);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "cif", source = "cif")
    @Mapping(target = "usdAccount", source = "usdAccount")
    @Mapping(target = "khrAccount", source = "khrAccount")
    @Mapping(target = "mnemonic", source = "mnemonic")
    @Mapping(target = "legalId", source = "legalId")
    @Mapping(target = "branchCode", source = "branchCode")
    @Mapping(target = "branchNameKh", source = "branchNameKh")
    AccountOnlineFinalExcelResponseDto toExcelDto(AccountOnlineFinal historyExcel);

    @Named("mapToListDto")
    default AllAccountOnlineFinalResponseDto mapToListDto(List<AccountOnlineFinalResponseDto> content, Page<AccountOnlineFinal> accountOnlineFinalPage) {
        AllAccountOnlineFinalResponseDto response = new AllAccountOnlineFinalResponseDto();
        response.setContent(content);
        response.setPageNo(accountOnlineFinalPage.getNumber() + 1);
        response.setPageSize(accountOnlineFinalPage.getSize());
        response.setTotalElements(accountOnlineFinalPage.getTotalElements());
        response.setTotalPages(accountOnlineFinalPage.getTotalPages());
        response.setLast(accountOnlineFinalPage.isLast());
        return response;
    }

    @Named("mapToListExcelDto")
    default AllAccountOnlineFinalExcelResponseDto mapToListExcelDto(List<AccountOnlineFinalExcelResponseDto> content) {
        AllAccountOnlineFinalExcelResponseDto response = new AllAccountOnlineFinalExcelResponseDto();
        response.setContent(content);
        response.setCountAll(content.size());
        return response;
    }
}
