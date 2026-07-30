package com.internal.feature.aml.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.internal.feature.aml.dto.request.AllAmlHistoryRequestDto;
import com.internal.feature.aml.dto.request.UpdateAmlStatusDto;
import com.internal.feature.aml.models.JuniorAmlHistory;
import com.internal.feature.aml.models.JuniorAmlStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface JuniorAmlService {

    Page<JuniorAmlStatus> getAllJuniorAmlStatus(String status, String search, Pageable pageable);

    Page<JuniorAmlStatus> getAllJuniorAmlHistory(String search, Pageable pageable);

    JuniorAmlStatus updateJuniorAmlStatus(Long id, UpdateAmlStatusDto request) throws JsonProcessingException;

    Page<JuniorAmlHistory> getJuniorAmlHistoryByStatusId(Long juniorAmlStatusId, AllAmlHistoryRequestDto request);

    JuniorAmlHistory getJuniorAmlHistoryById(Long historyId);
}
