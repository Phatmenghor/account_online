package com.internal.feature.master_data.controller;

import com.internal.shared.response.ApiResponse;
import com.internal.feature.master_data.dto.request.AddressRequestDto;
import com.internal.feature.master_data.dto.request.AllMasterDataRequest;
import com.internal.feature.master_data.dto.request.PublicReferenceRequest;
import com.internal.feature.master_data.dto.response.AccOnlineCategoryDto;
import com.internal.feature.master_data.dto.response.ClsBranchDto;
import com.internal.feature.master_data.dto.response.ClsCommuneDto;
import com.internal.feature.master_data.dto.response.ClsDistrictDto;
import com.internal.feature.master_data.dto.response.ClsProvinceDto;
import com.internal.feature.master_data.dto.response.ClsVillageDto;
import com.internal.feature.master_data.dto.response.LegalTypeDto;
import com.internal.feature.master_data.dto.response.LocationCodesDto;
import com.internal.feature.master_data.dto.response.MaritalStatusDto;
import com.internal.feature.master_data.dto.response.OccupationDto;
import com.internal.feature.master_data.dto.response.ReferenceDto;
import com.internal.feature.master_data.service.AccOnlineCategoryService;
import com.internal.feature.master_data.service.LegalTypeService;
import com.internal.feature.master_data.service.MaritalStatusService;
import com.internal.feature.master_data.service.MasterDataService;
import com.internal.feature.master_data.service.OccupationService;
import com.internal.feature.master_data.service.ReferenceService;
import com.internal.shared.constant.ResponseMessage;
import com.internal.shared.pagination.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/master-data")
@RequiredArgsConstructor
@Slf4j
public class MasterDataController {

    private final MasterDataService masterDataService;
    private final OccupationService occupationService;
    private final MaritalStatusService maritalStatusService;
    private final ReferenceService referenceService;
    private final LegalTypeService legalTypeService;
    private final AccOnlineCategoryService accOnlineCategoryService;

    @PostMapping("/init/address")
    public ResponseEntity<ApiResponse<LocationCodesDto>> initAddress(
            @Valid @RequestBody AddressRequestDto address) {
        LocationCodesDto response = masterDataService.initAddress(address);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.ADDRESS_INIT, response));
    }

    @PostMapping("/init/place-of-birth")
    public ResponseEntity<ApiResponse<LocationCodesDto>> initPob(
            @Valid @RequestBody AddressRequestDto address) {
        LocationCodesDto response = masterDataService.initPob(address);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.POB_INIT, response));
    }

    @PostMapping("/province")
    public ResponseEntity<ApiResponse<PaginationResponse<ClsProvinceDto>>> getProvinces(
            @Valid @RequestBody AllMasterDataRequest request) {
        PaginationResponse<ClsProvinceDto> response = masterDataService.getProvince(request);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.PROVINCES_RETRIEVED, response));
    }

    @PostMapping("/district/{provinceCode}")
    public ResponseEntity<ApiResponse<PaginationResponse<ClsDistrictDto>>> getDistricts(
            @PathVariable String provinceCode,
            @Valid @RequestBody AllMasterDataRequest request) {
        PaginationResponse<ClsDistrictDto> response = masterDataService.getDistrict(request, provinceCode);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.DISTRICTS_RETRIEVED, response));
    }

    @PostMapping("/commune/{districtCode}")
    public ResponseEntity<ApiResponse<PaginationResponse<ClsCommuneDto>>> getCommunes(
            @PathVariable String districtCode,
            @Valid @RequestBody AllMasterDataRequest request) {
        PaginationResponse<ClsCommuneDto> response = masterDataService.getCommune(request, districtCode);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.COMMUNES_RETRIEVED, response));
    }

    @PostMapping("/village/{communeCode}")
    public ResponseEntity<ApiResponse<PaginationResponse<ClsVillageDto>>> getVillages(
            @PathVariable String communeCode,
            @Valid @RequestBody AllMasterDataRequest request) {
        PaginationResponse<ClsVillageDto> response = masterDataService.getVillage(request, communeCode);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.VILLAGES_RETRIEVED, response));
    }

    @PostMapping("/branch")
    public ResponseEntity<ApiResponse<PaginationResponse<ClsBranchDto>>> getBranches(
            @Valid @RequestBody AllMasterDataRequest request) {
        PaginationResponse<ClsBranchDto> response = masterDataService.getBranch(request);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.BRANCHES_RETRIEVED, response));
    }

    @PostMapping("/occupation/all")
    public ResponseEntity<ApiResponse<List<OccupationDto>>> getAllOccupations(@Valid @RequestBody PublicReferenceRequest request) {
        log.info("API: Public request - Fetch all occupations");
        List<OccupationDto> list = occupationService.getAllOccupationsPublic(request.getSearch());
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.retrieved(ResponseMessage.ALL_OCCUPATIONS), list));
    }

    @PostMapping("/marital-status/all")
    public ResponseEntity<ApiResponse<List<MaritalStatusDto>>> getAllMaritalStatus(@Valid @RequestBody(required = false) PublicReferenceRequest request) {
        String searchTerm = request != null ? request.getSearch() : null;
        log.info("API: Public request - Fetch all marital statuses | Search: {}", searchTerm);
        List<MaritalStatusDto> list = maritalStatusService.getAllPublic(searchTerm);
        log.info("API: Public request - Fetch all marital statuses completed | Items count: {}", list != null ? list.size() : 0);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.retrieved(ResponseMessage.ALL_MARITAL_STATUSES), list));
    }

    @PostMapping("/bank/all")
    public ResponseEntity<ApiResponse<List<ReferenceDto>>> getAllReferences(@Valid @RequestBody PublicReferenceRequest request) {
        log.info("API: Public request - Fetch all banks");
        List<ReferenceDto> list = referenceService.getAllPublic(request.getSearch());
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.retrieved(ResponseMessage.ALL_BANKS), list));
    }

    @PostMapping("/legal-type/all")
    public ResponseEntity<ApiResponse<List<LegalTypeDto>>> getAllLegalTypes(@Valid @RequestBody PublicReferenceRequest request) {
        log.info("API: Public request - Fetch all legal types");
        List<LegalTypeDto> list = legalTypeService.getAllLegalTypePublic(request.getSearch());
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.retrieved(ResponseMessage.ALL_LEGAL_TYPES), list));
    }

    @PostMapping("/acc-online-category/all")
    public ResponseEntity<ApiResponse<List<AccOnlineCategoryDto>>> getAllAccOnlineCategories(@Valid @RequestBody PublicReferenceRequest request) {
        log.info("API: Public request - Fetch all categories");
        List<AccOnlineCategoryDto> list = accOnlineCategoryService.getAll(request.getSearch());
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully.", list));
    }
}
