package com.cambodiapostbank.accountonline.cpbank.domain.branch.service;

import com.cambodiapostbank.accountonline.cpbank.domain.branch.dto.BranchResponseDto;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.List;

public interface BranchService {
    List<BranchResponseDto> getBranches() throws URISyntaxException, IOException, InterruptedException;
}
