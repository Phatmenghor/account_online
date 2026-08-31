package com.internal.feature.master_data.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProvinceRequestDto {
    private String provinceCode;
    private String provinceEn;
    private String provinceKh;
}

