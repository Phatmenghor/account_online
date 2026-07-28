package com.internal.shared.constant;

public final class AppConstants {

        // ==================================================================================
        // 0. BANK DEFAULTS & SOAP NAMESPACES (CONSOLIDATED)
        // ==================================================================================
        public static final String MALE = "MALE";
        public static final String FEMALE = "FEMALE";
        public static final String MR = "MR";
        public static final String MS = "MS";

        public static final String DEFAULT_BRANCH_CODE = "KH0012011";
        public static final String DEFAULT_SECTOR = "4501";
        public static final String JUNIOR_SECTOR = "6012";
        public static final String JUNIOR_PRODUCT = "SAVE.JUNIOR.SAVING";
        public static final String DEFAULT_COST_CENTER = "1000";
        public static final String DEFAULT_INDUSTRY = "4500";
        public static final String DEFAULT_TARGET = "220";
        public static final String DEFAULT_LANGUAGE = "2";
        public static final String DEFAULT_CUSTOMER_RATING = "1";
        public static final String DEFAULT_CUSTOMER_STATUS = "1";
        public static final String DEFAULT_CUSTOMER_TYPE = "ACTIVE";
        public static final String DEFAULT_OWNERSHIP = "304";
        public static final String DEFAULT_LEGAL_HOLDER_NAME = "NATIONAL.ID";
        public static final String DEFAULT_NATIONALITY = "KH";

        // Namespace URIs
        public static final String SOAP_ENV_NS = "http://schemas.xmlsoap.org/soap/envelope/";
        public static final String OAOW_NS = "http://temenos.com/OAOWAR";
        public static final String CUSTOMER_NS = "http://temenos.com/CUSTOMERCPBCREATEOAO";
        public static final String ACCOUNT_NS = "http://temenos.com/AAARRANGEMENTACTIVITYAANEWOAO";

        // Product and activity constants
        public static final String NEW_ARRANGEMENT = "NEW";
        public static final String ACCOUNT_ACTIVITY = "ACCOUNTS-NEW-ARRANGEMENT";
        public static final String PRODUCT_CODE = "SAVE.ACCT.ONLINE";

        // ==================================================================================
        // 1. ENVIRONMENT & CONFIGURATION
        // Used in: OtpGenerator, etc.
        // ==================================================================================
        // Risk Levels
        public static final String RISK_HIGH = "High";
        public static final String RISK_LOW = "Low";

        // Currency
        public static final String CURRENCY_KHR = "KHR";
        public static final String CURRENCY_USD = "USD";

        // OTP
        public static final String DEFAULT_DEV_OTP = "123456";
        public static final int DEFAULT_OTP_LENGTH = 6;
        public static final int MAX_ATTEMPTS = 3;
        public static final int LOCKOUT_MINUTES = 5;

        // ==================================================================================
        // 2. SUPPORT CONTACT INFORMATION
        // Used in: Various services to append support info
        // ==================================================================================
        public static final String SUPPORT_PHONE_PRIMARY = "070 200 002";
        public static final String SUPPORT_PHONE_SECONDARY = "1800 200 888";
        public static final String SUPPORT_CONTACT = "មានបញ្ហាបច្ចេកទេស។ សូមទំនាក់ទំនងសេវាបម្រើអតិថិជនតាមរយៈលេខ "
                        + SUPPORT_PHONE_PRIMARY + " ឬ " + SUPPORT_PHONE_SECONDARY + " ដើម្បីទទួលបានជំនួយបន្ថែម។";

        // ==================================================================================
        // 3. NID VALIDATION ERRORS (Generic)
        // Used in: CamdxServiceImp, internal validations
        // ==================================================================================
        public static final String NID_ERROR_SYSTEM = "មានបញ្ហាបច្ចេកទេស។ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ ឬទំនាក់ទំនងសេវាបម្រើអតិថិជន។";

        // ==================================================================================
        // 4. CAMDX SPECIFIC ERRORS (MSG_*)
        // Used in: CamdxServiceImp
        // ==================================================================================
        public static final String MSG_400 = "អត្តសញ្ញាណប័ណ្ណរបស់អ្នកមិនអាចរកឃើញក្នុងប្រពន្ធ័ Ministry of Interior (MOI) បានទេ។ សូមទំនាក់ទំនងសេវាបម្រើអតិថិជនតាមរយៈលេខ 070 200 002 ឬ 1800 200 888 ដើម្បីទទួលបានជំនួយបន្ថែម។";
        public static final String MSG_420 = "ការស្នើសុំលើសចំនួនកំណត់។ សូមទាក់ទងក្រុមបច្ចេកទេសដើម្បីទទួលបានជំនួយ។";
        public static final String MSG_500 = "រកមិនឃើញមុខនៅក្នុងរូបថតរបស់អ្នកទេ។ សូមថតរូបអោយច្បាស់ហើយព្យាយាមម្តងទៀត។";
        public static final String MSG_501 = "មិនអាចចាប់យកផ្ទៃមុខនៅលើអត្តសញ្ញាណប័ណ្ណបានទេ។ សូមបញ្ចូលរូបភាពអត្តសញ្ញាណប័ណ្ណរបស់អ្នកអោយបានច្បាស់។";
        public static final String MSG_502 = "មានបញ្ហាបច្ចេកទេស។ សូមពិនិត្យមើលអត្តសញ្ញាណប័ណ្ណរបស់អ្នក ហើយព្យាយាមម្តងទៀតក្នុងរយៈពេលពីរបីនាទី ឬទំនាក់ទំនងសេវាបម្រើអតិថិជនជនតាមរយៈលេខ 070 200 002 ឬ 1800 200 888។";
        public static final String MSG_503 = "ការស្នើសុំមិនអាចភ្ជាប់ទៅប្រព័ន្ធយើងខ្ញុំទេ។ សូមពិនិត្យសេវាអ៊ីនធឺណែត រួចព្យាយាមម្តងទៀត។";
        public static final String MSG_504 = "ការផ្ទៀងផ្ទាត់អត្តសញ្ញាណប័ណ្ណជាមួយ CAMDX បរាជ័យ។ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។";

        // ==================================================================================
        // 5. ACCOUNT CREATION & OPEN ACCOUNT ERRORS
        // Used in: OpenAccountServiceImpl, OpenAcctController (legacy logic)
        // ==================================================================================
        public static final String FAIL_CREATE_ANY_ACCOUNT = "មិនអាចបង្កើតគណនីបានទេ។ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។ ប្រសិនបើបញ្ហានៅតែបន្ត សូមទំនាក់ទំនងសេវាបម្រើអតិថិជន។";
        public static final String MSG_DB_CONNECTION_ERR = "មានបញ្ហាក្នុងការតភ្ជាប់ទៅកាន់ប្រព័ន្ធ សូមព្យាយាមម្តងទៀត";
        public static final String MSG_HIGH_RISK_ERR = "សំណើរបស់អ្នកមិនអាចដំណើរការបានទេ ពីព្រោះការវាយតម្លៃអតិថិជនមានការហានិភ័យ";
        public static final String MSG_ACCOUNT_EXISTS_ERR = "លោកអ្នកមានគណនីជាមួយធនាគាររួចហើយ។ សូមប្រើប្រាស់ជាមួយគណនីរបស់លោកអ្នក។";
        public static final String MSG_GENERIC_ERROR = "ការស្នើសុំរបស់លោកអ្នកមិនអាចដំណើរការបានទេ។ សូមព្យាយាមម្តងទៀត"; // For
                                                                                                                      // 500,
                                                                                                                      // 503,
                                                                                                                      // 504,
                                                                                                                      // 505,
                                                                                                                      // 506
        public static final String MSG_SUCCESS = "ការស្នើសុំជោគជ័យ។ លោកអ្នកនឹងទទួលបានលេខគណនី តាមសារទូរស័ព្ទ។ សូមភ្ជាប់សេវាធនាគារចល័តដើម្បីរីករាយជាមួយប្រតិបត្តិការដ៏សម្បូរបែប។ ករណីមានចម្ងល់សូមទំនាក់ទំនងមកសេវាបម្រើអតិថិជន 070 200 002 ឬ 1800 200 888 ដើម្បីជំនួយបន្ថែម។";
        public static final String MSG_SYSTEM_BUSY = "ប្រព័ន្ធកំពុងមានបញ្ហាបណ្ដោះអាសន្ន។ សូមទំនាក់ទំនងសេវាបម្រើអតិថិជនតាមរយៈលេខ "
                        + SUPPORT_PHONE_PRIMARY + " ឬ " + SUPPORT_PHONE_SECONDARY + " ដើម្បីទទួលបានជំនួយបន្ថែម។";
        public static final String MSG_CONNECTION_TIMEOUT = "ការតភ្ជាប់មានភាពយឺតយ៉ាវ។ សូមព្យាយាមម្តងទៀត។";

        // ==================================================================================
        // 6. AML MESSAGES
        // Used in: OpenAccountServiceImpl
        // ==================================================================================
        public static final String AML_NEED_REVIEW_MSG = "ការស្នើសុំបរាជ័យ\n" +
                        "ការស្នើសុំរបស់អ្នក (AML High Risk) ត្រូវការត្រួតពិនិត្យ។ ធនាគារនឹងឆ្លើយតបបន្ទាប់ពីត្រួតពិនិត្យរួចរាល់ ឬទំនាក់ទំនងមកសេវាបម្រើអតិថិជន 070 200 002 ឬ 1800 200 888 ដើម្បីជំនួយបន្ថែម។";
        public static final String AML_REJECTED_MSG = "ការត្រួតពិនិត្យ (AML High Risk) ត្រូវបានបដិសេធសម្រាប់អត្តសញ្ញាណប័ណ្ណលេខ %s។ គណនីមិនអាចបង្កើតបានទេ។ "
                        + SUPPORT_CONTACT;
        public static final String AML_UNKNOWN_MSG = "ស្ថានភាព (AML High Risk) មិនស្គាល់សម្រាប់អត្តសញ្ញាណប័ណ្ណលេខ %s។ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ ឬទំនាក់ទំនងសេវាបម្រើអតិថិជនតាមរយៈលេខ "
                        + SUPPORT_PHONE_PRIMARY + " ឬ " + SUPPORT_PHONE_SECONDARY + "។";

        // ==================================================================================
        // 7. OPEN ACCOUNT WORKFLOW STEPS
        // Used in: OpenAccountServiceImpl for tracking progress
        // ==================================================================================
        public static final String TEST_CONNECTION = "TEST_CONNECTION";
        public static final String PROCESS_AML = "PROCESS_AML";
        public static final String GET_CUSTOMER_INFO = "GET_CUSTOMER_INFO";
        public static final String VALIDATE_EXISTING_ACCOUNT = "VALIDATE_EXISTING_ACCOUNT";
        public static final String CREATE_CUSTOMER = "CREATE_CUSTOMER";
        public static final String CREATE_KHR_ACCOUNT = "CREATE_KHR_ACCOUNT";
        public static final String CREATE_USD_ACCOUNT = "CREATE_USD_ACCOUNT";
        public static final String VALIDATE_ACCOUNT_CREATION = "VALIDATE_ACCOUNT_CREATION";
        public static final String ACTIVATE_MOBILE_BANKING = "ACTIVATE_MOBILE_BANKING";
        public static final String SAVE_CUSTOMER_IMAGES = "SAVE_CUSTOMER_IMAGES";

        // ==================================================================================
        // 8. OPEN ACCOUNT PENDING REQUEST MESSAGES - CUSTOMER FRIENDLY
        // Used in: OpenAccountServiceImpl for admin approval flow
        // ==================================================================================

        // Error Messages - Detailed & Professional
        public static final String PENDING_REQUEST_ALREADY_EXISTS = "លោកអ្នកបានដាក់ស្នើសុំបង្កើតគណនីរួចហើយ។ សូមរងចាំការឆ្លើយប្រតិកម្មពីផ្នែកលទ្ធផលគ្រប់គ្រង។ ប្រសិនបើលោកអ្នកមានសំណួរ សូមទំនាក់ទំនង " + SUPPORT_PHONE_PRIMARY + " ឬ " + SUPPORT_PHONE_SECONDARY + " ដើម្បីទទួលបានជំនួយបន្ថែម។";

        public static final String ACCOUNT_ALREADY_EXISTS_FOR_LEGAL_ID = "លោកអ្នកមានគណនីជាមួយធនាគារ CPB រួចហើយ។ សូមប្រើប្រាស់គណនីបច្ចុប្បន្ននៃលោកអ្នក ឬទំនាក់ទំនងសេវាបម្រើអតិថិជនតាមរយៈលេខ " + SUPPORT_PHONE_PRIMARY + " ឬ " + SUPPORT_PHONE_SECONDARY + " ដើម្បីទទួលបានជំនួយ។";

        public static final String INVALID_STATUS_ONLY_PENDING_CAN_APPROVE = "មានបញ្ហាក្នុងការដំណើរការស្នើសុំរបស់លោកអ្នក។ សូមលើកលែងក្រុមផ្នែកបច្ចេកទេស ឬទំនាក់ទំនង " + SUPPORT_PHONE_PRIMARY + " ឬ " + SUPPORT_PHONE_SECONDARY + "។";

        public static final String INVALID_STATUS_ONLY_PENDING_CAN_REJECT = "មានបញ្ហាក្នុងការដំណើរការស្នើសុំរបស់លោកអ្នក។ សូមលើកលែងក្រុមផ្នែកបច្ចេកទេស ឬទំនាក់ទំនង " + SUPPORT_PHONE_PRIMARY + " ឬ " + SUPPORT_PHONE_SECONDARY + "។";

        public static final String FAILED_PARSE_CUSTOMER_DATA = "មានបញ្ហាក្នុងការដំណើរការលម្អិតលម្អិតរបស់លោកអ្នក។ សូមព្យាយាមម្តងទៀត ឬទំនាក់ទំនងសេវាបម្រើអតិថិជនតាមរយៈលេខ " + SUPPORT_PHONE_PRIMARY + " ឬ " + SUPPORT_PHONE_SECONDARY + " ដើម្បីទទួលបានជំនួយ។";

        public static final String FAILED_CREATE_ACCOUNT = "មានបញ្ហាក្នុងការបង្កើតគណនី។ សូមព្យាយាមម្តងទៀត ឬទំនាក់ទំនងសេវាបម្រើអតិថិជនតាមរយៈលេខ " + SUPPORT_PHONE_PRIMARY + " ឬ " + SUPPORT_PHONE_SECONDARY + " ដើម្បីទទួលបានជំនួយ។";

        // Success Messages - Professional & Detailed
        public static final String SUBMIT_SUCCESS_MESSAGE = "សូមស្វាគមន៍! ស្នើសុំបង្កើតគណនីរបស់លោកអ្នកត្រូវបានទទួលដោយជោគជ័យ។\n\n📋 លម្អិត:\n• លេខសម្គាល់សម្ងាត់ថ្មី នឹងទាក់ទងលោកអ្នកតាមរយៈសារទូរស័ព្ទ\n• ធនាគារកំពុងវាយតម្លៃលម្អិតលម្អិតរបស់លោកអ្នក (ឡើង ៣-៥ ថ្ងៃធ្វើការ)\n• លោកអ្នកនឹងទទួលបានលេខគណនីក្នុងពេលដ៏ល្អលម្អិត\n\n💬 ប្រសិនបើលោកអ្នកមានសំណួរ សូមទំនាក់ទំនង:\n📞 " + SUPPORT_PHONE_PRIMARY + " ឬ " + SUPPORT_PHONE_SECONDARY + "\n📧 ពេលម៉ោង៖ ៩:០០ - ១៧:០០ (ច័ន្ទ - ព្រហស្បតិ៍)";

        public static final String APPROVE_SUCCESS_MESSAGE = "សូមស្វាគមន់! ស្នើសុំបង្កើតគណនីត្រូវបានផ្ល័ងផ្សាយដោយជោគជ័យ។\n\n✅ គណនីរបស់លោកអ្នកកំពុងត្រូវបានបង្កើត\n• លេខគណនីថ្មីនឹងបញ្ជូនទៅលោកអ្នកក្នុងរយៈពេល ១-៣ ថ្ងៃធ្វើការ\n• សូមធានាថាលេខទូរស័ព្ទរបស់លោកអ្នកឈានដល់\n• បន្ទាប់មក លោកអ្នកអាចប្រើប្រាស់សេវាធនាគារលើឡាន\n\n💬 ប្រសិនបើលោកអ្នកមានសំណួរ សូមទំនាក់ទំនង " + SUPPORT_PHONE_PRIMARY + " ឬ " + SUPPORT_PHONE_SECONDARY + "។";

        public static final String REJECT_SUCCESS_MESSAGE = "ស្នើសុំបង្កើតគណនីត្រូវបានពិចារណាហើយ។\n\n❌ ស្នើសុំរបស់លោកអ្នកមិនត្រូវបានផ្ល័ងផ្សាយក្នុងលើកនេះ\n• សូមក្រឡេកមើលលម្អិតលម្អិតនៃលក្ខខណ្ឌ\n• លោកអ្នកអាចដាក់ស្នើសុំម្តងទៀត\n• ប្រសិនបើលោកអ្នកមានសំណួរ សូមទំនាក់ទំនង " + SUPPORT_PHONE_PRIMARY + " ឬ " + SUPPORT_PHONE_SECONDARY + " ដើម្បីទទួលបានជំនួយ។";

        // API Response Messages - Simple & Clear (for ApiResponse.success())
        public static final String ACCOUNT_OPENING_SUBMITTED = "Account opening request submitted successfully";
        public static final String ACCOUNT_OPENING_APPROVED = "Account opening request approved successfully";
        public static final String ACCOUNT_OPENING_REJECTED = "Account opening request rejected successfully";
        public static final String PENDING_ACCOUNTS_RETRIEVED = "Pending accounts retrieved successfully";
        public static final String PENDING_ACCOUNT_DETAIL_RETRIEVED = "Pending account details retrieved successfully";

        // ── English Versions ──
        public static final String PENDING_REQUEST_ALREADY_EXISTS_EN = "You have already submitted an account opening request. Please wait for the review department's response. If you have any questions, please contact " + SUPPORT_PHONE_PRIMARY + " or " + SUPPORT_PHONE_SECONDARY + " for further assistance.";

        public static final String ACCOUNT_ALREADY_EXISTS_FOR_LEGAL_ID_EN = "You already have an account with CPB Bank. Please use your current account or contact customer service at " + SUPPORT_PHONE_PRIMARY + " or " + SUPPORT_PHONE_SECONDARY + " for assistance.";

        public static final String INVALID_STATUS_ONLY_PENDING_CAN_APPROVE_EN = "There was a problem processing your request. Please contact the technical team or call " + SUPPORT_PHONE_PRIMARY + " or " + SUPPORT_PHONE_SECONDARY + ".";

        public static final String INVALID_STATUS_ONLY_PENDING_CAN_REJECT_EN = "There was a problem processing your request. Please contact the technical team or call " + SUPPORT_PHONE_PRIMARY + " or " + SUPPORT_PHONE_SECONDARY + ".";

        public static final String FAILED_PARSE_CUSTOMER_DATA_EN = "There was a problem processing your details. Please try again or contact customer service at " + SUPPORT_PHONE_PRIMARY + " or " + SUPPORT_PHONE_SECONDARY + " for assistance.";

        public static final String FAILED_CREATE_ACCOUNT_EN = "There was a problem creating your account. Please try again or contact customer service at " + SUPPORT_PHONE_PRIMARY + " or " + SUPPORT_PHONE_SECONDARY + " for assistance.";

        public static final String SUBMIT_SUCCESS_MESSAGE_EN = "Welcome! Your account opening request has been received successfully.\n\n📋 Details:\n• Your new account number will be sent to you via SMS\n• The bank is currently reviewing your information (approximately 3-5 business days)\n• You will receive your account number within the timeframe\n\n💬 If you have any questions, please contact:\n📞 " + SUPPORT_PHONE_PRIMARY + " or " + SUPPORT_PHONE_SECONDARY + "\n📧 Hours: 9:00 - 17:00 (Monday - Friday)";

        public static final String APPROVE_SUCCESS_MESSAGE_EN = "Welcome! Your account opening request has been approved successfully.\n\n✅ Your account is being created\n• Your new account number will be sent to you within 1-3 business days\n• Please ensure your phone number is reachable\n• After that, you can use our mobile banking services\n\n💬 If you have any questions, please contact " + SUPPORT_PHONE_PRIMARY + " or " + SUPPORT_PHONE_SECONDARY + ".";

        public static final String REJECT_SUCCESS_MESSAGE_EN = "Your account opening request has been reviewed.\n\n❌ Your request was not approved this time\n• Please review the detailed conditions\n• You can submit a new request\n• If you have any questions, please contact " + SUPPORT_PHONE_PRIMARY + " or " + SUPPORT_PHONE_SECONDARY + " for assistance.";

        // ==================================================================================
        // 9. FIELD NAME TRANSLATIONS
        // Used in: CamdxErrorCheckServiceImpl
        // ==================================================================================
        public static final String FIELD_KH_LASTNAME_EN = "នាមត្រកូល (អង់គ្លេស)";
        public static final String FIELD_KH_FIRSTNAME_EN = "នាមខ្លួន (អង់គ្លេស)";
        public static final String FIELD_KH_DOB = "ថ្ងៃខែឆ្នាំកំណើត";
        public static final String FIELD_KH_GENDER = "ភេទ";

        public static final String FIELD_LAST_NAME_EN = "lastNameEn";
        public static final String FIELD_FIRST_NAME_EN = "firstNameEn";
        public static final String FIELD_DOB = "dob";
        public static final String FIELD_GENDER = "gender";

        public static final String FIELD_NONE = "None";
        public static final String BULLET_PREFIX = "- ";
        public static final String NEW_LINE = "\n";

        // T24 ERROR RESPONSE
        public static final String T24_ACCOUNT_ERROR = "SECURITY VIOLATION DURING SIGN ON PROCESS";

        private AppConstants() {

        }
}
