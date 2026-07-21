package com.internal.feature.master_data.models;

import com.internal.config.entity.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Entity
@Table(name = "acc_online_category")
@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccOnlineCategory extends BaseEntity {

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "lookup_code", length = 100)
    private String lookupCode;

    @Column(name = "lookup_id", length = 20)
    private String lookupId;

    @Column(name = "lookup_name", length = 200)
    private String lookupName;

    @Column(name = "lookup_desc", length = 200)
    private String lookupDesc;
}


