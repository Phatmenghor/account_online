package com.internal.feature.auth.mapper;

import com.internal.enumation.StatusData;
import com.internal.feature.auth.dto.response.UserResponseDto;
import com.internal.feature.auth.models.UserEntity;
import com.internal.feature.master_data.models.Branch;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface AuthMapper {

    @Mapping(source = "username", target = "idCard")
    @Mapping(source = "status", target = "userStatus", qualifiedByName = "mapStatus")
    @Mapping(source = "roles", target = "userRole", qualifiedByName = "rolesToRoleString")
    @Mapping(source = "branch", target = "branch", qualifiedByName = "mapBranch")
    UserResponseDto userToUserResponseDto(UserEntity user);

    @Named("mapStatus")
    default String mapStatus(StatusData status) {
        return status != null ? status.name() : null;
    }

    @Named("mapBranch")
    default UserResponseDto.BranchInfo mapBranch(Branch branch) {
        if (branch == null) return null;
        return new UserResponseDto.BranchInfo(branch.getId(), branch.getBranchCode(), branch.getBranchKh());
    }

    @Named("rolesToRoleString")
    default String rolesToRoleString(List<com.internal.feature.auth.models.Role> roles) {
        if (roles == null || roles.isEmpty()) {
            return null;
        }
        return roles.stream()
                .map(role -> role.getName().name())
                .collect(Collectors.joining(", "));
    }

    default List<UserResponseDto> usersToUserResponseDtos(List<UserEntity> users) {
        if (users == null) {
            return null;
        }
        return users.stream()
                .map(this::userToUserResponseDto)
                .collect(Collectors.toList());
    }
}
