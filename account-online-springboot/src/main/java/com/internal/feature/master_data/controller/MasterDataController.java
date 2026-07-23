package com.internal.feature.master_data.controller;

import com.internal.shared.response.ApiResponse;
import com.internal.feature.master_data.dto.request.AddressRequestDto;
import com.internal.feature.master_data.dto.request.AllMasterDataRequest;
import com.internal.feature.master_data.dto.request.PublicReferenceRequest;
import com.internal.feature.master_data.dto.response.*;
import com.internal.feature.master_data.service.*;
import com.internal.shared.constant.ResponseMessage;
import com.internal.shared.pagination.PaginationResponse;
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
            @RequestBody AddressRequestDto address) {

        LocationCodesDto response = masterDataService.initAddress(address);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.ADDRESS_INIT, response));
    }

    @PostMapping("/init/place-of-birth")
    public ResponseEntity<ApiResponse<LocationCodesDto>> initPob(
            @RequestBody AddressRequestDto address) {

        LocationCodesDto response = masterDataService.initPob(address);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.POB_INIT, response));
    }

    @PostMapping("/province")
    public ResponseEntity<ApiResponse<PaginationResponse<ClsProvinceDto>>> getProvinces(
            @RequestBody AllMasterDataRequest request) {

        PaginationResponse<ClsProvinceDto> response = masterDataService.getProvince(request);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.PROVINCES_RETRIEVED, response));
    }

    @PostMapping("/district/{provinceCode}")
    public ResponseEntity<ApiResponse<PaginationResponse<ClsDistrictDto>>> getDistricts(
            @PathVariable String provinceCode,
            @RequestBody AllMasterDataRequest request) {

        PaginationResponse<ClsDistrictDto> response = masterDataService.getDistrict(request, provinceCode);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.DISTRICTS_RETRIEVED, response));
    }

    @PostMapping("/commune/{districtCode}")
    public ResponseEntity<ApiResponse<PaginationResponse<ClsCommuneDto>>> getCommunes(
            @PathVariable String districtCode,
            @RequestBody AllMasterDataRequest request) {

        PaginationResponse<ClsCommuneDto> response = masterDataService.getCommune(request, districtCode);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.COMMUNES_RETRIEVED, response));
    }

    @PostMapping("/village/{communeCode}")
    public ResponseEntity<ApiResponse<PaginationResponse<ClsVillageDto>>> getVillages(
            @PathVariable String communeCode,
            @RequestBody AllMasterDataRequest request) {

        PaginationResponse<ClsVillageDto> response = masterDataService.getVillage(request, communeCode);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.VILLAGES_RETRIEVED, response));
    }

    @PostMapping("/branch")
    public ResponseEntity<ApiResponse<PaginationResponse<ClsBranchDto>>> getBranches(
            @RequestBody AllMasterDataRequest request) {

        PaginationResponse<ClsBranchDto> response = masterDataService.getBranch(request);
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.BRANCHES_RETRIEVED, response));
    }

    @PostMapping("/occupation/all")
    public ResponseEntity<ApiResponse<List<OccupationDto>>> getAllOccupations(@RequestBody PublicReferenceRequest request) {
        log.info("API: Public request - Fetch all occupations");
        List<OccupationDto> list = occupationService.getAllOccupationsPublic(request.getSearch());
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.retrieved(ResponseMessage.ALL_OCCUPATIONS), list));
    }

    @PostMapping("/marital-status/all")
    public ResponseEntity<ApiResponse<List<MaritalStatusDto>>> getAllMaritalStatus(@RequestBody PublicReferenceRequest request) {
        log.info("API: Public request - Fetch all marital statuses");
        List<MaritalStatusDto> list = maritalStatusService.getAllPublic(request.getSearch());
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.retrieved(ResponseMessage.ALL_MARITAL_STATUSES), list));
    }

    @PostMapping("/bank/all")
    public ResponseEntity<ApiResponse<List<ReferenceDto>>> getAllReferences(@RequestBody PublicReferenceRequest request) {
        log.info("API: Public request - Fetch all banks");
        List<ReferenceDto> list = referenceService.getAllPublic(request.getSearch());
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.retrieved(ResponseMessage.ALL_BANKS), list));
    }

    @PostMapping("/legal-type/all")
    public ResponseEntity<ApiResponse<List<LegalTypeDto>>> getAllLegalTypes(@RequestBody PublicReferenceRequest request) {
        log.info("API: Public request - Fetch all legal types");
        List<LegalTypeDto> list = legalTypeService.getAllLegalTypePublic(request.getSearch());
        return ResponseEntity.ok(ApiResponse.success(ResponseMessage.retrieved(ResponseMessage.ALL_LEGAL_TYPES), list));
    }

    @PostMapping("/acc-online-category/all")
    public ResponseEntity<ApiResponse<List<AccOnlineCategoryDto>>> getAllAccOnlineCategories(@RequestBody PublicReferenceRequest request) {
        log.info("API: Public request - Fetch all categories");
        List<AccOnlineCategoryDto> list = accOnlineCategoryService.getAll(request.getSearch());
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully.", list));
    }
}






