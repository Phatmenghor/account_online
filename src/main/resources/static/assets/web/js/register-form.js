$(document).ready(function() {

    $('#dateOfBirth').datetimepicker({
        lang: 'en',
        timepicker: false,
        format: 'd/m/Y',
        formatDate: 'Y/m/d'
    });

    // Call the function to populate
    getBranch();
});

const messages = {
    ENG: {
        success: "Successfully..!",
        fail: "Failed..!",
        alreadyExists: "Already Existed..!"
    },
    KH: {
        success: "ជោគជ័យ..!",
        fail: "បរាជ័យ..!",
        alreadyExists: "មានគណនីរួចរាល់..!"
    }
};

let selectedLanguage = $('.dropdown-menu li:first-child').find('span').text();
$('.dropdown-menu a').click(function() {
    selectedLanguage = $(this).find('span').text();
});
// alert(selectedLanguage);

function getTranslatedMessage(language, statusCode) {
    const languageMessages = messages[language];
    if (statusCode === '200') {
        return languageMessages.success;
    } else if (statusCode === '302') {
        return languageMessages.alreadyExists;
    } else if (statusCode === '305') {
        return languageMessages.fail;
    }else if (statusCode === '500') {
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
                // alert('you are click validate');
                verifyCustomerInfo();

            }
        }
        forms.classList.add('was-validated');
    }, false);
});

// SUBMIT DATA
var form = document.getElementsByClassName('need-novalidate-new');
var validation = Array.prototype.filter.call(form, function(forms) {
    forms.addEventListener('submit', function(event) {
        if (forms.checkValidity() === false) {
            event.preventDefault();
        } else {
            event.preventDefault();
            var submitButtonId = event.submitter.id;
            if (submitButtonId === 'btnSubmit') {
                // alert('you click submit');

                var familyName = $('#familyName').val();
                var givenName = $('#givenName').val();
                var dateOfBirth = $('#dateOfBirth').val();
                var gender = $('#gender').val();
                var occupation = $('#occupation').val();
                var province = provinceCode;
                var district = districtCode
                var commune = communeCode
                var village = villageCode

                var pobProvince = pobProvinceCode;
                var pobDistrict = pobDistrictCode;
                var pobCommune = pobCommuneCode;
                var pobVillage = pobVillageCode;

                var staffCode = $('#staffCode').val();
                var company = $('#company').val();
                var legalId = $('#legalId').val();
                var legalExpDate = $('#expiredDate').val();
                var legalDocName = $('#legalDocName').val();
                var legalIssDate = $('#issuedDate').val();
                var branchCode = branchCodeValue;
                var maritalStatus = $('#maritalStatus').val();

                var sms = $('#contactNumber').val();
                var otpCode = $('#otpCode').val();
                var placeOfBirth = $('#customerPlaceOfBirth').val();
                var address = $('#customerAddress').val();
                var firstNameKh = $('#firstNameKh').val();
                var lastNameKh =  $('#lastNameKh').val();

                var json = {
                    "family_name": familyName,
                    "given_name": givenName,
                    "gender": gender,
                    "occupation": occupation,
                    "date_of_birth": dateOfBirth,
                    "cust_province": province,
                    "cust_district": district,
                    "cust_commune": commune,
                    "cust_village": village,
                    "cust_pob_province": pobProvince,
                    "cust_pob_district": pobDistrict,
                    "cust_pob_commune": pobCommune,
                    "cust_pob_village": pobVillage,
                    "legal_id": legalId,
                    "legal_doc_name": legalDocName,
                    "legal_exp_date": legalExpDate,
                    "legal_iss_date": legalIssDate,
                    "staff_code": staffCode,
                    "company": company,
                    "branch_code": branchCode,
                    "sms": sms,
                    "phone_number": sms,
                    "otp_code": otpCode,
                    "marital_status": maritalStatus,
                    "nid_image": legalImageValue,
                    "selfie_image": selfieImageValue,
                    "place_of_birth": placeOfBirth,
                    "address": address,
                    "firstNameKh": firstNameKh,
                    "lastNameKh": lastNameKh
                };

                showLoading();

                $.ajax({
                    type: "POST",
                    url: "api/v1/openAcct/customer-create",
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify(json),
                    success: function(response) {
                        console.log(response);
                        hideLoading();
                        const statusCode = response.ErrCode;

                        const language = selectedLanguage === 'ភាសាខ្មែរ' ? 'KH' : 'ENG';
                        const message = getTranslatedMessage(language, statusCode);
                        const content = language === 'KH' ? response.Content : response.ErrMsg;

                        // Show the appropriate alert based on the status code and selected language
                        if (statusCode === '200') {
                            showAlert("alert-success", message, content);
                            $('#btnValidate').removeClass('disabled');
                            $('#btnSubmit').addClass('disabled');
                        } else if (statusCode === '302') {
                            showAlert("alert-info", message, content);
                            $('#btnValidate').removeClass('disabled');
                            $('#btnSubmit').addClass('disabled');
                        } else if (statusCode === '305') {
                            showAlert("alert-danger", message, content);
                            $('#btnValidate').removeClass('disabled');
                            $('#btnSubmit').addClass('disabled');
                        } else if (statusCode === '500') {
                            showAlert("alert-danger", message, content);
                            $('#btnValidate').removeClass('disabled');
                            $('#btnSubmit').addClass('disabled');
                        }
                        // Reset the form
                        forms.reset();
                        forms.classList.remove('was-validated');
                        $('#legalIdImage').val(null);
                        $('#legalIdImageDisplay').attr('src', '/OpenAcct/assets/images/National_ID_selfie.png');
                        $('#frontImage').val(null);
                        $('#imgFrontImageDisplay').attr('src', '/OpenAcct/assets/images/image_selfie.jpg');
                    },
                    error: function(xhr, status, error) {
                        hideLoading();
                        // Handle error
                        // console.log(xhr.responseText);
                    }
                });
            }
        }
        forms.classList.add('was-validated');
    }, false);
});



function ValidateNidFace() {
    let retryCount = 0;
    const maxRetries = 3;
    showLoading();
    function makeAjaxRequest() {
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
            url: "api/v1/ekyc/verifyNidFaceImage",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(json),
            success: function(response) {
                console.log(response);
                handleAjaxNidValidateSuccess(response);
            },
            error: function(xhr, status, error) {
                if (retryCount < maxRetries) {
                    retryCount++;
                    console.log(`Retry attempt ${retryCount}`);
                    // setTimeout(makeAjaxRequest, 1000 * retryCount);
                    setTimeout(makeAjaxRequest, Math.pow(2, retryCount) * 1000);
                } else {
                    handleAjaxError(xhr, status, error);
                }
            }
        });
    }
    makeAjaxRequest(); // Initial AJAX request
}
function handleAjaxNidValidateSuccess(response){
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
                var incorrectFieldsText = '';
                console.log(incorrectFields);
                const language = selectedLanguage === 'ភាសាខ្មែរ' ? 'KH' : 'ENG';
                var fieldMappings;
                if (language === 'KH') {
                    fieldMappings = {
                        lastNameKh: "នាមត្រកូល",
                        firstNameKh: "នាមខ្លួន",
                        dob: "ថ្ងៃខែឆ្នាំកំណើត (ថ្ងៃ ខែ ឆ្នាំ)",
                        gender: "ភេទ",
                        lastNameEn: "នាមត្រកូល (អក្សរឡាតាំង)",
                        firstNameEn: "នាមខ្លួន (អក្សរឡាតាំង)",
                        issuedDate: "",
                        expiredDate: ""
                    };
                }else{
                    fieldMappings = {
                        lastNameKh: "First Name (KH)",
                        firstNameKh: "Last Name (KH)",
                        dob: "Date of Birth",
                        gender: "Gender",
                        lastNameEn: "Family Name",
                        firstNameEn: "Given Name",
                        issuedDate: "",
                        expiredDate: ""
                    };
                }
                if (Array.isArray(incorrectFields) && incorrectFields.length > 0) {
                    incorrectFieldsText = incorrectFields
                        .filter(field => field !== "issuedDate" && field !== "expiredDate") // Excluding issuedDate and expiredDate
                        .map(function(field) {
                            return fieldMappings[field] ? '- ' + fieldMappings[field] : '- ' + field;
                        }).join('<br />');
                }
                console.log(incorrectFieldsText);
                if (language === 'KH') {
                    var html = '<div style="text-align: start;">' +
                        '<img src="/OpenAcct/assets/icon/success.png" alt="success" style="width: 20px; height: 20px;" />' +
                        'រូបថត selfie របស់អ្នកត្រឹមត្រូវជាមួយអត្តសញ្ញាណប័ណ្ណ (' + score + '%)' +
                        '</div>' +
                        '<div style="text-align: start; margin-top: 10px;">' +
                        '<img src="/OpenAcct/assets/icon/fail1.png" alt="fail" style="width: 16px; height: 16px;" />' +
                        'ព័ត៌មានមិនត្រឹមត្រូវ:' +
                        '<div style="margin-left: 20px; margin-top: 5px;">' +
                        incorrectFieldsText +
                        '</div>' +
                        '</div>';
                    Swal.fire({
                        icon: "warning",
                        title: "បរាជ័យ",
                        html: html
                    });
                } else {
                    var html = '<div style="text-align: start;">' +
                        '<img src="/OpenAcct/assets/icon/success.png" alt="success" style="width: 20px; height: 20px;" />' +
                        'Your selfie image is valid with ID card (' + score + '%)' +
                        '</div>' +
                        '<div style="text-align: start; margin-top: 10px;">' +
                        '<img src="/OpenAcct/assets/icon/fail1.png" alt="fail" style="width: 16px; height: 16px;" />' +
                        'Incorrect information:' +
                        '<div style="margin-left: 20px; margin-top: 5px;">' +
                        incorrectFieldsText +
                        '</div>' +
                        '</div>';
                    Swal.fire({
                        icon: "warning",
                        title: "Failed..!",
                        html: html
                    });
                }
            } else {
                hideLoading();
                checkAddressCustomer();
            }
        } else {
            hideLoading();
            const language = selectedLanguage === 'ភាសាខ្មែរ' ? 'KH' : 'ENG';
            if (language === 'KH') {
                Swal.fire({
                    title: "បរាជ័យ ",
                    html: "រូបភាព Selfie របស់អ្នកមិនត្រឹមត្រូវជាមួយអត្តសញ្ញាណប័ណ្ណទេ " + " " + "(" + score + "%)",
                    icon: "error"
                });
            } else {
                Swal.fire({
                    title: "Failed..!",
                    html: "Your selfie image is not valid with ID " + " " + "(" + score + "%)",
                    icon: "error"
                });
            }
        }
    } else {
        hideLoading();
        Swal.fire({
            title: "Failed...!",
            text: response.message,
            icon: "error"
        });
    }
}

function handleAjaxError(xhr, status, error) {
    hideLoading();
    console.log("XHR status: ", xhr.status);
    console.log("Status: ", status);
    console.log("Error: ", error);

    Swal.fire({
        title: "Error: " + xhr.status,
        text: "Please refresh the page and try again, or contact support if the issue persists.",
        icon: "error",
        timer: 12000,
        timerProgressBar: true,
    });
}


function showAlert(alertClass, heading, message) {
    var alertElement = $("." + alertClass);
    alertElement.find(".alert-heading").text(heading);
    alertElement.find(".message").text(message);
    alertElement.show();
}


//------------------------------------- For Loading -------------------------------
function showLoading() {
    var loadingIndicatorOverlay = document.createElement('div');
    loadingIndicatorOverlay.classList.add('loading-indicator-overlay');

    var loadingIndicator = document.createElement('div');
    loadingIndicator.classList.add('loading-indicator');

    var loadingText = document.createElement('div');
    loadingText.classList.add('loading-text');
    loadingText.textContent = 'Sending, Please wait...';

    loadingIndicatorOverlay.appendChild(loadingIndicator);
    loadingIndicatorOverlay.appendChild(loadingText);
    document.body.appendChild(loadingIndicatorOverlay);

    return true;
}

function hideLoading() {
    var loadingIndicator = document.querySelector('.loading-indicator-overlay');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}
//------------------------------------ For Loading ---------------------------------------

var legalImageValue = null;
$('#legalIdImage').on('change', function(evt) {
    undisableFormFields();
    const reader = new FileReader();
    reader.onload = function() {
        $('#legalIdImageDisplay').attr('src', event.target.result);
        const base64String = event.target.result.split(',')[1];
        legalImageValue = base64String;

        var json = {
            idImage: base64String,
        };

        $('#btnValidate').removeClass('disabled');
        showLoading();
        $.ajax({
            type: "POST",
            url: "api/v1/ekyc/extractNid",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(json),
            success: function(response) {
                console.log(response)
                if (response.error === 0) {
                    if (response.data != null) {
                        hideLoading();
                        $('#btnValidate').removeClass('disabled');
                        $('#btnSubmit').addClass('disabled');
                        populateFormFields(response.data);
                    } else {
                        hideLoading();
                        clearFormFields();
                        $('#legalIdImage').val(null);
                        $('#legalIdImageDisplay').attr('src', '/OpenAcct/assets/images/National_ID_selfie.png');
                        Swal.fire({
                            title: "Failed...!",
                            text: response.message,
                            icon: "error"
                        });
                    }
                }else{
                    hideLoading();
                    clearFormFields();
                    $('#legalIdImage').val(null);
                    $('#legalIdImageDisplay').attr('src', '/OpenAcct/assets/images/National_ID_selfie.png');
                    Swal.fire({
                        title: "Failed...!",
                        text: response.message,
                        icon: "error"
                    });
                }
            },
            error: function(xhr, status, error) {
                hideLoading();
                $('#legalIdImage').val(null);
                $('#legalIdImageDisplay').attr('src', '/OpenAcct/assets/images/National_ID_selfie.png');
                const language = selectedLanguage === 'ភាសាខ្មែរ' ? 'KH' : 'ENG';
                if (language === 'KH') {
                    handleUploadFailure("បរាជ័យ..!", "មានបញ្ហាបានកើតឡើងសូមព្យាយាមម្ដងទៀតនៅពេលក្រោយ");
                } else {
                    handleUploadFailure("Failed..!", "An error occurred please try again later");
                }
            },
        });

    };
    reader.readAsDataURL(evt.target.files[0]);
});

function populateFormFields(data) {
    // Populate form fields with initial data
    $('#familyName').val(data.lastNameEn);
    $('#givenName').val(data.firstNameEn);
    $('#dateOfBirth').val(data.dob);
    $('#gender').val(data.gender === "M" ? "MALE" : "FEMALE");
    $('#legalId').val(data.idNumber);
    document.getElementById("legalDocName").selectedIndex = 1;
    $("#customerPlaceOfBirth").val(data.pob);
    $('#customerAddress').val(data.address);
    $('#firstNameKh').val(data.firstNameKh);
    $('#lastNameKh').val(data.lastNameKh);
    $('#issuedDate').val(data.issuedDate);
    $('#expiredDate').val(data.expiredDate);

    // Check and set default value for issuedDate
    if (!isValidDateFormat(data.issuedDate)) {
        data.issuedDate = '01/01/2021'; // Set default value if not in dd/MM/yyyy format
    }else{
        $('#issuedDate').val(data.issuedDate);
    }


    // Check and set default value for expiredDate
    if (!isValidDateFormat(data.expiredDate)) {
        data.expiredDate = '01/01/2031'; // Set default value if not in dd/MM/yyyy format
    }else{
        $('#expiredDate').val(data.expiredDate);
    }

    // Event listeners for user input
    $('#familyName').on('input', function() {
        data.lastNameEn = $(this).val();
    });

    $('#givenName').on('input', function() {
        data.firstNameEn = $(this).val();
    });

    $('#dateOfBirth').on('input', function() {
        data.dob = $(this).val();
    });

    $('#gender').on('change', function() {
        data.gender = $(this).val() === "MALE" ? "M" : "F";
    });

    $('#legalId').on('input', function() {
        data.idNumber = $(this).val();
    });

    $('#customerPlaceOfBirth').on('input', function() {
        data.pob = $(this).val();
    });

    $('#customerAddress').on('input', function() {
        data.address = $(this).val();
        customerAddress = $(this).val();
    });

    $('#firstNameKh').on('input', function() {
        data.firstNameKh = $(this).val();
    });

    $('#lastNameKh').on('input', function() {
        data.lastNameKh = $(this).val();
    });

    $('#issuedDate').on('input', function() {
        data.issuedDate = $(this).val();
    });

    $('#expiredDate').on('input', function() {
        data.expiredDate = $(this).val();
    });
}

// Function to check if the date is in dd/MM/yyyy format
function isValidDateFormat(dateString) {
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    return dateRegex.test(dateString);
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
function disableFormFields() {
    $('#firstNameKh').prop('readonly', true);
    $('#lastNameKh').prop('readonly', true);
    $('#familyName').prop('readonly', true);
    $('#givenName').prop('readonly', true);
    document.getElementById("legalDocName").disabled = true;
    document.getElementById("gender").disabled = true;
    document.getElementById("dateOfBirth").disabled=true;
    $("#customerPlaceOfBirth").prop('readonly', true);
    $('#customerAddress').prop('readonly', true);
    document.getElementById("expiredDate").disabled=true;
    document.getElementById("issuedDate").disabled=true;
}

function handleUploadFailure(title, message) {
    hideLoading();
    Swal.fire({
        title: title,
        text: message,
        icon: "error",
        timer: 6000,
    });
}

var selfieImageValue = null;
$('#frontImage').on('change', function(evt) {
    const reader = new FileReader();
    reader.onload = function() {
        $('#imgFrontImageDisplay').attr('src', reader.result)
        const base64String = event.target.result.split(',')[1];
        selfieImageValue = base64String;
    };
    reader.readAsDataURL(evt.target.files[0]);
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


        console.log(JSON.stringify(json));
        $.ajax({
            type: "POST",
            url: "api/v1/ekyc/verifyAddress",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(json),
            success: function(response) {
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
            error: function(xhr, status, error) {
                hideLoading();
                Swal.fire({
                    icon: 'error',
                    title: 'Failed...',
                    text: 'Failed to load resource: ' + error,
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

        $.ajax({
            type: "POST",
            url: "api/v1/ekyc/verifyPOBAddress",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(json),
            success: function(response) {
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
            error: function(xhr, status, error) {
                hideLoading();
                Swal.fire({
                    icon: 'error',
                    title: 'Failed...',
                    text: 'Failed to load resource: ' + error,
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
        const language = selectedLanguage === 'ភាសាខ្មែរ' ? 'KH' : 'ENG';
        if (language === 'KH') {
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

$('#contactNumber').on('change', function() {
    sendOtp();
})

$('#otpCode').on('change', function() {
    const contactNumber = $('#contactNumber');
    const otpCodeField = $(this);

    if (contactNumber != null) {
        $.ajax({
            type: "POST",
            url: "api/v1/otp/verify",
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({
                phone_number: contactNumber.val(),
                otp_code: otpCodeField.val()
            }),
            success: function(response) {
                if (response.status === 'OK') {
                    Toast.fire({
                        icon: 'success',
                        title: response.message
                    });
                    // submitBtn.removeClass('disabled');
                }
            },
            statusCode: {
                400: function({ responseJSON }) {
                    if (responseJSON.status === 'Failed') {
                        Swal.fire({
                            icon: 'error',
                            title: 'Failed...',
                            text: responseJSON.message,
                        });
                        otpCodeField.val(''); // Clear the data in the OTP field on failure
                    }
                    // submitBtn.addClass('disabled');
                }
            }
        }).fail(function() {
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
                phone: contactNumber.val(),
                App: '0',
                Text: ""
            }),
            processData: false,
            success: function(response) {
                Toast.fire({
                    icon: 'success',
                    title: response.message
                })
            },
            statusCode: {
                400: function({
                                  responseJSON
                              }) {
                    if (responseJSON.status === 'Failed') {
                        Swal.fire({
                            icon: 'error',
                            title: 'Failed...',
                            text: responseJSON.message,
                        })
                    }
                }
            }
        });
    }
}

function verifyCustomerInfo() {
    const language = selectedLanguage === 'ភាសាខ្មែរ' ? 'KH' : 'ENG';
    const confirmationText = language === 'KH' ? "តើលោកអ្នកបានពិនិត្យព័ត៌មានរបស់អ្នកត្រឹមត្រូវហើយមែនទេ?" : "Have you checked your information correctly?";
    Swal.fire({
        title: "",
        text: confirmationText,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: language === 'KH' ? "#d33" : "#dd3331",
        confirmButtonText: language === 'KH' ? "បាទ/ចាស" : "Yes, I have",
        cancelButtonText: language === 'KH' ? "មិនទាន់ពិនិត្យ" : "No, I have not"
    }).then((result) => {
        if (result.isConfirmed) {
            ValidateNidFace();
        }
    });
}

var branchCodeValue;
$("#ddlBranch").change(function() {
    var selectOptionValue = $(this).val();
    branchCodeValue = selectOptionValue;
});

function getBranch() {

    $.ajax({
        type: "GET",
        url: "api/v1/masterData/getBranch",
        contentType: 'application/json',
        dataType: 'json',
        success: function(response) {
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


