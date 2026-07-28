package com.internal.feature.customer_image.service;

import com.internal.feature.customer_image.dto.response.CustomerImageFileDto;
import com.internal.feature.customer_image.dto.response.CustomerImageUploadResponseDto;
import com.internal.feature.open_account.dto.request.CustomerFileUploadRequestDto;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.Optional;

public interface CustomerImageService {

    CustomerImageUploadResponseDto saveCustomerImages(CustomerFileUploadRequestDto request);

    String saveUploadedFile(MultipartFile file, String filename) throws Exception;

    String saveBase64File(String base64, String filename, String type) throws Exception;

    Resource getNidImageResourceForEmail(String customerId);

    byte[] getNidImageBytes(String customerId);

    Resource getSelfieImageResourceForEmail(String customerId);

    byte[] getSelfieImageBytes(String customerId);

    boolean nidImageExists(String customerId);

    boolean selfieImageExists(String customerId);

    Optional<Path> findFileByName(String subFolder, String filename);

    Optional<CustomerImageFileDto> getCustomerImageFile(String filename);
}
