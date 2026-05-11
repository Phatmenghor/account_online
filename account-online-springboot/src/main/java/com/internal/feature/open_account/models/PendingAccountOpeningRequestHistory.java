package com.internal.feature.open_account.models;

import com.internal.config.entity.BaseEntity;
import com.internal.enumation.AccountOpeningRequestStatusEnum;
import com.internal.feature.auth.models.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "acc_online_pending_account_opening_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingAccountOpeningRequestHistory extends BaseEntity {

    @Column(name = "request_id", nullable = false)
    private Long requestId;

    @Column(name = "legal_id", nullable = false, length = 50)
    private String legalId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountOpeningRequestStatusEnum status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "action_by")
    private UserEntity actionBy;

    @Column(name = "action_username", length = 255)
    private String actionUsername;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String requestData;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String customerInfo;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String amlResultData;

    @Column(name = "remark", columnDefinition = "TEXT")
    private String remark;
}
