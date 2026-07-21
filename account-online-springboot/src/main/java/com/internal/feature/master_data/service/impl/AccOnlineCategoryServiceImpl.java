package com.internal.feature.master_data.service.impl;

import com.internal.feature.master_data.dto.response.AccOnlineCategoryDto;
import com.internal.feature.master_data.models.AccOnlineCategory;
import com.internal.feature.master_data.repository.AccOnlineCategoryRepository;
import com.internal.feature.master_data.service.AccOnlineCategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccOnlineCategoryServiceImpl implements AccOnlineCategoryService {

    private final AccOnlineCategoryRepository repository;

    @Override
    public List<AccOnlineCategoryDto> getAll(String search) {
        return repository.findAllBySearch(search).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private AccOnlineCategoryDto toDto(AccOnlineCategory entity) {
        AccOnlineCategoryDto dto = new AccOnlineCategoryDto();
        dto.setId(entity.getId());
        dto.setCategory(entity.getCategory());
        dto.setLookupCode(entity.getLookupCode());
        dto.setLookupId(entity.getLookupId());
        dto.setLookupName(entity.getLookupName());
        dto.setLookupDesc(entity.getLookupDesc());
        return dto;
    }
}







