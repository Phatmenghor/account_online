package com.internal.feature.open_account.models;

import com.internal.config.entity.BaseEntity;
import com.internal.enumation.AccountOpeningRequestStatusEnum;
import com.internal.enumation.AmlStatusEnum;
import com.internal.feature.open_account.dto.request.CustomerRequest;
import lombok.*;

import javax.persistence.*;
import java.util.Map;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "acc_online_pending_account_opening", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"legalId", "status"}, name = "uk_legal_id_pending_status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingAccountOpeningRequest extends BaseEntity {

    @Column(nullable = false, length = 50)
    private String legalId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountOpeningRequestStatusEnum status;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String requestData;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String customerInfo;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String amlResultData;

    @Enumerated(EnumType.STRING)
    private AmlStatusEnum amlStatus;

    @Column(name = "remark", columnDefinition = "TEXT")
    private String remark;
}
