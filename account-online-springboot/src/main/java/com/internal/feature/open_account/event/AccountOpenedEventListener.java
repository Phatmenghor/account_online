package com.internal.feature.open_account.event;

import com.internal.feature.customer_image.dto.response.CustomerImageUploadResponseDto;
import com.internal.feature.master_data.models.Branch;
import com.internal.feature.master_data.repository.BranchRepository;
import com.internal.feature.open_account.dto.request.OpenAccountContext;
import com.internal.feature.open_account.dto.request.CustomerRequest;
import com.internal.feature.open_account.dto.response.CustomerResponse;
import com.internal.feature.open_account.service.ReportingService;
import com.internal.feature.telegram_alerts.service.MonitoringService;
import com.internal.feature.open_account.mapper.MasterDataServiceHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class AccountOpenedEventListener {

    private final ReportingService reportingService;
    private final MonitoringService monitoringService;
    private final BranchRepository branchRepository;
    private final MasterDataServiceHelper masterDataServiceHelper;

    @EventListener
    @Transactional
    public void handleAccountOpenedEvent(AccountOpenedEvent event) {
        OpenAccountContext context = event.getContext();
        log.info("Processing post-opening events for Legal ID: {}", context.getRequest().getLegalId());

        // Step 10: Save customer images
        CustomerImageUploadResponseDto imagePaths = reportingService.safeSaveCustomerImages(context.getRequest());

        // Step 11: Save success log
        CustomerResponse accInfo = CustomerResponse.builder()
                .cif(context.getCif())
                .khrAccount(context.getKhrAccount())
                .usdAccount(context.getUsdAccount())
                .mnemonic(context.getMnemonic())
                .build();

        reportingService.safeSaveSuccessLog(
                context.getRequest(),
                accInfo,
                context.getAmlResult(),
                imagePaths,
                context.getMbActivationCode()
        );

        // Step 13: Notify monitoring channel
        safeSendAccountCreatedAlert(context);

        log.info("Post-opening events completed for Legal ID: {}", context.getRequest().getLegalId());
    }

    private void safeSendAccountCreatedAlert(OpenAccountContext context) {
        try {
            CustomerRequest request = context.getRequest();
            String fullName = !isBlank(request.getGivenName()) || !isBlank(request.getFamilyName())
                    ? joinNonBlank(request.getGivenName(), request.getFamilyName())
                    : joinNonBlank(request.getFirstNameKh(), request.getLastNameKh());

            String branchName = branchRepository.findByBranchCode(request.getBranchCode())
                    .map(Branch::getBranchKh)
                    .orElse(request.getBranchCode() != null ? request.getBranchCode() : "Main Branch");

            List<String> parts = new ArrayList<>();
            String villagePart = formatTelegramAddressPart(request.getCustomerVillageEn(), request.getCustomerVillageKh());
            if (!villagePart.isBlank()) parts.add(villagePart);

            String communePart = formatTelegramAddressPart(request.getCustomerCommuneEn(), request.getCustomerCommuneKh());
            if (!communePart.isBlank()) parts.add(communePart);

            String districtPart = formatTelegramAddressPart(request.getCustomerDistrictEn(), request.getCustomerDistrictKh());
            if (!districtPart.isBlank()) parts.add(districtPart);

            String provincePart = formatTelegramAddressPart(request.getCustomerProvinceEn(), request.getCustomerProvinceKh());
            if (!provincePart.isBlank()) parts.add(provincePart);

            String fullAddress = String.join(", ", parts);
            if (isBlank(fullAddress)) {
                fullAddress = request.getLegalAddress() != null ? request.getLegalAddress() : "";
            }

            log.info("Sending Telegram account created alert for Legal ID: {}", request.getLegalId());

            monitoringService.sendAccountCreatedAlert(
                    fullName,
                    fullAddress,
                    request.getLegalId(),
                    context.getCif(),
                    context.getUsdAccount(),
                    context.getKhrAccount(),
                    branchName
            );
        } catch (Exception e) {
            log.error("Failed to send account created Telegram alert for Legal ID: {}", context.getRequest().getLegalId(), e);
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String formatTelegramAddressPart(String en, String kh) {
        if (!isBlank(en) && !isBlank(kh)) {
            return en.trim() + " (" + kh.trim() + ")";
        }
        if (!isBlank(kh)) return kh.trim();
        if (!isBlank(en)) return en.trim();
        return "";
    }

    private String joinNonBlank(String a, String b) {
        StringBuilder sb = new StringBuilder();
        if (!isBlank(a)) sb.append(a.trim());
        if (!isBlank(b)) {
            if (!sb.isEmpty()) sb.append(" ");
            sb.append(b.trim());
        }
        return sb.toString();
    }
}








