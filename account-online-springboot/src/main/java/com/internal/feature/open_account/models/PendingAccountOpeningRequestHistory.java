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
import java.time.LocalDate;

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

    // === LEGAL / NID INFO (same as main table for audit trail) ===
    @Column(name = "legal_doc_name")
    private String legalDocName;

    @Column(name = "legal_holder_name")
    private String legalHolderName;

    @Column(name = "legal_first_name_en")
    private String legalFirstNameEn;

    @Column(name = "legal_last_name_en")
    private String legalLastNameEn;

    @Column(name = "legal_first_name_kh")
    private String legalFirstNameKh;

    @Column(name = "legal_last_name_kh")
    private String legalLastNameKh;

    @Column(name = "legal_date_of_birth")
    private LocalDate legalDateOfBirth;

    @Column(name = "legal_gender")
    private String legalGender;

    @Column(name = "legal_address")
    private String legalAddress;

    @Column(name = "legal_place_of_birth")
    private String legalPlaceOfBirth;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "branch_code")
    private String branchCode;

    @Column(name = "occupation")
    private String occupation;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "email")
    private String email;

    @Column(name = "marital_status")
    private String maritalStatus;

    @Column(name = "nationality")
    private String nationality;

    @Column(name = "aml_status")
    private String amlStatus;

    // === IMAGE FILES ===
    @Column(name = "nid_image_name")
    private String nidImageName;

    @Column(name = "selfie_image_name")
    private String selfieImageName;
}
