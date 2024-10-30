package com.cambodiapostbank.accountonline.cpbank.domain.branch.service;

import com.cambodiapostbank.accountonline.cpbank.domain.branch.dto.BranchResponseDto;
import com.cambodiapostbank.accountonline.cpbank.utils.http.CpbHttpClient;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BranchServiceImpl implements BranchService {
    private final ObjectMapper objectMapper;
    private final CpbHttpClient httpClient;


    @Override
    public List<BranchResponseDto> getBranches() throws IOException {
        HttpURLConnection httpResponse = httpClient.get("api/GET_BRANCH_KH");
        if (httpResponse.getResponseCode() == HttpURLConnection.HTTP_OK) {
           // BufferedReader in = new BufferedReader(new InputStreamReader(httpResponse.getInputStream()));
            BufferedReader in = new BufferedReader(new InputStreamReader(httpResponse.getInputStream(), "UTF-8"));
            String inputLine;
            StringBuilder response = new StringBuilder();
            while ((inputLine = in.readLine()) != null) {
                response.append(inputLine);
            }
            in.close();
            return objectMapper.readValue(response.toString(), new TypeReference<List<BranchResponseDto>>() {
            });
        }
        return null;
    }
}





