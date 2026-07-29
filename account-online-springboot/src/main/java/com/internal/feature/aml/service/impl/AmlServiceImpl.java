package com.internal.feature.aml.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.internal.enumation.AmlStatusEnum;
import com.internal.feature.aml.dto.request.AllAmlHistoryRequestDto;
import com.internal.feature.aml.dto.request.AllAmlRequestDto;
import com.internal.feature.aml.dto.request.CreateAmlRequestDto;
import com.internal.feature.aml.dto.request.UpdateAmlStatusDto;
import com.internal.feature.aml.dto.response.AllAmlHistoryResponseDto;
import com.internal.feature.aml.dto.response.AllAmlResponseDto;
import com.internal.feature.aml.dto.response.AmlHistoryDto;
import com.internal.feature.aml.dto.response.AmlStatusDto;
import com.internal.feature.aml.event.AmlStatusChangedEvent;
import com.internal.feature.aml.mapper.AmlHistoryMapper;
import com.internal.feature.aml.mapper.AmlStatusMapper;
import com.internal.feature.aml.models.AmlHistory;
import com.internal.feature.aml.models.AmlStatus;
import com.internal.feature.aml.repository.AmlHistoryRepository;
import com.internal.feature.aml.repository.AmlStatusRepository;
import com.internal.feature.aml.service.AmlService;
import com.internal.feature.auth.models.UserEntity;
import com.internal.feature.master_data.dto.response.LocationCodesDto;
import com.internal.feature.open_account.mapper.MasterDataServiceHelper;
import com.internal.shared.component.AuditComponent;
import com.internal.shared.constant.AppConstants;
import com.internal.shared.exception.custom.NotFoundException;
import com.internal.shared.pagination.PaginationUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AmlServiceImpl implements AmlService {

    private final AmlStatusRepository amlStatusRepository;
    private final AmlHistoryRepository amlHistoryRepository;
    private final AmlStatusMapper amlStatusMapper;
    private final AmlHistoryMapper amlHistoryMapper;
    private final AuditComponent auditComponent;
    private final ApplicationEventPublisher eventPublisher;
    private final MasterDataServiceHelper masterDataServiceHelper;

    @Override
    public Optional<AmlStatus> findByLegalId(String legalId) {
        return amlStatusRepository.findByLegalId(legalId);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public AmlStatus createAmlStatus(CreateAmlRequestDto requestDto) throws JsonProcessingException {
        Optional<AmlStatus> existingOpt = amlStatusRepository.findByLegalId(requestDto.getLegalId());

        AmlStatus status;
        if (existingOpt.isPresent()) {
            log.info("AML status already exists for legalId: {}, updating existing record to PENDING", requestDto.getLegalId());
            status = existingOpt.get();
            amlStatusMapper.updateFromCreateDto(requestDto, status);
            status.setApprovedBy(null);
            status.setRejectedBy(null);
        } else {
            log.info("Creating new AML status for legalId: {}", requestDto.getLegalId());
            status = amlStatusMapper.fromCreateDto(requestDto);
            status.setRejectedBy(null);
        }

        populateAddressFields(status, requestDto);

        status = amlStatusRepository.save(status);

        AmlHistory history = amlHistoryMapper.createHistoryFromStatusChange(status, null);
        amlHistoryRepository.save(history);

        return status;
    }

    @Override
    @Transactional
    public AmlStatusDto updateAmlStatus(Long id, UpdateAmlStatusDto req) {
        log.info("Updating AML status with id: {} to status: {}", id, req.getStatus());
        UserEntity currentUser = auditComponent.getCurrentUser();

        AmlStatus status = amlStatusRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("AML Status not found with id: " + id));

        updateStatusByEnum(status, req.getStatus(), currentUser);

        if (req.getRemark() != null) {
            status.setRemarks(req.getRemark());
        }

        status = amlStatusRepository.save(status);
        AmlHistory history = amlHistoryMapper.createHistoryFromStatusChange(status, currentUser);
        amlHistoryRepository.save(history);

        AmlStatusDto amlDto = amlStatusMapper.toStatusDto(status);
        eventPublisher.publishEvent(new AmlStatusChangedEvent(this, amlDto));

        return amlDto;
    }

    @Override
    public AllAmlResponseDto getAllAml(AllAmlRequestDto request) {
        log.info("Fetching all AML statuses with status: {} and search: {}", request.getAmlStatus(), request.getSearch());
        Pageable pageable = PaginationUtil.createPageable(request);

        AmlStatusEnum statusFilter = request.getAmlStatus();
        String statusStr = request.getAmlStatusString();
        if (statusFilter == null && statusStr != null) {
            try {
                statusFilter = AmlStatusEnum.valueOf(statusStr.toUpperCase());
            } catch (Exception ignored) {}
        }
        if (statusFilter == null) {
            statusFilter = AmlStatusEnum.PENDING;
        }

        Page<AmlStatus> page = amlStatusRepository.findByStatusAndSearch(statusFilter, request.getSearch(), pageable);

        List<AmlStatusDto> content = page.stream()
                .map(amlStatusMapper::toStatusDto)
                .collect(Collectors.toList());

        log.info("Found {} AML statuses", page.getTotalElements());
        return amlStatusMapper.mapToListDto(content, page);
    }

    @Override
    public AmlStatusDto getAmlById(Long id) {
        AmlStatus aml = amlStatusRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("AML status not found with Id: " + id));
        return amlStatusMapper.toStatusDto(aml);
    }

    @Override
    public AmlHistoryDto getAmlHistoryById(Long id) {
        AmlHistory aml = amlHistoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("AML history not found with Id: " + id));
        return amlHistoryMapper.toDto(aml);
    }

    @Override
    public AllAmlHistoryResponseDto getAllAmlHistory(AllAmlHistoryRequestDto request) {
        log.info("Fetching AML history with status: {}, search: {}, startDate: {}, endDate: {}",
                request.getAmlStatus(), request.getSearch(), request.getStartDate(), request.getEndDate());

        Pageable pageable = PaginationUtil.createPageable(request);
        LocalDateTime fromDateTime = request.getStartDate() != null ? request.getStartDate().atStartOfDay() : null;
        LocalDateTime toDateTime = request.getEndDate() != null ? request.getEndDate().atTime(23, 59, 59) : null;

        Page<AmlHistory> page = amlHistoryRepository.findByStatusAndSearch(
                request.getAmlStatus(), request.getSearch(), fromDateTime, toDateTime, pageable);

        List<AmlHistoryDto> content = page.stream()
                .map(amlHistoryMapper::toDto)
                .collect(Collectors.toList());

        log.info("Found {} AML history records", page.getTotalElements());
        return amlHistoryMapper.mapToListDto(content, page);
    }

    private void populateAddressFields(AmlStatus status, CreateAmlRequestDto requestDto) {
        if (requestDto.getCustomerCurrentProvince() != null && !requestDto.getCustomerCurrentProvince().isEmpty()) {
            LocationCodesDto currentAddress = masterDataServiceHelper.resolveCurrentAddress(requestDto);
            status.setCurrentAddressName(masterDataServiceHelper.buildFullAddressName(currentAddress));
            status.setCurrentAddressCode(masterDataServiceHelper.buildFullAddressCode(currentAddress));
        }

        if (requestDto.getCustomerPobProvince() != null && !requestDto.getCustomerPobProvince().isEmpty()) {
            LocationCodesDto pobAddress = masterDataServiceHelper.resolvePlaceOfBirth(requestDto);
            status.setPlaceOfBirthName(masterDataServiceHelper.buildFullAddressName(pobAddress));
            status.setPlaceOfBirthCode(masterDataServiceHelper.buildFullAddressCode(pobAddress));
        }
    }

    private void updateStatusByEnum(AmlStatus status, AmlStatusEnum newStatus, UserEntity user) {
        status.setStatus(newStatus);
        switch (newStatus) {
            case APPROVE:
                status.setApprovedBy(user);
                status.setRejectedBy(null);
                break;
            case REJECT:
                status.setRejectedBy(user);
                status.setApprovedBy(null);
                break;
            default:
                status.setApprovedBy(null);
                status.setRejectedBy(null);
                break;
        }
    }
}
