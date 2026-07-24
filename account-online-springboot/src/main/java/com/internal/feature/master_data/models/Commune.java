package com.internal.feature.master_data.models;

import com.internal.config.entity.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;

@Entity
@Table(name = "location_commune_cbc")
@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Commune extends BaseEntity {

    @Column(name = "commune_code", nullable = false, length = 50)
    private String communeCode;

    @Column(name = "commune_en", length = 255)
    private String communeEn;

    @Column(name = "commune_kh", length = 255)
    private String communeKh;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "district_id")
    private District district;
}


