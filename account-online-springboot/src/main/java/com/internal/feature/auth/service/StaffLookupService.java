package com.internal.feature.auth.service;

import com.internal.feature.auth.dto.response.StaffResponseDto;
import com.internal.feature.auth.repository.StaffInfoRepository;
import com.internal.exceptions.error.custom.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StaffLookupService {

    private final StaffInfoRepository staffInfoRepository;

    public StaffResponseDto findByIdCard(String idCard) {
        return staffInfoRepository.findByIdCard(idCard)
                .orElseThrow(() -> new NotFoundException(
                        "No staff record was found for ID Card \"" + idCard + "\". "
                        + "Please double-check the ID card number and try again."));
    }
}
