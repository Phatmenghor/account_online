package com.cambodiapostbank.accountonline.cpbank.domain.customer.service;

import com.cambodiapostbank.accountonline.cpbank.domain.customer.dto.CustomerRequestDto;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class CustomerServiceImpl implements CustomerService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddSSS");
    private final Log logger = LogFactory.getLog(CustomerServiceImpl.class);

    @Override
    public String createJsonRequestCustomerPost(CustomerRequestDto customerRequestDto) throws IOException {
        JSONObject jsonObject = new JSONObject();
        try {
            long randomFourDigitNumber = ThreadLocalRandom.current().nextLong(1000, 10000); // Generate a random 5-digit number
            LocalDateTime now = LocalDateTime.now();
            String dateString = now.format(DATE_FORMATTER);
            String requestNo = dateString + randomFourDigitNumber;

            logger.info("================================");
            System.out.println("requestNo: " + requestNo);
            logger.info("================================");

            jsonObject.put("rec_id", requestNo);
            jsonObject.put("family_name", customerRequestDto.getFamilyName().toUpperCase());
            jsonObject.put("given_name", customerRequestDto.getGivenName().toUpperCase());
            jsonObject.put("gender", customerRequestDto.getGender().toUpperCase());
            jsonObject.put("title", customerRequestDto.getGender().equalsIgnoreCase("Male") ? "MR" : "MS");
            jsonObject.put("fullname1", customerRequestDto.getFamilyName().toUpperCase() + " " + customerRequestDto.getGivenName().toUpperCase());
            jsonObject.put("fullname2", customerRequestDto.getFamilyName().toUpperCase() + " " + customerRequestDto.getGivenName().toUpperCase());
            jsonObject.put("short_name", customerRequestDto.getGivenName());
            jsonObject.put("customer_rate", "1");
            jsonObject.put("cost_center", "1000");
            jsonObject.put("nationality", "KH");
            jsonObject.put("nationality", "KH");
            jsonObject.put("customer_status", 1);
            jsonObject.put("residence", "KH");
            jsonObject.put("legal_iss_auth", customerRequestDto.getGivenName());
            jsonObject.put("legal_id", customerRequestDto.getLegalId());
            jsonObject.put("language", "2");
            jsonObject.put("occupation", customerRequestDto.getOccupation());
            jsonObject.put("sms", customerRequestDto.getContactNumber());

            if (customerRequestDto.getOccupation().equals("Self-Employed")) {
                customerRequestDto.setTarget("410");
            } else if (customerRequestDto.getOccupation().equals("Employee")) {
                customerRequestDto.setTarget("220");
            } else if (customerRequestDto.getOccupation().equals("Farmer")) {
                customerRequestDto.setTarget("310");
            } else if (customerRequestDto.getOccupation().equals("Student")) {
                customerRequestDto.setTarget("320");
            } else if (customerRequestDto.getOccupation().equals("Housewife")) {
                customerRequestDto.setTarget("320");
            } else if (customerRequestDto.getOccupation().equals("Retired")) {
                customerRequestDto.setTarget("320");
            } else {
                customerRequestDto.setTarget("100");
            }
            jsonObject.put("target", customerRequestDto.getTarget());

            // Date of Birth
            String inputDate = customerRequestDto.getDateOfBirth();
            DateFormat inputFormat = new SimpleDateFormat("dd/MM/yyyy");
            DateFormat outputFormat = new SimpleDateFormat("yyyyMMdd");

            try {
                Date date = inputFormat.parse(inputDate);
                String outputDate = outputFormat.format(date);
                jsonObject.put("date_of_birth", outputDate);
            } catch (ParseException e) {
                e.printStackTrace();
            }

            jsonObject.put("cust_province", customerRequestDto.getCustomerProvince());
            jsonObject.put("cust_district", customerRequestDto.getCustomerDistrict());
            jsonObject.put("cust_commune", customerRequestDto.getCustomerCommune());
            jsonObject.put("cust_village", customerRequestDto.getCustomerVillage());

            jsonObject.put("cust_pob_province", customerRequestDto.getCustomerPobProvince());
            jsonObject.put("cust_pob_district", customerRequestDto.getCustomerPobDistrict());
            jsonObject.put("cust_pob_commune", customerRequestDto.getCustomerPobCommune());
            jsonObject.put("cust_pob_village", customerRequestDto.getCustomerPobVillage());

            jsonObject.put("legal_holder_name", customerRequestDto.getLegalDocName());
            jsonObject.put("legal_doc_name", customerRequestDto.getLegalDocName());
            jsonObject.put("legal_issue_auth", customerRequestDto.getGivenName());
<<<<<<< HEAD

            // Issue Date
            String inputIssDate = customerRequestDto.getLegalIssueDate();
            DateFormat inputIssDateFormat = new SimpleDateFormat("dd/MM/yyyy");
            DateFormat outputIssDateFormat = new SimpleDateFormat("yyyyMMdd");

            try {
                Date date = inputIssDateFormat.parse(inputIssDate);
                String outputDate = outputIssDateFormat.format(date);
                jsonObject.put("legal_iss_date", outputDate);
            } catch (ParseException e) {
                e.printStackTrace();
            }

            // legal EXp Date
            String inputExpDate = customerRequestDto.getLegalExpDate();
            DateFormat inputExpDateFormat = new SimpleDateFormat("dd/MM/yyyy");
            DateFormat outputExpDateFormat = new SimpleDateFormat("yyyyMMdd");

            try {
                Date date = inputExpDateFormat.parse(inputExpDate);
                String outputDate = outputExpDateFormat.format(date);
                jsonObject.put("legal_exp_date", outputDate);
            } catch (ParseException e) {
                e.printStackTrace();
            }

=======
            jsonObject.put("legal_iss_date", "20211103");
            jsonObject.put("legal_exp_date", "20311102");
>>>>>>> customer_register_v1
            jsonObject.put("customer_type", "ACTIVE");
            jsonObject.put("ownership", "304");
            jsonObject.put("sector", "4501");
            jsonObject.put("industry", "4500");
            jsonObject.put("staff_code", customerRequestDto.getStaffCode());
            jsonObject.put("company", customerRequestDto.getCompany());
            jsonObject.put("branch_code", customerRequestDto.getBranchCode());
            jsonObject.put("marital_status", customerRequestDto.getMaritalStatus().toUpperCase());
            jsonObject.put("nid_image", customerRequestDto.getCustomerNidImage());
            jsonObject.put("selfie_image", customerRequestDto.getCustomerSelfieImage());
            jsonObject.put("otp_code", customerRequestDto.getOtpCode());
            jsonObject.put("loan_officer", "");
            jsonObject.put("staff", "");
            jsonObject.put("place_of_birth", customerRequestDto.getPlaceOfBirth());
            jsonObject.put("address", customerRequestDto.getAddress());
            jsonObject.put("firstNameKh", customerRequestDto.getFirstNameKh());
            jsonObject.put("lastNameKh", customerRequestDto.getLastNameKh());

        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return jsonObject.toString();
    }




    @Override
    public String createJsonRequestStaffPost(CustomerRequestDto customerRequestDto, HttpSession session) throws IOException {
        JSONObject jsonObject = new JSONObject();
        try {
            long randomFourDigitNumber = ThreadLocalRandom.current().nextLong(1000, 10000); // Generate a random 5-digit number
            LocalDateTime now = LocalDateTime.now();
            String dateString = now.format(DATE_FORMATTER);
            String requestNo = dateString + randomFourDigitNumber;

            logger.info("================================");
            System.out.println("requestNo: " + requestNo);
            logger.info("================================");

            jsonObject.put("rec_id", requestNo);
            jsonObject.put("family_name", customerRequestDto.getFamilyName().toUpperCase());
            jsonObject.put("given_name", customerRequestDto.getGivenName().toUpperCase());
            jsonObject.put("gender", customerRequestDto.getGender().toUpperCase());
            jsonObject.put("title", customerRequestDto.getGender().equalsIgnoreCase("Male") ? "MR" : "MS");
            jsonObject.put("fullname1", customerRequestDto.getFamilyName().toUpperCase() + " " + customerRequestDto.getGivenName().toUpperCase());
            jsonObject.put("fullname2", customerRequestDto.getFamilyName().toUpperCase() + " " + customerRequestDto.getGivenName().toUpperCase());
            jsonObject.put("short_name", customerRequestDto.getGivenName());
            jsonObject.put("customer_rate", customerRequestDto.getCustomerRate());
            jsonObject.put("cost_center", customerRequestDto.getCostCenter());
            jsonObject.put("nationality", customerRequestDto.getNationality().toUpperCase());
            jsonObject.put("customer_status", customerRequestDto.getCustomerStatus());
            jsonObject.put("customer_type", customerRequestDto.getCustomerType());
            jsonObject.put("residence", customerRequestDto.getResidence());
            jsonObject.put("legal_iss_auth", customerRequestDto.getGivenName());
            jsonObject.put("legal_id", customerRequestDto.getLegalId());
            jsonObject.put("language", customerRequestDto.getLanguage());
            jsonObject.put("occupation", customerRequestDto.getOccupation());
            jsonObject.put("sms", customerRequestDto.getContactNumber());
            jsonObject.put("target", customerRequestDto.getTarget());
            jsonObject.put("email", customerRequestDto.getEmail());
            jsonObject.put("product_account",customerRequestDto.getProductAccount());
            jsonObject.put("category_account",customerRequestDto.getCategoryAccount());

            // Date of Birth
            String inputDate = customerRequestDto.getDateOfBirth();
            DateFormat inputFormat = new SimpleDateFormat("dd/MM/yyyy");
            DateFormat outputFormat = new SimpleDateFormat("yyyyMMdd");

            try {
                Date date = inputFormat.parse(inputDate);
                String outputDate = outputFormat.format(date);
                jsonObject.put("date_of_birth", outputDate);
            } catch (ParseException e) {
                e.printStackTrace();
            }

            jsonObject.put("cust_province", customerRequestDto.getCustomerProvince());
            jsonObject.put("cust_district", customerRequestDto.getCustomerDistrict());
            jsonObject.put("cust_commune", customerRequestDto.getCustomerCommune());
            jsonObject.put("cust_village", customerRequestDto.getCustomerVillage());

            jsonObject.put("cust_pob_province", customerRequestDto.getCustomerPobProvince());
            jsonObject.put("cust_pob_district", customerRequestDto.getCustomerPobDistrict());
            jsonObject.put("cust_pob_commune", customerRequestDto.getCustomerPobCommune());
            jsonObject.put("cust_pob_village", customerRequestDto.getCustomerPobVillage());


            jsonObject.put("legal_holder_name", customerRequestDto.getLegalDocName());
            jsonObject.put("legal_doc_name", customerRequestDto.getLegalDocName());
            jsonObject.put("legal_issue_auth", customerRequestDto.getGivenName());

            // Issue Date
            String inputIssDate = customerRequestDto.getLegalIssueDate();
            DateFormat inputIssDateFormat = new SimpleDateFormat("dd/MM/yyyy");
            DateFormat outputIssDateFormat = new SimpleDateFormat("yyyyMMdd");

            try {
                Date date = inputIssDateFormat.parse(inputIssDate);
                String outputDate = outputIssDateFormat.format(date);
                jsonObject.put("legal_iss_date", outputDate);
            } catch (ParseException e) {
                e.printStackTrace();
            }

            // legal EXp Date
            String inputExpDate = customerRequestDto.getLegalExpDate();
            DateFormat inputExpDateFormat = new SimpleDateFormat("dd/MM/yyyy");
            DateFormat outputExpDateFormat = new SimpleDateFormat("yyyyMMdd");

            try {
                Date date = inputExpDateFormat.parse(inputExpDate);
                String outputDate = outputExpDateFormat.format(date);
                jsonObject.put("legal_exp_date", outputDate);
            } catch (ParseException e) {
                e.printStackTrace();
            }

            jsonObject.put("ownership", customerRequestDto.getOwnership());
            jsonObject.put("sector", customerRequestDto.getSector());
            jsonObject.put("industry", customerRequestDto.getIndustry());
            jsonObject.put("customer_type",customerRequestDto.getCustomerType().toUpperCase());
            jsonObject.put("customer_role",customerRequestDto.getCustomerRole());
            jsonObject.put("staff_code", customerRequestDto.getStaffCode());
            jsonObject.put("company", customerRequestDto.getCompany());
            jsonObject.put("branch_code", customerRequestDto.getBranchCode());
            jsonObject.put("marital_status", customerRequestDto.getMaritalStatus().toUpperCase());
            jsonObject.put("nid_image", customerRequestDto.getCustomerNidImage());
            jsonObject.put("selfie_image", customerRequestDto.getCustomerSelfieImage());
            jsonObject.put("otp_code", customerRequestDto.getOtpCode());
            jsonObject.put("loan_officer", customerRequestDto.getLoanOfficer());
            jsonObject.put("staff", "");
            jsonObject.put("place_of_birth", customerRequestDto.getPlaceOfBirth());
            jsonObject.put("address", customerRequestDto.getAddress());
            String IsLoginCode = (String) session.getAttribute("IsLoginCode");
            String value = IsLoginCode != null ? IsLoginCode : "";
            jsonObject.put("relation_manager", value);
            jsonObject.put("firstNameKh", customerRequestDto.getFirstNameKh());
            jsonObject.put("lastNameKh", customerRequestDto.getLastNameKh());

        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return jsonObject.toString();
    }
}