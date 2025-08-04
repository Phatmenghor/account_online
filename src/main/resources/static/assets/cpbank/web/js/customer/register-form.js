var dateOfBirthPicker = null;
let currentLang = null;
let provinceCode = null;
let districtCode = null;
let communeCode = null;
let villageCode = null;
let pobProvinceCode = null;
let pobDistrictCode = null;
let pobCommuneCode = null;
let pobVillageCode = null;
let legalImageValue = null;
let selfieImageValue = null;
let branchCodeValue = null;
let lang = localStorage.getItem('selectedLang') || 'kh';

// OTP Global Variables
let resendCountdown = 0;
let resendInterval = null;
let otpAttempts = 0;
let isOtpLocked = false;

$(document).ready(function () {
    // Apply the initial language
    updateLanguageDisplay(lang);

    // Initialize flatpickr
    initializeFlatpickr();

    // Initialize SweetAlert Toast
    window.Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    // Call the function to populate other fields
    getBranch();

    // Initialize resend button
    updateResendButton();

    // Handle resend button click
    $('#resendOTPBtn').on('click', function(e) {
        e.preventDefault();
        if (resendCountdown === 0) {
            sendOtp();
        }
    });
});

// Function to safely initialize flatpickr
function initializeFlatpickr() {
    dateOfBirthPicker = $("#dateOfBirth").flatpickr({
        enableTime: false,
        dateFormat: "d/m/Y", // Format: DD/MM/YYYY
        altFormat: "d/m/Y",
        allowInput: true, // Allows users to type manually
        disableMobile: true, //This line ensures Flatpickr works the same on all devices
        onClose: function (selectedDates, dateStr, instance) {
            let input = instance.input;
            if (!dateStr) {
                input.setCustomValidity("Please select a date."); // Set validation error
            } else {
                input.setCustomValidity(""); // Clear validation error
            }
            input.reportValidity(); // Force validation message display
        }
    });
}

// SUBMIT DATA
var form = document.getElementsByClassName('need-novalidate-new');
var validation = Array.prototype.filter.call(form, function (forms) {
    forms.addEventListener('submit', function (event) {
        if (forms.checkValidity() === false) {
            event.preventDefault();
        } else {
            event.preventDefault();
            var submitButtonId = event.submitter.id;
            if (submitButtonId === 'btnSubmit') {
                submitData();
            }
        }
        forms.classList.add('was-validated');
    }, false);
});

//VALIDATION DATA
var form = document.getElementsByClassName('need-novalidate-new');
var validation = Array.prototype.filter.call(form, function(forms) {
    forms.addEventListener('submit', function(event) {
        if (forms.checkValidity() === false) {
            event.preventDefault();
        } else {
            event.preventDefault();
            var submitButtonId = event.submitter.id;
            if (submitButtonId === 'btnValidate') {
                verifyCustomerInfo();
            }
        }
        forms.classList.add('was-validated');
    }, false);
});

function verifyCustomerInfo() {
    const lang = localStorage.getItem('selectedLang') || 'kh';

    const confirmationText = lang === 'kh'
        ? "សូមបញ្ជាក់ថា លោកអ្នកបានពិនិត្យព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នករួចរាល់ហើយមែនទេ?"
        : "Please confirm that you have reviewed your personal information.";

    Swal.fire({
        title: lang === 'kh' ? "បញ្ជាក់ព័ត៌មាន" : "Confirm Information",
        text: confirmationText,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: lang === 'kh' ? "បាទ/ចាស ខ្ញុំបានពិនិត្យរួច" : "Yes, I have reviewed",
        cancelButtonText: lang === 'kh' ? "ទេ ខ្ញុំត្រូវពិនិត្យម្តងទៀត" : "No, I need to review",
    }).then((result) => {
        if (result.isConfirmed) {
            ValidateNid();
        }
    });
}

$('#legalIdImage').on('change', function (evt) {
    const file = evt.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            // Create canvas and set dimensions
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // Compress to 0.5 quality as JPEG
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.5);
            $('#legalIdImageDisplay').attr('src', compressedDataUrl);

            legalImageValue = compressedDataUrl.split(',')[1];
            const json = { idImage: legalImageValue };

            showLoading();

            $.ajax({
                type: "POST",
                url: "api/v1/eKYC/extract-nid",
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(json),
                success: function (response) {
                    hideLoading();
                    const lang = localStorage.getItem('selectedLang') || 'kh';

                    if (response.error === 0) {
                        if (response.data !== null) {
                            populateFormFields(response.data);
                        } else {
                            resetNidImageInput();
                            showSweetAlert("error", translations[lang].fail, response.message);
                        }
                    } else {
                        hideLoading();
                        resetNidImageInput();
                        showSweetAlert("error", translations[lang].fail, response.message);
                    }
                },
                error: function (xhr, status, error) {
                    hideLoading();
                    resetNidImageInput();

                    const lang = localStorage.getItem('selectedLang') || 'kh';
                    showSweetAlert("error", translations[lang].fail, translations[lang].tryAgain);
                },
            });
        };

        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
});

function resetNidImageInput() {
    $('#legalIdImage').val(null);
    $('#legalIdImageDisplay').attr('src', '/OpenAcct/assets/cpbank/images/National_ID_selfie.png');
}

function populateFormFields(data) {
    $('#firstNameKh').val(data.firstNameKh);
    $('#lastNameKh').val(data.lastNameKh);
    $('#familyName').val(data.lastNameEn);
    $('#givenName').val(data.firstNameEn);

    // Handle date of birth safely
    if (data.dob) {
        $('#dateOfBirth').val(data.dob);
    }

    $('#gender').val(data.gender === "M" ? "MALE" : "FEMALE");
    $('#legalId').val(data.idNumber);
    document.getElementById("legalDocName").selectedIndex = 1;
    $("#customerPlaceOfBirth").val(data.pob);
    $('#customerAddress').val(data.address);

    // Event listeners for user input
    $('#firstNameKh').on('input', function () {
        data.firstNameKh = $(this).val();
    });

    $('#lastNameKh').on('input', function () {
        data.lastNameKh = $(this).val();
    });

    $('#familyName').on('input', function () {
        data.lastNameEn = $(this).val();
    });

    $('#givenName').on('input', function () {
        data.firstNameEn = $(this).val();
    });

    $('#dateOfBirth').on('input', function () {
        data.dob = $(this).val();
    });

    $('#gender').on('change', function () {
        data.gender = $(this).val() === "MALE" ? "M" : "F";
    });

    $('#legalId').on('input', function () {
        data.idNumber = $(this).val();
    });

    $('#customerPlaceOfBirth').on('input', function () {
        data.pob = $(this).val();
    });

    $('#customerAddress').on('input', function () {
        data.address = $(this).val();
    });
}

$('#frontImage').on('change', function (evt) {
    const file = evt.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            // Create a canvas to draw and compress the image
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // Compress image to JPEG with 0.5 quality
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.5);

            // Set the base64 image string (without the "data:image/jpeg;base64," part)
            selfieImageValue = compressedDataUrl.split(',')[1];

            // Display the compressed image
            $('#imgFrontImageDisplay').attr('src', compressedDataUrl);
        };

        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
});

// Submit Data Function
function submitData() {
    showLoading();
    var json = {
        "family_name": $("#familyName").val(),
        "given_name": $("#givenName").val(),
        "gender": $("#gender").val(),
        "occupation": $("#occupation").val(),
        "date_of_birth": $("#dateOfBirth").val(),
        "cust_province": provinceCode,
        "cust_district": districtCode,
        "cust_commune": communeCode,
        "cust_village": villageCode,
        "cust_pob_province": pobProvinceCode,
        "cust_pob_district": pobDistrictCode,
        "cust_pob_commune": pobCommuneCode,
        "cust_pob_village": pobVillageCode,
        "legal_id": $("#legalId").val(),
        "legal_doc_name": $("#legalDocName").val(),
        "legal_exp_date": $("#expiredDate").val(),
        "legal_iss_date": $("#issuedDate").val(),
        "staff_code": $("#staffCode").val(),
        "company": $("#company").val(),
        "branch_code": branchCodeValue,
        "sms": $("#contactNumber").val(),
        "phone_number": $("#contactNumber").val(),
        "otp_code": $("#otpCode").val(),
        "marital_status": $("#maritalStatus").val(),
        "nid_image": legalImageValue,
        "selfie_image": selfieImageValue,
        "place_of_birth": $("#customerPlaceOfBirth").val(),
        "address": $("#customerAddress").val(),
        "firstNameKh": $("#firstNameKh").val(),
        "lastNameKh": $("#lastNameKh").val(),
    };

    $.ajax({
        type: "POST",
        url: "api/v1/customer-register",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify(json),
        success: function (response) {
            hideLoading();
            handleSubmitResponseSuccess(response);
        },
        error: function (xhr) {
            handleAjaxError(xhr, status, error);
        }
    });
}

// Handle API Response Function
function handleSubmitResponseSuccess(response) {
    const statusCode = response.ErrCode;
    let content = lang === "kh" ? response.Content : response.ErrMsg;

    let alertType;
    let header;
    if (statusCode === "200") {
        alertType = "success";
        header = translations[lang].success;
    } else if (statusCode === "302") {
        alertType = "info";
        header = translations[lang].alreadyExists;
    } else {
        alertType = "danger";
        header = translations[lang].fail;
    }

    showAlert(alertType, header, content);
    resetForm();
    undisableFormFields();
}

// RESET FORM FUNCTION
function resetForm() {
    $('#btnValidate').removeClass('disabled');
    $('#btnSubmit').addClass('disabled');

    $(".need-novalidate-new").removeClass("was-validated").trigger("reset");
    $("#legalIdImage").val(null);
    $("#legalIdImageDisplay").attr("src", "/OpenAcct/assets/cpbank/images/National_ID_selfie.png");
    $("#frontImage").val(null);
    $("#imgFrontImageDisplay").attr("src", "/OpenAcct/assets/cpbank/images/image_selfie.jpg");

    // Reset OTP state when form is reset
    resetOtpState();
}

function ValidateNid() {
    showLoading();
    const json = {
        idNumber: $('#legalId').val(),
        firstNameKh: $('#firstNameKh').val(),
        lastNameKh: $('#lastNameKh').val(),
        firstNameEn: $('#givenName').val(),
        lastNameEn: $('#familyName').val(),
        gender: $('#gender').val() === "MALE" ? "M" : "F",
        dob: $('#dateOfBirth').val(),
        issuedDate: $('#issuedDate').val(),
        expiredDate: $('#expiredDate').val()
    };

    $.ajax({
        type: "POST",
        url: "api/v1/eKYC/validate-nid",
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(json),
        success: function (response) {
            handleAjaxNidValidateSuccess(response);
        },
        error: function (xhr, status, error) {
            handleAjaxError(xhr, status, error);
        }
    });
}

function handleAjaxNidValidateSuccess(response) {
    hideLoading();

    if (response.error === 0) {
        const { incorrectFields } = response.data;
        const skipFields = ["firstNameKh", "lastNameKh", "issuedDate", "expiredDate"];
        const criticalIncorrectFields = incorrectFields.filter(field =>
            !skipFields.includes(field)
        );

        if (criticalIncorrectFields.length > 0) {
            var incorrectFieldsText = '';
            var fieldMappings;

            if (lang == 'kh') {
                fieldMappings = {
                    dob: "ថ្ងៃខែឆ្នាំកំណើត (ថ្ងៃ ខែ ឆ្នាំ)",
                    gender: "ភេទ",
                    lastNameEn: "នាមត្រកូល (អក្សរឡាតាំង)",
                    firstNameEn: "នាមខ្លួន (អក្សរឡាតាំង)",
                    idNumber: "លេខអត្តសញ្ញាណប័ណ្ណ"
                };
            } else {
                fieldMappings = {
                    dob: "Date of Birth",
                    gender: "Gender",
                    lastNameEn: "Family Name",
                    firstNameEn: "Given Name",
                    idNumber: "ID Number"
                };
            }

            if (Array.isArray(criticalIncorrectFields) && criticalIncorrectFields.length > 0) {
                incorrectFieldsText = criticalIncorrectFields
                    .map(function(field) {
                        return fieldMappings[field] ? '- ' + fieldMappings[field] : '- ' + field;
                    }).join('<br />');
            }

            const htmlContent = `
                <div style="text-align: start; margin-top: 10px;">
                    <img src="/OpenAcct/assets/cpbank/icon/fail1.png" alt="fail" style="width: 16px; height: 16px;" />
                    ${lang === 'kh' ? 'ព័ត៌មានមិនត្រូវ។ សូមពិនិត្យ៖' : 'Some info is incorrect. Please check:'}
                    <div style="margin-left: 20px; margin-top: 5px;">${incorrectFieldsText}</div>
                </div>
            `;

            showSweetAlert('warning', lang === 'kh' ? 'បរាជ័យ' : 'Validation Failed', htmlContent);

        } else {
            const skippedIncorrectFields = incorrectFields.filter(field => skipFields.includes(field));
            if (skippedIncorrectFields.length > 0) {
                Toast.fire({
                    icon: 'info',
                    title: lang === 'kh'
                        ? 'ព័ត៌មានខ្លះមិនត្រឹមត្រូវ ប៉ុន្តែបន្តបាន'
                        : 'Some information is incorrect but continuing',
                    timer: 2000
                });
            }

            checkAddressCustomer();
        }

    } else {
        showSweetAlert('error', lang === 'kh' ? 'បរាជ័យ' : 'Validation Failed', response.message);
    }
}

function handleAjaxError(xhr, status, error) {
    hideLoading();
    const errorTitle = lang === 'kh' ? `កំហុស៖ ${xhr.status}` : `Error: ${xhr.status}`;
    const errorMessage = lang === 'kh'
        ? "សូមចាប់ផ្តើមទំព័រឡើងវិញហើយព្យាយាមម្តងទៀត ឬទាក់ទងផ្នែកគាំទ្ររបស់យើងប្រសិនបើបញ្ហានេះនៅតែបន្ត។"
        : "Please refresh the page and try again, or contact support if the issue persists.";

    showSweetAlert('error', errorTitle, errorMessage);
}

var isCheckAddressCustomerFound = 0;
var isCheckPOBAddressCustomerFound = 0;

function checkAddressCustomer() {
    isCheckAddressCustomerFound = 0;
    isCheckPOBAddressCustomerFound = 0;

    if ($("#customerAddress").val() != null) {
        showLoading();
        var json = {
            customer_address: $("#customerAddress").val()
        };

        $.ajax({
            type: "POST",
            url: "api/v1/eKYC/verify-address",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(json),
            success: function (response) {
                if (response.IsFindAddress == 1) {
                    hideLoading();
                    isCheckAddressCustomerFound = 1;
                    provinceCode = response.ProvinceCode;
                    districtCode = response.DistrictCode;
                    communeCode = response.CommuneCode;
                    villageCode = response.VillageCode;
                    checkPOBAddressCustomer();
                } else {
                    hideLoading();
                    checkPOBAddressCustomer()
                }
            },
            error: function (xhr, status, error) {
                hideLoading();
                showSweetAlert("error", translations[lang].fail, translations[lang].tryAgain);
            },
        });
    }
}

function checkPOBAddressCustomer() {
    if ($("#customerPlaceOfBirth").val() != null) {
        showLoading();
        var json = {
            customer_pob_address: $("#customerPlaceOfBirth").val()
        };

        $.ajax({
            type: "POST",
            url: "api/v1/eKYC/verify-pob-address",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(json),
            success: function (response) {
                if (response.IsFindAddress == 1) {
                    hideLoading();
                    isCheckPOBAddressCustomerFound = 1;
                    pobProvinceCode = response.ProvinceCode;
                    pobDistrictCode = response.DistrictCode;
                    pobCommuneCode = response.CommuneCode;
                    pobVillageCode = "";
                    determineModalToShow();
                } else {
                    hideLoading();
                    determineModalToShow();
                }
            },
            error: function (xhr, status, error) {
                hideLoading();
                showSweetAlert("error", translations[lang].fail, translations[lang].tryAgain);
            },
        });
    }
}

function undisableFormFields() {
    $('#firstNameKh').prop('readonly', false);
    $('#lastNameKh').prop('readonly', false);
    $('#familyName').prop('readonly', false);
    $('#givenName').prop('readonly', false);
    document.getElementById("legalDocName").disabled = false;
    document.getElementById("gender").disabled = false;
    document.getElementById("dateOfBirth").disabled = false;
    $("#customerPlaceOfBirth").prop('readonly', false);
    $('#customerAddress').prop('readonly', false);
}

function disableFormFields() {
    $('#firstNameKh').prop('readonly', true);
    $('#lastNameKh').prop('readonly', true);
    $('#familyName').prop('readonly', true);
    $('#givenName').prop('readonly', true);
    document.getElementById("legalDocName").disabled = true;
    document.getElementById("gender").disabled = true;
    document.getElementById("dateOfBirth").disabled = true;
    $("#customerPlaceOfBirth").prop('readonly', true);
    $('#customerAddress').prop('readonly', true);
}

function determineModalToShow() {
    if (isCheckAddressCustomerFound === 0 && isCheckPOBAddressCustomerFound === 0) {
        $('#idFormUser1').modal('show');
        getPro();
        getProPOB();
    } else if (isCheckAddressCustomerFound === 0 && isCheckPOBAddressCustomerFound === 1) {
        $('#idFormUser2').modal('show');
        getProM2();
    } else if (isCheckAddressCustomerFound === 1 && isCheckPOBAddressCustomerFound === 0) {
        $('#idFormUser3').modal('show');
        getProPOBM3();
    } else {
        const lang = localStorage.getItem('selectedLang') || 'kh';
        if (lang === 'kh') {
            Toast.fire({
                icon: 'success',
                title: "ព័ត៌មានរបស់លោកអ្នកត្រឹមត្រូវ"
            });
        } else {
            Toast.fire({
                icon: 'success',
                title: "Your information is correct"
            });
        }

        $('#btnSubmit').removeClass('disabled');
        $('#btnValidate').addClass('disabled');
        disableFormFields();
    }
}

// ============================
// OTP FUNCTIONALITY
// ============================

// Detect change in contact number and send OTP
$('#contactNumber').on('change blur', function () {
    const phoneNumber = $(this).val().trim();
    if (phoneNumber && phoneNumber.length >= 9) {
        resetOtpState();
        sendOtp();
    }
});

// Detect change in OTP code field and verify the OTP
$('#otpCode').on('input', function () {
    const contactNumberVal = $('#contactNumber').val();
    const otpCodeVal = $(this).val().trim();

    if (contactNumberVal && otpCodeVal && otpCodeVal.length === 6) {
        verifyOtp(contactNumberVal, otpCodeVal);
    }
});

// Send OTP function - Handles C# API responses
function sendOtp() {
    const contactNumberVal = $('#contactNumber').val();

    if (!contactNumberVal || resendCountdown > 0) {
        return;
    }

    showLoading(translations[lang].sending || "កំពុងផ្ញើលេខ PIN សម្ងាត់...");

    $.ajax({
        type: "POST",
        url: "api/v1/otp/send",
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({
            phone: contactNumberVal,
            App: '0',
            Text: ""
        }),
        success: function (response) {
            hideLoading();

            if (response.status === 'OK') {
                startResendCountdown(60);

                Toast.fire({
                    icon: 'success',
                    title: translations[lang].otpSent || "បានផ្ញើលេខ PIN សម្ងាត់ដោយជោគជ័យ"
                });
            }
        },
        statusCode: {
            400: function(xhr) {
                hideLoading();
                const response = xhr.responseJSON;

                if (response && response.message) {
                    if (response.message.startsWith('-')) {
                        const remainingSeconds = Math.abs(parseInt(response.message));

                        if (parseInt(response.message) === -500) {
                            showOtpModal('error',
                                translations[lang].otpLocked || 'ការព្យាយាមច្រើនពេក',
                                translations[lang].otpLockedMessage || 'អ្នកបានលើសចំនួនការព្យាយាមអតិបរមាហើយ។ សូមរង់ចាំ ៥ នាទីមុនពេលព្យាយាមម្តងទៀត។'
                            );
                        } else {
                            startResendCountdown(remainingSeconds);

                            showOtpModal('warning',
                                translations[lang].otpWait || 'សូមរង់ចាំ',
                                (translations[lang].otpWaitMessage || 'សូមរង់ចាំ {seconds} វិនាទីមុនពេលស្នើលេខ PIN សម្ងាត់ថ្មី។')
                                    .replace('{seconds}', remainingSeconds)
                            );
                        }
                    } else {
                        showOtpModal('error',
                            translations[lang].fail || 'បរាជ័យ',
                            response.message || translations[lang].otpSendFailed || "បរាជ័យក្នុងការផ្ញើលេខ PIN សម្ងាត់"
                        );
                    }
                }
            }
        },
        error: function (xhr) {
            hideLoading();
            showOtpModal('error',
                translations[lang].error || 'កំហុស',
                translations[lang].tryAgain || 'សូមព្យាយាមម្តងទៀត'
            );
        }
    });
}

// Verify OTP function - Handles all C# API responses
function verifyOtp(phoneNumber, otpCode) {
    $.ajax({
        type: "POST",
        url: "api/v1/otp/verify",
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({
            phone_number: phoneNumber,
            otp_code: otpCode
        }),
        success: function (response) {
            if (response.status === 'OK' && response.message === 'OTP_VERIFIED') {
                $('#otpCode').removeClass('is-invalid').addClass('is-valid');

                Toast.fire({
                    icon: 'success',
                    title: translations[lang].otpVerified || "លេខ PIN សម្ងាត់ត្រឹមត្រូវ"
                });

                resetOtpState();
            }
        },
        statusCode: {
            400: function(xhr) {
                const response = xhr.responseJSON;
                $('#otpCode').removeClass('is-valid').addClass('is-invalid').val('');

                if (response && response.message) {

                    if (response.message === 'TOO_MANY_ATTEMPTS') {
                        showOtpModal('error',
                            translations[lang].otpLocked || 'ការព្យាយាមច្រើនពេក',
                            translations[lang].otpLockedMessage || 'អ្នកបានលើសចំនួនការព្យាយាមអតិបរមាហើយ។ សូមរង់ចាំ ៥ នាទីមុនពេលព្យាយាមម្តងទៀត។'
                        );

                    } else if (response.message === 'OTP_EXPIRED') {
                        showOtpModal('error',
                            translations[lang].otpExpired || 'លេខ PIN សម្ងាត់ផុតកំណត់',
                            translations[lang].otpExpiredMessage || 'លេខ PIN សម្ងាត់របស់អ្នកផុតកំណត់ហើយ។ សូមស្នើលេខថ្មី។'
                        );
                        resetOtpState();

                    } else if (response.message.includes('OTP_ATTEMPT_REMANING_')) {
                        const remaining = response.message.split('_').pop();
                        showOtpModal('warning',
                            translations[lang].otpInvalid || 'លេខ PIN សម្ងាត់មិនត្រឹមត្រូវ',
                            (translations[lang].otpAttemptsRemaining || 'លេខ PIN សម្ងាត់មិនត្រឹមត្រូវ។ នៅសល់ {attempts} ដង។')
                                .replace('{attempts}', remaining)
                        );

                    } else if (response.message === 'OTP_INVALID') {
                        showOtpModal('error',
                            translations[lang].otpInvalid || 'លេខ PIN សម្ងាត់មិនត្រឹមត្រូវ',
                            translations[lang].otpInvalidMessage || 'លេខ PIN សម្ងាត់ដែលអ្នកបានបញ្ចូលមិនត្រឹមត្រូវទេ។'
                        );

                    } else {
                        showOtpModal('error',
                            translations[lang].otpInvalid || 'លេខ PIN សម្ងាត់មិនត្រឹមត្រូវ',
                            response.message || translations[lang].otpInvalidMessage || 'លេខ PIN សម្ងាត់ដែលអ្នកបានបញ្ចូលមិនត្រឹមត្រូវទេ។'
                        );
                    }
                }
            }
        },
        error: function (xhr) {
            $('#otpCode').removeClass('is-valid').addClass('is-invalid').val('');
            showOtpModal('error',
                translations[lang].error || 'កំហុស',
                translations[lang].tryAgain || 'សូមព្យាយាមម្តងទៀត'
            );
        }
    });
}

// Start resend countdown
function startResendCountdown(seconds) {
    resendCountdown = seconds;
    updateResendButton();

    if (resendInterval) {
        clearInterval(resendInterval);
    }

    resendInterval = setInterval(() => {
        resendCountdown--;
        updateResendButton();

        if (resendCountdown <= 0) {
            clearInterval(resendInterval);
            resendInterval = null;
            updateResendButton();
        }
    }, 1000);
}

// Update resend button text and state
function updateResendButton() {
    const resendBtn = document.querySelector('#resendOTPBtn');

    if (!resendBtn) return;

    if (resendCountdown > 0) {
        const minutes = Math.floor(resendCountdown / 60);
        const seconds = resendCountdown % 60;
        const timeStr = minutes > 0 ?
            `${minutes}:${seconds.toString().padStart(2, '0')}` :
            `${seconds}s`;

        resendBtn.textContent = (translations[lang].resendWait || 'ផ្ញើលេខ PIN សម្ងាត់ម្តងទៀត ({time})')
            .replace('{time}', timeStr);
        resendBtn.disabled = true;
        resendBtn.classList.remove('btn-link');
        resendBtn.classList.add('btn-secondary');
        resendBtn.style.opacity = '0.6';
        resendBtn.onclick = null;
    } else {
        resendBtn.textContent = translations[lang].resendOTP || 'ផ្ញើលេខ PIN សម្ងាត់ម្តងទៀត';
        resendBtn.disabled = false;
        resendBtn.classList.remove('btn-secondary');
        resendBtn.classList.add('btn-link');
        resendBtn.style.opacity = '1';
        resendBtn.onclick = function(e) {
            e.preventDefault();
            if (resendCountdown === 0) {
                sendOtp();
            }
        };
    }
}

// Reset OTP state
function resetOtpState() {
    resendCountdown = 0;

    if (resendInterval) {
        clearInterval(resendInterval);
        resendInterval = null;
    }

    $('#otpCode').removeClass('is-invalid is-valid').val('');
    updateResendButton();
}

// Show OTP modal alerts
function showOtpModal(type, title, message) {
    let icon = type;
    let buttonClass = 'btn-primary';

    switch(type) {
        case 'error':
            icon = 'error';
            buttonClass = 'btn-danger';
            break;
        case 'warning':
            icon = 'warning';
            buttonClass = 'btn-warning';
            break;
        case 'success':
            icon = 'success';
            buttonClass = 'btn-success';
            break;
        default:
            icon = 'info';
    }

    Swal.fire({
        icon: icon,
        title: title,
        text: message,
        confirmButtonText: translations[lang].confirm || 'យល់ព្រម',
        customClass: {
            confirmButton: `btn ${buttonClass}`,
            popup: 'swal-custom-popup'
        },
        buttonsStyling: false,
        allowOutsideClick: false,
        allowEscapeKey: false
    });
}

// ============================
// BRANCH FUNCTIONALITY
// ============================

$("#ddlBranch").change(function () {
    var selectOptionValue = $(this).val();
    branchCodeValue = selectOptionValue;
});

function getBranch() {
    $.ajax({
        type: "GET",
        url: "api/v1/masterData/getBranch",
        contentType: 'application/json',
        dataType: 'json',
        success: function (response) {
            if (response.length > 0) {
                var ddlBranch = $('#ddlBranch');
                for (var i = 0; i < response.length; i++) {
                    var Branch = response[i];
                    var branchValue = Branch.BranchID;
                    var branchText = Branch.Branchkh;
                    var option = new Option(branchText, branchValue);
                    ddlBranch.append(option);
                }
            }
        }
    });
}

// ============================
// TRANSLATIONS
// ============================

// OTP Translations
const otpTranslations = {
    en: {
        otpSent: "OTP Sent Successfully",
        otpVerified: "OTP Verified Successfully",
        otpInvalid: "Invalid OTP",
        otpInvalidMessage: "The OTP code you entered is incorrect.",
        otpExpired: "OTP Expired",
        otpExpiredMessage: "Your OTP has expired. Please request a new one.",
        otpLocked: "Too Many Attempts",
        otpLockedMessage: "You have exceeded the maximum number of attempts. Please wait 5 minutes before trying again.",
        otpWait: "Please Wait",
        otpWaitMessage: "Please wait {seconds} seconds before requesting another OTP.",
        otpAttemptsRemaining: "Invalid OTP. {attempts} attempts remaining.",
        otpSendFailed: "Failed to send OTP. Please try again.",
        resendOTP: "Resend OTP",
        resendWait: "Resend OTP ({time})",
        sending: "Sending OTP, please wait..."
    },
    kh: {
        otpSent: "បានផ្ញើលេខ PIN សម្ងាត់ដោយជោគជ័យ",
        otpVerified: "លេខ PIN សម្ងាត់ត្រឹមត្រូវ",
        otpInvalid: "លេខ PIN សម្ងាត់មិនត្រឹមត្រូវ",
        otpInvalidMessage: "លេខ PIN សម្ងាត់ដែលអ្នកបានបញ្ចូលមិនត្រឹមត្រូវទេ។",
        otpExpired: "លេខ PIN សម្ងាត់ផុតកំណត់",
        otpExpiredMessage: "លេខ PIN សម្ងាត់របស់អ្នកផុតកំណត់ហើយ។ សូមស្នើលេខថ្មី។",
        otpLocked: "ការព្យាយាមច្រើនពេក",
        otpLockedMessage: "អ្នកបានលើសចំនួនការព្យាយាមអតិបរមាហើយ។ សូមរង់ចាំ ៥ នាទីមុនពេលព្យាយាមម្តងទៀត។",
        otpWait: "សូមរង់ចាំ",
        otpWaitMessage: "សូមរង់ចាំ {seconds} វិនាទីមុនពេលស្នើលេខ PIN សម្ងាត់ថ្មី។",
        otpAttemptsRemaining: "លេខ PIN សម្ងាត់មិនត្រឹមត្រូវ។ នៅសល់ {attempts} ដង។",
        otpSendFailed: "បរាជ័យក្នុងការផ្ញើលេខ PIN សម្ងាត់។ សូមព្យាយាមម្តងទៀត។",
        resendOTP: "ផ្ញើលេខ PIN សម្ងាត់ម្តងទៀត",
        resendWait: "ផ្ញើលេខ PIN សម្ងាត់ម្តងទៀត ({time})",
        sending: "កំពុងផ្ញើលេខ PIN សម្ងាត់..."
    }
};

// Merge translations with existing ones
Object.assign(translations.en, otpTranslations.en);
Object.assign(translations.kh, otpTranslations.kh);