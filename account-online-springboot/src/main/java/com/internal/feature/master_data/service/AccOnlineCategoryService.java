package com.internal.feature.master_data.service;

import com.internal.feature.master_data.dto.response.AccOnlineCategoryDto;

import java.util.List;

public interface AccOnlineCategoryService {
    List<AccOnlineCategoryDto> getAll(String search);
}
