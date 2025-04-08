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
let isCheckAddressCustomerFound = 0;
let isCheckPOBAddressCustomerFound = 0;
let lang = localStorage.getItem('selectedLang') || 'kh';

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

$('#legalIdImage').on('change', function (evt) {

    const reader = new FileReader();

    reader.onload = function (event) {
        $('#legalIdImageDisplay').attr('src', event.target.result);

        // Directly convert the image to base64 without using canvas
        legalImageValue = event.target.result.split(',')[1];

        var json = {idImage: legalImageValue};

        showLoading();

        $.ajax({
            type: "POST",
            url: "api/v1/eKYC/extract-nid",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(json),
            success: function (response) {
                console.log(response);
                hideLoading();
                const lang = localStorage.getItem('selectedLang') || 'kh';

                if (response.error === 0) {
                    if (response.data !== null) {
                        populateFormFields(response.data);
                    } else {
                        clearFormFields();
                        $('#legalIdImage').val(null);
                        $('#legalIdImageDisplay').attr('src', '/assets/cpbank/images/National_ID_selfie.png');
                        showSweetAlert("error", translations[lang].fail, response.message);
                    }
                } else {
                    hideLoading();
                    $('#legalIdImage').val(null);
                    $('#legalIdImageDisplay').attr('src', '/assets/cpbank/images/National_ID_selfie.png');
                    showSweetAlert("error", translations[lang].fail, response.message);
                }
            },
            error: function (xhr, status, error) {
                hideLoading();
                $('#legalIdImage').val(null);
                $('#legalIdImageDisplay').attr('src', '/assets/cpbank/images/National_ID_selfie.png');

                const lang = localStorage.getItem('selectedLang') || 'kh';
                showSweetAlert("error", translations[lang].fail, translations[lang].tryAgain);
            },
        });
    };

    reader.readAsDataURL(evt.target.files[0]);
});


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

    // Event listeners for user input (Optional, avoid overwriting existing data unnecessarily)
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
    const reader = new FileReader();

    reader.onload = function (event) {
        // Directly set the base64 string without using canvas
        selfieImageValue = event.target.result.split(',')[1];

        // Display the image
        $('#imgFrontImageDisplay').attr('src', event.target.result);
    };

    reader.readAsDataURL(evt.target.files[0]);
});


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
                // alert('you click submit');
                ValidateNidFace();
            }
        }
        forms.classList.add('was-validated');
    }, false);
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

    console.log("json===========> " + json);

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
    // Log the response for better inspection
    console.log("submit response=========> ", response);

    // Extract status code and message from the response
    const statusCode = response.ErrCode;
    // alert(statusCode);

    // Extract content or error message based on the language (Khmer or English)
    let content = lang === "kh" ? response.Content : response.ErrMsg;

    // Determine the alert type based on the status code
    let alertType;
    let header;
    if (statusCode === "200") {
        alertType = "success";
        header = translations[lang].success;
    } else if (statusCode === "302") {
        alertType = "info";
        header = translations[lang].alreadyExists;
    } else {
        alertType = "danger"; // Change this to 'danger' for errors
        header = translations[lang].fail;
    }
    // Show the alert
    showAlert(alertType, header, content);

    // Optionally reset the form if needed
    resetForm();

}


// RESET FORM FUNCTION
function resetForm() {
    $(".need-novalidate-new").removeClass("was-validated").trigger("reset");
    $("#legalIdImage").val(null);
    $("#legalIdImageDisplay").attr("src", "/assets/cpbank/images/National_ID_selfie.png");
    $("#frontImage").val(null);
    $("#imgFrontImageDisplay").attr("src", "/assets/cpbank/images/image_selfie.jpg");
}

function ValidateNidFace() {
    showLoading();

    const json = {
        userInfo: {
            idNumber: $('#legalId').val(),
            firstNameKh: $('#firstNameKh').val(),
            lastNameKh: $('#lastNameKh').val(),
            firstNameEn: $('#givenName').val(),
            lastNameEn: $('#familyName').val(),
            gender: $('#gender').val() === "MALE" ? "M" : "F",
            dob: $('#dateOfBirth').val(),
            issuedDate: $('#issuedDate').val(),
            expiredDate: $('#expiredDate').val()
        },
        faceImg: selfieImageValue,
        idImage: legalImageValue
    };

    $.ajax({
        type: "POST",
        url: "api/v1/eKYC/validate-nid-face",
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
    var score = 0;
    if (response.error === 0) {
        var faceDocumentScore = response.data.faceDocumentScore;
        var faceMoiScore = response.data.faceMoiScore;
        var NidScore = response.data.userInfo.score;
        var parsedScore = parseFloat(faceMoiScore).toFixed(2);
        score = parsedScore * 100;

        if (faceDocumentScore >= 0.50 && faceMoiScore >= 0.50 && NidScore >= 0) {
            hideLoading();
            var incorrectFields = response.data.userInfo.incorrectFields;

            if (incorrectFields.includes("lastNameKh") || incorrectFields.includes("firstNameKh") || incorrectFields.includes("dob") || incorrectFields.includes("gender") || incorrectFields.includes("lastNameEn") || incorrectFields.includes("firstNameEn")) {
                var fieldMappings = {
                    lastNameKh: lang === 'kh' ? "នាមត្រកូល" : "Last Name (KH)",
                    firstNameKh: lang === 'kh' ? "នាមខ្លួន" : "First Name (KH)",
                    dob: lang === 'kh' ? "ថ្ងៃខែឆ្នាំកំណើត (ថ្ងៃ ខែ ឆ្នាំ)" : "Date of Birth",
                    gender: lang === 'kh' ? "ភេទ" : "Gender",
                    lastNameEn: lang === 'kh' ? "នាមត្រកូល (អក្សរឡាតាំង)" : "Family Name",
                    firstNameEn: lang === 'kh' ? "នាមខ្លួន (អក្សរឡាតាំង)" : "Given Name"
                };

                let incorrectFieldsText = incorrectFields
                    .filter(field => fieldMappings[field]) // Filter out undefined fields
                    .map(field => `- ${fieldMappings[field]}`)
                    .join('<br />');

                let htmlContent = `
                    <div style="text-align: start;">
                        <img src="/assets/cpbank/icon/success.png" alt="success" style="width: 20px; height: 20px;" />
                        ${lang === 'kh' ? 'រូបថត selfie របស់អ្នកត្រឹមត្រូវជាមួយអត្តសញ្ញាណប័ណ្ណ' : 'Your selfie image is valid with ID card'} (${score}%)
                    </div>
                    <div style="text-align: start; margin-top: 10px;">
                        <img src="/assets/cpbank/icon/fail1.png" alt="fail" style="width: 16px; height: 16px;" />
                        ${lang === 'kh' ? 'ព័ត៌មានមិនត្រឹមត្រូវ:' : 'Incorrect information:'}
                        <div style="margin-left: 20px; margin-top: 5px;">${incorrectFieldsText}</div>
                    </div>
                `;

                showSweetAlert('warning', lang === 'kh' ? 'បរាជ័យ' : 'Failed..!', htmlContent);
            } else {
                hideLoading();
                checkAddressCustomer();
            }
        } else {
            hideLoading();
            const lang = localStorage.getItem('selectedLang') || 'kh';
            showSweetAlert(
                'error',
                lang === 'kh' ? "បរាជ័យ" : "Failed..!",
                lang === 'kh'
                    ? `រូបភាព Selfie របស់អ្នកមិនត្រឹមត្រូវជាមួយអត្តសញ្ញាណប័ណ្ណទេ (${score}%)`
                    : `Your selfie image is not valid with ID (${score}%)`
            );
        }
    } else {
        hideLoading();
        showSweetAlert('error', translations[lang].fail, response.message);
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


function checkAddressCustomer() {
    // alert(customerAddress);
    if ($("#customerAddress").val() != null) {
        showLoading();
        var json = {
            customer_address: $("#customerAddress").val()
        };

        // console.log(JSON.stringify(json));
        $.ajax({
            type: "POST",
            url: "api/v1/eKYC/verify-address",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(json),
            success: function (response) {
                // console.log(response);
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
                // console.log(response);
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

// Function to determine which modal to show
function determineModalToShow() {
    // console.log('isCheckPobFound: ' + isCheckPOBAddressCustomerFound + ' - ' + 'isCheckAddressFound: ' + isCheckAddressCustomerFound);
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
        submitData();
    }
}

// Detect change in contact number and send OTP
$('#contactNumber').on('change', function () {
    sendOtp();
});

// Detect change in OTP code field and verify the OTP
$('#otpCode').on('change', function () {
    const contactNumberVal = $('#contactNumber').val();
    const otpCodeVal = $(this).val();

    if (contactNumberVal) {
        $.ajax({
            type: "POST",
            url: "api/v1/otp/verify",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({
                phone_number: contactNumberVal,
                otp_code: otpCodeVal
            }),
            success: function (response) {
                if (response.status === 'OK') {
                    const message = translations[lang]?.otpVerified || response.message;
                    Toast.fire({
                        icon: 'success',
                        title: message
                    });
                }
            },
            statusCode: {
                400: function ({responseJSON}) {
                    const message = translations[lang]?.otpFailed || responseJSON?.message || "Verification failed.";
                    showSweetAlert("error", translations[lang]?.fail || "Failed", message);
                    $('#otpCode').val('');
                }
            }
        }).fail(function () {
            $('#otpCode').val('');
            showSweetAlert("error", translations[lang]?.error || "Error", translations[lang]?.tryAgain || "Please try again.");
        });
    }
});

// Send OTP function
function sendOtp() {
    const contactNumberVal = $('#contactNumber').val();

    if (contactNumberVal) {
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
                const message = translations[lang]?.otpSent || response.message;
                Toast.fire({
                    icon: 'success',
                    title: message
                });
            },
            statusCode: {
                400: function ({responseJSON}) {
                    const message = translations[lang]?.otpFailed || responseJSON?.message || "Failed to send OTP.";
                    showSweetAlert("error", translations[lang]?.fail || "Failed", message);
                    $('#otpCode').val('');
                }
            }
        }).fail(function () {
            $('#otpCode').val('');
            showSweetAlert("error", translations[lang]?.error || "Error", translations[lang]?.tryAgain || "Please try again.");
        });
    }
}


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
            // console.log(response);
            if (response.length > 0) {
                var ddlBranch = $('#ddlBranch');
                for (var i = 0; i < response.length; i++) {
                    var Branch = response[i];
                    var branchValue = Branch.BranchID;
                    var branchText = Branch.Branchkh;
                    var option = new Option(branchText, branchValue);
                    ddlBranch.append(option); // Append the option to the select element
                }
            }
        }
    });
}