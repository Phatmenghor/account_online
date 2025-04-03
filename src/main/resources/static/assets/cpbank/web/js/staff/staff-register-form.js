var dateOfBirthPicker = null;
var issuedDatePicker = null;
var expiredDatePicker = null;
let currentLang = null;
$(document).ready(function () {

    // Initialize language from localStorage or default to 'kh'
    currentLang = localStorage.getItem('selectedLang') || 'kh';

    // Apply the initial language
    updateLanguageDisplay(currentLang);

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

    // Initialize flatpickr for dateOfBirth
    dateOfBirthPicker = $("#dateOfBirth").flatpickr({
        enableTime: false,
        dateFormat: "d/m/Y", // Format: DD/MM/YYYY
        altInput: true,
        altFormat: "d/m/Y",
        allowInput: true, // Allows users to type manually
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

    // Initialize flatpickr for issuedDate
    issuedDatePicker = $("#issuedDate").flatpickr({
        enableTime: false,
        dateFormat: "d/m/Y", // Format: DD/MM/YYYY
        altInput: true,
        altFormat: "d/m/Y",
        allowInput: true, // Allows users to type manually
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

    // Initialize flatpickr for issuedDate
    expiredDatePicker = $("#expiredDate").flatpickr({
        enableTime: false,
        dateFormat: "d/m/Y", // Format: DD/MM/YYYY
        altInput: true,
        altFormat: "d/m/Y",
        allowInput: true, // Allows users to type manually
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


});


const messages = {
    en: {
        success: "Successfully..!",
        fail: "Failed..!",
        alreadyExists: "Already Existed..!"
    },
    kh: {
        success: "ជោគជ័យ..!",
        fail: "បរាជ័យ..!",
        alreadyExists: "មានគណនីរួចរាល់..!"
    }
};

// Function to change language
function changeLanguage(lang) {
    // Check if the selected language is different from the current language
    if (lang === localStorage.getItem('selectedLang')) {
        return;  // Exit if the selected language is the same as the current one
    }

    // Store the selected language in localStorage
    localStorage.setItem('selectedLang', lang);

    // Update the display immediately
    updateLanguageDisplay(lang);

    // Make an AJAX request to change the language on the server side
    $.ajax({
        url: '/change-language',  // Your backend endpoint for changing language
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({lang: lang}),  // Send selected language
        success: function (response) {
            console.log('Language changed to: ', response.lang);
            // Optionally, reload or refresh the page to apply the language change
            location.reload();
        },
        error: function (xhr, status, error) {
            console.error('Error changing language:', error);
        }
    });
}

// Helper function to update language display elements
function updateLanguageDisplay(lang) {
    var flagImage = document.getElementById('current-lang-flag');

    // Update the flag image based on the selected language
    if (lang === 'en') {
        flagImage.src = '/assets/cpbank/icon/us-flag.png';  // English flag
    } else if (lang === 'kh') {
        flagImage.src = '/assets/cpbank/icon/cambodia-flag.png';  // Khmer flag
    }
}


// Function to get translated messages
function getTranslatedMessage(statusCode) {
    // Get the selected language from localStorage (default to 'kh' if not set)
    var language = localStorage.getItem('selectedLang') || 'kh';

    const languageMessages = messages[language];

    if (statusCode == '200') {
        return languageMessages.success;
    } else if (statusCode == '302') {
        return languageMessages.alreadyExists;
    } else if (statusCode == '305' || statusCode == '500' || statusCode == '501') {
        return languageMessages.fail;
    } else {
        return languageMessages.fail;
    }
}


var provinceCode = null;
var districtCode = null;
var communeCode = null;
var villageCode = null;

var pobProvinceCode = null;
var pobDistrictCode = null;
var pobCommuneCode = null;
var pobVillageCode = null;


var legalImageValue = null;
$('#legalIdImage').on('change', function (evt) {
    undisableFormFields();
    const reader = new FileReader();
    reader.onload = function () {
        $('#legalIdImageDisplay').attr('src', event.target.result);
        const base64String = event.target.result.split(',')[1];
        legalImageValue = base64String;

        var json = {
            idImage: base64String,
        };

        showLoading();
        $.ajax({
            type: "POST",
            url: "api/v1/eKYC/extract-nid",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(json),
            success: function (response) {
                console.log(response)
                if (response.error === 0) {
                    if (response.data != null) {
                        hideLoading();
                        populateFormFields(response.data);
                    } else {
                        hideLoading();
                        clearFormFields();
                        $('#legalIdImage').val(null);
                        $('#legalIdImageDisplay').attr('src', '/assets/cpbank/images/National_ID_selfie.png');
                        Swal.fire({
                            title: "Failed...!",
                            text: response.message,
                            icon: "error"
                        });
                    }
                } else {
                    hideLoading();
                    clearFormFields();
                    $('#legalIdImage').val(null);
                    $('#legalIdImageDisplay').attr('src', '/assets/cpbank/images/National_ID_selfie.png');
                    Swal.fire({
                        title: "Failed...!",
                        text: response.message,
                        icon: "error"
                    });
                }
            },
            error: function (xhr, status, error) {
                hideLoading();
                $('#legalIdImage').val(null);
                $('#legalIdImageDisplay').attr('src', '/assets/cpbank/images/National_ID_selfie.png');
                const lang = localStorage.getItem('selectedLang') || 'kh';
                if (lang === 'kh') {
                    handleUploadFailure("បរាជ័យ..!", "មានបញ្ហាបានកើតឡើងសូមព្យាយាមម្ដងទៀតនៅពេលក្រោយ");
                } else {
                    handleUploadFailure("Failed..!", "An error occurred please try again later");
                }
            },
        });

    };
    reader.readAsDataURL(evt.target.files[0]);
});

var selfieImageValue = null;
$('#frontImage').on('change', function (evt) {
    const reader = new FileReader();
    reader.onload = function () {
        $('#imgFrontImageDisplay').attr('src', reader.result)
        const base64String = event.target.result.split(',')[1];
        selfieImageValue = base64String;
    };
    reader.readAsDataURL(evt.target.files[0]);
});

function clearFields() {
    $('#familyName').val('');
    $('#givenName').val('');
    $('#dateOfBirth').val('');
    $('#gender').val('');
    $('#maritalStatus').val('');
    $('#occupation').val('');
    $('#legalId').val('');
    $('#expiredDate').val('');
    $('#legalDocName').val('');
    $('#issuedDate').val('');
    $('#email').val('');
    $('#ddlNationality').val('');
    $('#ddlCostCenter').val('');
    $('#ddlResidence').val('');
    $('#ddlSector').val('');
    $('#ddlIndustry').val('');
    $('#ddlCustomerStatus').val('');
    $('#ddlLoanOfficer').val('');
    $('#ddlOwnerShip').val('');
    $('#ddlTarget').val('');
    $('#ddlLanguage').val('');
    $('#ddlCustomerRate').val('');
    $('#ddlCustomerType').val('');
    $('#ddlProductAccount').val('');
    $('#ddlCustomerRole').val('');
    $('#staffCode').val('');
    $('#company').val('');
    $('#contactNumber').val('');
    $('#otpCode').val('');
    $('#customerPlaceOfBirth').val('');
    $('#customerAddress').val('');
    $('#firstNameKh').val('');
    $('#lastNameKh').val('');

    $('#legalIdImage').val(null);
    $('#legalIdImageDisplay').attr('src', '/assets/cpbank/images/National_ID_selfie.png');
    $('#frontImage').val(null);
    $('#imgFrontImageDisplay').attr('src', '/assets/cpbank/images/image_selfie.jpg');
}

function postData() {
    var familyName = $('#familyName').val();
    var givenName = $('#givenName').val();
    var dateOfBirth = $('#dateOfBirth').val();
    var gender = $('#gender').val();
    var maritalStatus = $('#maritalStatus').val();
    var occupation = $('#occupation').val();

    var province = provinceCode;
    var district = districtCode
    var commune = communeCode
    var village = villageCode

    var pobProvince = pobProvinceCode;
    var pobDistrict = pobDistrictCode;
    var pobCommune = pobCommuneCode;
    var pobVillage = pobVillageCode;

    var legalId = $('#legalId').val();
    var legalExpDate = $('#expiredDate').val();
    var legalDocName = $('#legalDocName').val();
    var legalIssDate = $('#issuedDate').val();
    var email = $('#email').val();
    var nationality = $('#ddlNationality').val();
    var costCenter = $('#ddlCostCenter').val();
    var residence = $('#ddlResidence').val();
    var sector = $('#ddlSector').val();
    var industry = $('#ddlIndustry').val();
    var customerStatus = $('#ddlCustomerStatus').val();
    var loanOfficer = $('#ddlLoanOfficer').val();
    var ownerShip = $('#ddlOwnerShip').val();
    var target = $('#ddlTarget').val();
    var language = $('#ddlLanguage').val();
    var customerRating = $('#ddlCustomerRate').val();
    var customerType = $('#ddlCustomerType').val();

    // Get selected value and split it
    var productAccountValue = $('#ddlProductAccount').val();
    var splitValues = productAccountValue.split('#');
    var lookupId = splitValues[0];
    var category = splitValues[1];

    // alert("Lookup ID: " + lookupId);
    // alert("Category: " + category);

    var productAccount = lookupId;
    var categoryAccount = category;
    var customerRole = $('#ddlCustomerRole').val();

    var staffCode = $('#staffCode').val();
    var company = $('#company').val();
    var branchCode = branchCodeValue;
    var sms = $('#contactNumber').val();
    var otpCode = $('#otpCode').val();
    var placeOfBirth = $('#customerPlaceOfBirth').val();
    var address = $('#customerAddress').val();
    var firstNameKh = $('#firstNameKh').val();
    var lastNameKh = $('#lastNameKh').val();

    var json = {
        "nid_image": legalImageValue,
        "selfie_image": selfieImageValue,
        "family_name": familyName,
        "given_name": givenName,
        "date_of_birth": dateOfBirth,
        "gender": gender,
        "cust_province": province,
        "cust_district": district,
        "cust_commune": commune,
        "cust_village": village,
        "cust_pob_province": pobProvince,
        "cust_pob_district": pobDistrict,
        "cust_pob_commune": pobCommune,
        "cust_pob_village": pobVillage,
        "marital_status": maritalStatus,
        "occupation": occupation,
        "legal_id": legalId,
        "legal_doc_name": legalDocName,
        "legal_exp_date": legalExpDate,
        "legal_iss_date": legalIssDate,
        "email": email,
        "nationality": nationality,
        "cost_center": costCenter,
        "residence": residence,
        "sector": sector,
        "industry": industry,
        "customer_status": customerStatus,
        "loan_officer": loanOfficer,
        "ownership": ownerShip,
        "target": target,
        "language": language,
        "customer_rate": customerRating,
        "customer_type": customerType,
        "staff_code": staffCode,
        "company": company,
        "branch_code": branchCode,
        "product_account": productAccount,
        "category_account": categoryAccount,
        "customer_role": customerRole,
        "sms": sms,
        "otp_code": otpCode,
        "phone_number": sms,
        "place_of_birth": placeOfBirth,
        "address": address,
        "firstNameKh": firstNameKh,
        "lastNameKh": lastNameKh
    };

    console.log(JSON.stringify(json));
    showLoading();
    $.ajax({
        type: "POST",
        url: "api/v1/openAcct/staff-create",
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(json),
        success: function (response) {
            console.log(response);
            hideLoading();
            const statusCode = response.ErrCode;

            const lang = localStorage.getItem('selectedLang') || 'kh';

            // Get translated message based on status code and language
            const message = getTranslatedMessage(statusCode);

            // Content is based on the language
            const content = lang === 'kh' ? response.Content : response.ErrMsg;

            // Show the appropriate alert based on the status code and selected language
            if (statusCode === '200') {
                clearFields();
                showAlert("alert-success", message, content);

            } else if (statusCode === '302') {
                showAlert("alert-info", message, content);

            } else if (statusCode === '305') {
                showAlert("alert-danger", message, content);

            } else if (statusCode === '500') {
                showAlert("alert-danger", message, content);

            } else if (statusCode === '507') {
                showAlert("alert-danger", message, content);
            } else {
                $('#contactNumber').val('');
                $('#otpCode').val('');

                if (language === 'KH') {
                    showAlert("alert-danger", 'បរាជ័យ..!', 'ការស្នើសុំរបស់លោកអ្នកមិនអាចដំណើរការបានទេ។ សូមព្យាយាមម្តងទៀត');
                } else {
                    showAlert("alert-danger", 'Failed..!', 'Account creation failed.');
                }
            }
        },
        error: function (xhr, status, error) {
            hideLoading();
            $('#contactNumber').val('');
            $('#otpCode').val('');

            if (language == '2') {
                showAlert("alert-danger", 'បរាជ័យ..!', 'ការស្នើសុំរបស់លោកអ្នកមិនអាចដំណើរការបានទេ។ សូមព្យាយាមម្តងទៀត');
            } else {
                showAlert("alert-danger", 'Failed..!', 'Account creation failed.');
            }
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
                // alert('you click submit');
                checkAddressCustomer();
            }
        }
        forms.classList.add('was-validated');
    }, false);
});

var isCheckAddressCustomerFound = 0;
var isCheckPOBAddressCustomerFound = 0;

function checkAddressCustomer() {
    // alert(customerAddress);
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
                console.log(response);
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
                Swal.fire({
                    icon: 'error', title: 'Failed...', text: 'Failed to load resource: ' + error,
                });
            },
        });
    }
}

function checkPOBAddressCustomer() {
    // alert(customerPOBAddress);
    if ($("#customerPlaceOfBirth").val() != null) {
        showLoading();
        var json = {
            customer_pob_address: $("#customerPlaceOfBirth").val()
        };

        console.log(JSON.stringify(json));
        $.ajax({
            type: "POST",
            url: "api/v1/eKYC/verify-pob-address",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(json),
            processData: false,
            success: function (response) {
                console.log(response);
                if (response.IsFindAddress == 1) {
                    isCheckPOBAddressCustomerFound = 1;
                    hideLoading();
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
                Swal.fire({
                    icon: 'error', title: 'Failed...', text: 'Failed to load resource: ' + error,
                });
            },
        });
    }
}

// Function to determine which modal to show
function determineModalToShow() {
    console.log('isCheckPobFound: ' + isCheckPOBAddressCustomerFound + ' - ' + 'isCheckAddressFound: ' + isCheckAddressCustomerFound);
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
        // alert(1);
        postData();
    }
}

function showAlert(alertClass, heading, message) {
    var alertElement = $("." + alertClass);
    alertElement.find(".alert-heading").text(heading);
    alertElement.find(".message").text(message);
    alertElement.show();
}

function populateFormFields(data) {
    $('#familyName').val(data.lastNameEn);
    $('#givenName').val(data.firstNameEn);
    dateOfBirthPicker.setDate(data.dob, true);
    $('#gender').val(data.gender === "M" ? "MALE" : "FEMALE");
    $('#legalId').val(data.idNumber);
    document.getElementById("legalDocName").selectedIndex = 1;
    $("#customerPlaceOfBirth").val(data.pob);
    $('#customerAddress').val(data.address);
    $('#firstNameKh').val(data.firstNameKh);
    $('#lastNameKh').val(data.lastNameKh);
    issuedDatePicker.setDate(data.issuedDate,true);
    expiredDatePicker.setDate(data.expiredDate,true);

    // Event listeners for user input
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
        customerAddress = $(this).val();
    });

    $('#firstNameKh').on('input', function () {
        data.firstNameKh = $(this).val();
    });

    $('#lastNameKh').on('input', function () {
        data.lastNameKh = $(this).val();
    });

    $('#issuedDate').on('input', function () {
        data.issuedDate = $(this).val();
    });

    $('#expiredDate').on('input', function () {
        data.expiredDate = $(this).val();
    });
    // Add event listeners for other fields as needed
}

function clearFormFields() {
    $('#firstNameKh').val('');
    $('#lastNameKh').val('');
    $('#familyName').val('');
    $('#givenName').val('');
    $('#dateOfBirth').val('');
    $('#gender').val('');
    $('#legalId').val('');
    document.getElementById("legalDocName").selectedIndex = 0;
    $("#customerPlaceOfBirth").val('');
    $('#customerAddress').val('');
    $('#expiredDate').val('');
    $('#issuedDate').val('');
}

function handleUploadFailure(title, message) {
    hideLoading();
    Swal.fire({
        title: title, text: message, icon: "error"
    });
}


$('#contactNumber').on('change', function () {
    sendOtp();
})

$('#otpCode').on('change', function () {
    const contactNumber = $('#contactNumber');
    const otpCodeField = $(this);
    if (contactNumber != null) {
        $.ajax({
            type: "POST",
            url: "api/v1/otp/verify",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({
                phone_number: contactNumber.val(), otp_code: otpCodeField.val()
            }),
            success: function (response) {
                if (response.status === 'OK') {
                    Toast.fire({
                        icon: 'success', title: response.message
                    });
                    // submitBtn.removeClass('disabled');
                }
            },
            statusCode: {
                400: function ({responseJSON}) {
                    if (responseJSON.status === 'Failed') {
                        Toast.fire({
                            icon: 'error', title: responseJSON.message,
                        });
                        otpCodeField.val(''); // Clear the data in the OTP field on failure
                    }
                    // submitBtn.addClass('disabled');
                }
            }
        }).fail(function () {
            otpCodeField.val(''); // Clear the data in the OTP field on AJAX request failure
        });
    }
});

function sendOtp() {
    const contactNumber = $('#contactNumber');
    if (contactNumber != null) {
        $.ajax({
            type: "POST",
            url: "api/v1/otp/send",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({
                phone: contactNumber.val(), App: '0', Text: ""
            }),
            processData: false,
            success: function (response) {
                Toast.fire({
                    icon: 'success', title: response.message
                })
            },
            statusCode: {
                400: function ({
                                   responseJSON
                               }) {
                    if (responseJSON.status === 'Failed') {
                        Swal.fire({
                            icon: 'error', title: 'Failed...', text: responseJSON.message,
                        })
                    }
                }
            }
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
    document.getElementById("expiredDate").disabled = false;
    document.getElementById("issuedDate").disabled = false;
}

//get value when change address
var valueProvinceCode;
$("#province").change(function () {
    var selectOptionValue = $(this).val();
    valueProvinceCode = selectOptionValue;
    //alert(valueProvinceCode);
    getDistrict(valueProvinceCode);
});

var valueDistrict;
$("#district").change(function () {
    var selectOptionValue = $(this).val();
    valueDistrict = selectOptionValue;
    //alert(valueProvinceCode);
    getCommune(valueDistrict);
});

var valueCommuneCode;
$("#commune").change(function () {
    var selectOptionValue = $(this).val();
    valueCommuneCode = selectOptionValue;
    //alert(valueProvinceCode);
    getVillage(valueCommuneCode);
});


//get province
var PROVINCE_TEXT;

function getPro() {

    // Get the loader element
    var loader = document.getElementById("loadingProvince");

    // Add the class to show the loader
    loader.classList.add("myloader");
    // Assuming you have a variable named "loader" that references the loader element
    loader.classList.add("myloader");

    $.ajax({
        type: "GET", url: "api/v1/masterData/getPro", contentType: 'application/json', dataType: 'json',

        success: function (response) {
            console.log(response);
            if (response.locations.length > 0) {
                var ddlProvince = $('#province');
                ddlProvince.empty();

                var defaultOption = new Option('សូមជ្រើសរើស', '0');
                defaultOption.disabled = true; // Disable the option
                defaultOption.selected = true; // Select the option
                ddlProvince.append(defaultOption);

                for (var i = 0; i < response.locations.length; i++) {
                    var provinceData = response.locations[i];
                    var provinceValue = provinceData.PROVINCE_CODE;
                    PROVINCE_TEXT = provinceData.PROVINCE_DESC;
                    var option = new Option(PROVINCE_TEXT, provinceValue);
                    ddlProvince.append(option); // Append the option to the select element
                }
            }
            loader.classList.remove("myloader");
        }
    });
}

//get district
var DISTRICT_TEXT = null;

function getDistrict(id) {

    // Get the loader element
    var loader = document.getElementById("loadingDistrict");

    // Add the class to show the loader
    loader.classList.add("myloader");

    $.ajax({
        type: "GET",
        url: "api/v1/masterData/getDis/" + id,
        contentType: 'application/json',
        dataType: 'json',
        success: function (response) {
            console.log(response);
            if (response.locations.length > 0) {
                var ddlDistrict = $('#district');
                ddlDistrict.empty();

                var defaultOption = new Option('សូមជ្រើសរើស', '');
                defaultOption.disabled = true; // Disable the option
                defaultOption.selected = true; // Select the option
                ddlDistrict.append(defaultOption);

                for (var i = 0; i < response.locations.length; i++) {
                    var DistrictData = response.locations[i];
                    var DistrictValue = DistrictData.DISTRICT_CODE;
                    DISTRICT_TEXT = DistrictData.DISTRICT_DESC;
                    var option = new Option(DISTRICT_TEXT, DistrictValue);
                    ddlDistrict.append(option); // Append the option to the select element
                }
            }
            loader.classList.remove("myloader");
        }
    });
}

//get commune
var COMMUNE_TEXT = null;

function getCommune(id) {

    // Get the loader element
    var loader = document.getElementById("loadingCommune");

    // Add the class to show the loader
    loader.classList.add("myloader");


    $.ajax({
        type: "GET",
        url: "api/v1/masterData/getCom/" + id,
        contentType: 'application/json',
        dataType: 'json',
        success: function (response) {
            console.log(response);
            if (response.locations.length > 0) {
                var ddlCommune = $('#commune');
                ddlCommune.empty();

                var defaultOption = new Option('សូមជ្រើសរើស', '');
                defaultOption.disabled = true; // Disable the option
                defaultOption.selected = true; // Select the option
                ddlCommune.append(defaultOption);

                for (var i = 0; i < response.locations.length; i++) {
                    var CommuneData = response.locations[i];
                    var CommuneValue = CommuneData.COMMUNE_CODE;
                    COMMUNE_TEXT = CommuneData.COMMUNE_DESC;
                    var option = new Option(COMMUNE_TEXT, CommuneValue);
                    ddlCommune.append(option); // Append the option to the select element
                }
            }
            loader.classList.remove("myloader");
        }
    });
}

function getBranch() {
    $.ajax({
        type: "GET",
        url: "api/v1/masterData/getBranch",
        contentType: 'application/json',
        dataType: 'json',
        success: function (response) {
            console.log(response);
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

// Call the function to populate
getBranch();

var branchCodeValue;
$("#ddlBranch").change(function () {
    var selectOptionValue = $(this).val();
    branchCodeValue = selectOptionValue;
});

function populateDropdown(Type, targetElementId) {
    $.ajax({
        type: "GET",
        url: "api/v1/masterData/getListType/" + Type,
        contentType: 'application/json',
        dataType: 'json',
        success: function (response) {
            console.log(response);
            var targetElement = $('#' + targetElementId);
            // targetElement.empty(); // Clear existing options
            for (var i = 0; i < response.data.length; i++) {
                var data = response.data[i];
                var value = data.LOOKUP_ID;
                var text = data.LOOKUP_ID + ' - ' + data.LOOKUP_NAME;
                var option = new Option(text, value);
                targetElement.append(option); // Append the option to the select element
            }
        }
    });
}

function populateDropdownProductAccount(Type, targetElementId) {
    $.ajax({
        type: "GET", url: "api/v1/masterData/getListType/" + Type, contentType: 'application/json', dataType: 'json',

        success: function (response) {
            console.log(response);
            var targetElement = $('#' + targetElementId);
            // targetElement.empty(); // Clear existing options
            for (var i = 0; i < response.data.length; i++) {
                var data = response.data[i];
                var value = data.LOOKUP_ID + '#' + data.CATEGORY;
                var text = data.LOOKUP_NAME;
                var option = new Option(text, value);
                targetElement.append(option); // Append the option to the select element
            }
        }
    });
}

function populateDropdownMaritalStatus(Type, targetElementId) {
    $.ajax({
        type: "GET",
        url: "api/v1/masterData/getListType/" + Type,
        contentType: 'application/json',
        dataType: 'json',
        success: function (response) {
            console.log(response);
            var targetElement = $('#' + targetElementId);
            // targetElement.empty(); // Clear existing options
            for (var i = 0; i < response.data.length; i++) {
                var data = response.data[i];
                var value = data.LOOKUP_NAME;
                var text = data.LOOKUP_ID + ' - ' + data.LOOKUP_NAME;
                var option = new Option(text, value);
                targetElement.append(option); // Append the option to the select element
            }
        }
    });
}

function populateDropdownCustomerType(Type, targetElementId) {
    $.ajax({
        type: "GET",
        url: "api/v1/masterData/getListType/" + Type,
        contentType: 'application/json',
        dataType: 'json',
        success: function (response) {
            console.log(response);
            var targetElement = $('#' + targetElementId);
            // targetElement.empty(); // Clear existing options
            for (var i = 0; i < response.data.length; i++) {
                var data = response.data[i];
                var value = data.LOOKUP_NAME;
                var text = data.LOOKUP_ID + ' - ' + data.LOOKUP_NAME;
                var option = new Option(text, value);
                targetElement.append(option); // Append the option to the select element
            }
        }
    });
}

function populateDropdownCusRole(Type, targetElementId) {
    $.ajax({
        type: "GET",
        url: "api/v1/masterData/getListType/" + Type,
        contentType: 'application/json',
        dataType: 'json',
        success: function (response) {
            console.log(response);
            var targetElement = $('#' + targetElementId);
            // targetElement.empty(); // Clear existing options
            for (var i = 0; i < response.data.length; i++) {
                var data = response.data[i];
                var value = data.LOOKUP_ID;
                var text = data.LOOKUP_NAME;
                var option = new Option(text, value);
                targetElement.append(option); // Append the option to the select element
            }
        }
    });
}

populateDropdownCustomerType('CUS_TYPE', 'ddlCustomerType');
populateDropdown('COST_CENTER', 'ddlCostCenter');
populateDropdown('SECTOR', 'ddlSector');
populateDropdown('TARGET', 'ddlTarget');
populateDropdown('INDUSTRY', 'ddlIndustry');
populateDropdown('CUS_STATUS', 'ddlCustomerStatus');
populateDropdown('CUS_RATE', 'ddlCustomerRate');
populateDropdown('OWNERSHIP', 'ddlOwnerShip');
// populateDropdownCusRole('CUS_ROLE', 'ddlCustomerRole');
// populateDropdown('NATIONAL', 'ddlNationality');
// populateDropdown('NATIONAL', 'ddlResidence');
populateDropdown('COST_CENTER', 'ddlPrimaryOfficer');
populateDropdownProductAccount('PRODUCT', 'ddlProductAccount');

// populateDropdownMaritalStatus('MARITAL_STATUS', 'maritalStatus');

function getLoanOfficer() {
    $.ajax({
        type: "GET",
        url: "api/v1/masterData/getLoanOfficer",
        contentType: 'application/json',
        dataType: 'json',
        success: function (response) {
            if (response.data.length > 0) {
                var ddlLoanOfficer = $('#ddlLoanOfficer');
                for (var i = 0; i < response.data.length; i++) {
                    var data = response.data[i];
                    var value = data.ID;
                    var text = data.ID + ' - ' + data.NAMELATIN;
                    var option = new Option(text, value);
                    ddlLoanOfficer.append(option); // Append the option to the select element
                }
            }
        }
    });
}

getLoanOfficer();

function getRelationManager() {
    $.ajax({
        type: "GET",
        url: "api/v1/masterData/getLoanOfficer",
        contentType: 'application/json',
        dataType: 'json',
        success: function (response) {
            if (response.data.length > 0) {
                var ddlRelationManager = $('#ddlRelationManager');
                for (var i = 0; i < response.data.length; i++) {
                    var data = response.data[i];
                    var value = data.ID;
                    var text = data.ID + ' - ' + data.NAMELATIN;
                    var option = new Option(text, value);
                    ddlRelationManager.append(option); // Append the option to the select element
                }
            }
        }
    });
}

getRelationManager();

