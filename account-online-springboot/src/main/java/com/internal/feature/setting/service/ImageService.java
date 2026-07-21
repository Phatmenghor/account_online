package com.internal.feature.setting.service;

import com.internal.feature.setting.dto.request.ImageDto;
import com.internal.feature.setting.dto.response.ImageResponse;
import com.internal.feature.setting.dto.request.ImageUploadRequest;

import java.util.UUID;

public interface ImageService {

    ImageDto uploadImage(ImageUploadRequest request);

    ImageResponse getImageById(UUID id);

    void deleteImage(UUID id);
}


