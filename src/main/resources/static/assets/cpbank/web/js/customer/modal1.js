
//get value when change address
var valueProvinceCode;
$("#province1").change(function() {
    var selectOptionValue = $(this).val();
    valueProvinceCode = selectOptionValue;
    //alert(valueProvinceCode);
    getDistrict(valueProvinceCode);
});

var valueDistrict;
$("#district1").change(function() {
    var selectOptionValue = $(this).val();
    valueDistrict = selectOptionValue;
    //alert(valueProvinceCode);
    getCommune(valueDistrict);
});

var valueCommuneCode;
$("#commune1").change(function() {
    var selectOptionValue = $(this).val();
    valueCommuneCode = selectOptionValue;
    //alert(valueProvinceCode);
    getVillage(valueCommuneCode);
});


// ADDRESS FUNCTION
// --------------------------------------------------------------------
//get province
var PROVINCE_TEXT;
function getPro() {
    // Get the loader element
    var loader = document.getElementById("loadingProvince1");

    // Add the class to show the loader
    loader.classList.add("myloader");
    // Assuming you have a variable named "loader" that references the loader element
    loader.classList.add("myloader");


    $.ajax({
        type: "GET",
        url: "api/v1/masterData/getPro",
        contentType: 'application/json',
        dataType: 'json',
        success: function(response) {
            console.log(response);
            if (response.locations.length > 0) {
                var ddlProvince = $('#province1');
                ddlProvince.empty();

                var defaultOption = new Option('---Choose One---', '');
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
    var loader = document.getElementById("loadingDistrict1");
    // Add the class to show the loader
    loader.classList.add("myloader");

    $.ajax({
        type: "GET",
        url: "api/v1/masterData/getDis/" + id,
        contentType: 'application/json',
        dataType: 'json',
        success: function(response) {
            console.log(response);
            if (response.locations.length > 0) {
                var ddlDistrict = $('#district1');
                ddlDistrict.empty();

                var defaultOption = new Option('---Choose One---', '');
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
    var loader = document.getElementById("loadingCommune1");

    // Add the class to show the loader
    loader.classList.add("myloader");


    $.ajax({
        type: "GET",
        url: "api/v1/masterData/getCom/" + id,
        contentType: 'application/json',
        dataType: 'json',
        success: function(response) {
            console.log(response);
            if (response.locations.length > 0) {
                var ddlCommune = $('#commune1');
                ddlCommune.empty();

                var defaultOption = new Option('---Choose One---', '');
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



//get village
var VILLAGE_TEXT = null;
function getVillage(id) {
    // Get the loader element
    var loader = document.getElementById("loadingVillage1");

    // Add the class to show the loader
    loader.classList.add("myloader");

    $.ajax({
        type: "GET",
        url: "api/v1/masterData/getVil/" + id,
        contentType: 'application/json',
        dataType: 'json',
        success: function(response) {
            console.log(response);
            if (response.locations.length > 0) {
                var ddlVillage = $('#village1');
                ddlVillage.empty();

                var defaultOption = new Option('---Choose One---', '');
                defaultOption.disabled = true; // Disable the option
                defaultOption.selected = true; // Select the option
                ddlVillage.append(defaultOption);

                for (var i = 0; i < response.locations.length; i++) {
                    var VillageData = response.locations[i];
                    var VillageValue = VillageData.VILLAGE_CODE;
                    VILLAGE_TEXT = VillageData.VILLAGE_DESC;
                    var option = new Option(VILLAGE_TEXT, VillageValue);
                    ddlVillage.append(option); // Append the option to the select element
                }
            }
            loader.classList.remove("myloader");
        }
    });
}



//append data to select first option
var defaultOption = new Option('---Choose One---', '');

var ddlProvince1 = $('#province1');
ddlProvince1.empty();
defaultOption.disabled = true; // Disable the option
defaultOption.selected = true; // Select the option
ddlProvince1.append(defaultOption)


var ddlDistrict1 = $('#district1');
ddlDistrict1.empty();
defaultOption.disabled = true; // Disable the option
defaultOption.selected = true; // Select the option
ddlDistrict1.append(defaultOption);

var ddlcommune1 = $('#commune1');
ddlcommune1.empty();
defaultOption.disabled = true; // Disable the option
defaultOption.selected = true; // Select the option
ddlcommune1.append(defaultOption);

var ddlVillage1 = $('#village1');
ddlVillage1.empty();
defaultOption.disabled = true; // Disable the option
defaultOption.selected = true; // Select the option
ddlVillage1.append(defaultOption);



//--------------------- POB Function ------------------------------


//get value when change address
var valueProvinceCodePOB;
$("#provincePOB1").change(function() {
    var selectOptionValue = $(this).val();
    valueProvinceCodePOB = selectOptionValue;
    //alert(valueProvinceCode);
    getDistrictPOB(valueProvinceCodePOB);
});

var valueDistrictPOB;
$("#districtPOB1").change(function() {
    // alert('district change');
    var selectOptionValue = $(this).val();
    valueDistrictPOB = selectOptionValue;
    // alert(valueDistrictPOB);
    getCommunePOB(valueDistrictPOB);
});

var valueCommuneCodePOB;
$("#communePOB1").change(function() {
    var selectOptionValue = $(this).val();
    valueCommuneCodePOB = selectOptionValue;
    //alert(valueProvinceCode);
    getVillagePOB(valueCommuneCodePOB);
});


// ADDRESS FUNCTION
// --------------------------------------------------------------------
//get province
var PROVINCE_TEXT_POB;
function getProPOB() {
    // Get the loader element
    var loader = document.getElementById("loadingProvincePOB1");

    // Add the class to show the loader
    loader.classList.add("myloader");
    // Assuming you have a variable named "loader" that references the loader element
    loader.classList.add("myloader");


    $.ajax({
        type: "GET",
        url: "api/v1/masterData/getPro",
        contentType: 'application/json',
        dataType: 'json',
        success: function(response) {
            console.log(response);
            if (response.locations.length > 0) {
                var ddlProvincePOB = $('#provincePOB1');
                ddlProvincePOB.empty();

                var defaultOption = new Option('---Choose One---', '');
                defaultOption.disabled = true; // Disable the option
                defaultOption.selected = true; // Select the option
                ddlProvincePOB.append(defaultOption);

                for (var i = 0; i < response.locations.length; i++) {
                    var provinceData = response.locations[i];
                    var provinceValue = provinceData.PROVINCE_CODE;
                    PROVINCE_TEXT_POB = provinceData.PROVINCE_DESC;
                    var option = new Option(PROVINCE_TEXT_POB, provinceValue);
                    ddlProvincePOB.append(option); // Append the option to the select element
                }
            }
            loader.classList.remove("myloader");
        }
    });
}

//get district
var DISTRICT_TEXT_POB = null;
function getDistrictPOB(id) {
    // Get the loader element
    var loader = document.getElementById("loadingDistrictPOB1");
    // Add the class to show the loader
    loader.classList.add("myloader");

    $.ajax({
        type: "GET",
        url: "api/v1/masterData/getDis/" + id,
        contentType: 'application/json',
        dataType: 'json',
        success: function(response) {
            console.log(response);
            if (response.locations.length > 0) {
                var districtPOB1 = $('#districtPOB1');
                districtPOB1.empty();

                var defaultOption = new Option('---Choose One---', '');
                defaultOption.disabled = true; // Disable the option
                defaultOption.selected = true; // Select the option
                districtPOB1.append(defaultOption);

                for (var i = 0; i < response.locations.length; i++) {
                    var DistrictData = response.locations[i];
                    var DistrictValue = DistrictData.DISTRICT_CODE;
                    DISTRICT_TEXT_POB = DistrictData.DISTRICT_DESC;
                    var option = new Option(DISTRICT_TEXT_POB, DistrictValue);
                    districtPOB1.append(option); // Append the option to the select element
                }
            }
            loader.classList.remove("myloader");
        }
    });
}


//get commune
var COMMUNE_TEXT_POB = null;
function getCommunePOB(id) {
    // alert(1111);
    // Get the loader element
    var loader = document.getElementById("loadingCommunePOB1");

    // Add the class to show the loader
    loader.classList.add("myloader");


    $.ajax({
        type: "GET",
        url: "api/v1/masterData/getCom/" + id,
        contentType: 'application/json',
        dataType: 'json',
        success: function(response) {
            console.log(response);
            if (response.locations.length > 0) {
                var communePOB1 = $('#communePOB1');
                communePOB1.empty();

                var defaultOption = new Option('---Choose One---', '');
                defaultOption.disabled = true; // Disable the option
                defaultOption.selected = true; // Select the option
                communePOB1.append(defaultOption);

                for (var i = 0; i < response.locations.length; i++) {
                    var CommuneData = response.locations[i];
                    var CommuneValue = CommuneData.COMMUNE_CODE;
                    COMMUNE_TEXT_POB = CommuneData.COMMUNE_DESC;
                    var option = new Option(COMMUNE_TEXT_POB, CommuneValue);
                    communePOB1.append(option); // Append the option to the select element
                }
            }
            loader.classList.remove("myloader");
        }
    });
}



//get village
var VILLAGE_TEXT_POB = null;
function getVillagePOB(id) {
    // Get the loader element
    var loader = document.getElementById("loadingVillagePOB1");

    // Add the class to show the loader
    loader.classList.add("myloader");


    $.ajax({
        type: "GET",
        url: "api/v1/masterData/getVil/" + id,
        contentType: 'application/json',
        dataType: 'json',
        success: function(response) {
            console.log(response);
            if (response.locations.length > 0) {
                var villagePOB1 = $('#villagePOB1');
                villagePOB1.empty();

                var defaultOption = new Option('---Choose One---', '');
                defaultOption.disabled = true; // Disable the option
                defaultOption.selected = true; // Select the option
                villagePOB1.append(defaultOption);

                for (var i = 0; i < response.locations.length; i++) {
                    var VillageData = response.locations[i];
                    var VillageValue = VillageData.VILLAGE_CODE;
                    VILLAGE_TEXT_POB = VillageData.VILLAGE_DESC;
                    var option = new Option(VILLAGE_TEXT_POB, VillageValue);
                    villagePOB1.append(option); // Append the option to the select element
                }
            }
            loader.classList.remove("myloader");
        }
    });
}



var ddlProvincePOB1 = $('#provincePOB1');
ddlProvincePOB1.empty();
defaultOption.disabled = true; // Disable the option
defaultOption.selected = true; // Select the option
ddlProvincePOB1.append(defaultOption)


var districtPOB1 = $('#districtPOB1');
districtPOB1.empty();
defaultOption.disabled = true; // Disable the option
defaultOption.selected = true; // Select the option
districtPOB1.append(defaultOption);

var communePOB1 = $('#communePOB1');
communePOB1.empty();
defaultOption.disabled = true; // Disable the option
defaultOption.selected = true; // Select the option
communePOB1.append(defaultOption);

var villagePOB1 = $('#villagePOB1');
villagePOB1.empty();
defaultOption.disabled = true; // Disable the option
defaultOption.selected = true; // Select the option
villagePOB1.append(defaultOption);



//Submit Address
var form = document.getElementsByClassName('need-novalidate-address');
var validation = Array.prototype.filter.call(form, function(forms) {
    forms.addEventListener('submit', function(event) {
        if (forms.checkValidity() === false) {
            event.preventDefault();
        } else {
            event.preventDefault();
            var submitButtonId = event.submitter.id;
            if (submitButtonId === 'btnSaveAddressFormAll') {

                var provinceCodeTmp = $('#province1').val();
                var districtCodeTmp = $('#district1').val();
                var communeCodeTmp = $('#commune1').val();
                var villageCodeTmp = $('#village1').val();
                if
                (
                    provinceCodeTmp === '0' || provinceCodeTmp === '1' ||
                    provinceCodeTmp === '2' || provinceCodeTmp === '3' ||
                    provinceCodeTmp === '4' || provinceCodeTmp === '5' ||
                    provinceCodeTmp === '6' || provinceCodeTmp === '7' ||
                    provinceCodeTmp === '8' || provinceCodeTmp === '9'
                ){
                    provinceCode = '0'+provinceCodeTmp;
                    districtCode = '0'+districtCodeTmp;
                    communeCode = '0'+communeCodeTmp;
                    villageCode = '0'+villageCodeTmp;
                }else{
                    provinceCode = provinceCodeTmp;
                    districtCode = districtCodeTmp;
                    communeCode = communeCodeTmp;
                    villageCode = villageCodeTmp;
                }

                // pob
                var pobProvinceCodeTmp = $('#provincePOB1').val();
                var pobDistrictCodeTmp = $('#districtPOB1').val();
                var pobCommuneCodeTmp = $('#communePOB1').val();
                var pobVillageCodeTmp = $('#villagePOB1').val();
                if
                (
                    pobProvinceCodeTmp === '0' || pobProvinceCodeTmp === '1' ||
                    pobProvinceCodeTmp === '2' || pobProvinceCodeTmp === '3' ||
                    pobProvinceCodeTmp === '4' || pobProvinceCodeTmp === '5' ||
                    pobProvinceCodeTmp === '6' || pobProvinceCodeTmp === '7' ||
                    pobProvinceCodeTmp === '8' || pobProvinceCodeTmp === '9'
                ){
                    pobProvinceCode = '0'+pobProvinceCodeTmp;
                    pobDistrictCode = '0'+pobDistrictCodeTmp;
                    pobCommuneCode = '0'+pobCommuneCodeTmp;
                    pobVillageCode = '0'+pobVillageCodeTmp;
                }else{
                    pobProvinceCode = pobProvinceCodeTmp;
                    pobDistrictCode = pobDistrictCodeTmp;
                    pobCommuneCode = pobCommuneCodeTmp;
                    pobVillageCode = pobVillageCodeTmp;
                }

                $('#idFormUser1').modal('hide');
                // $('#btnSubmit').removeClass('disabled');
                // $('#btnValidate').addClass('disabled');
                // disableFormFields();
                ValidateNidFace();

            }
            else if (submitButtonId === 'btnSaveAddress'){
                var provinceCodeTmp1 = $('#province2').val();
                var districtCodeTmp1 = $('#district2').val();
                var communeCodeTmp1 = $('#commune2').val();
                var villageCodeTmp1 = $('#village2').val();
                if
                (
                    provinceCodeTmp1 === '0' || provinceCodeTmp1 === '1' ||
                    provinceCodeTmp1 === '2' || provinceCodeTmp1 === '3' ||
                    provinceCodeTmp1 === '4' || provinceCodeTmp1 === '5' ||
                    provinceCodeTmp1 === '6' || provinceCodeTmp1 === '7' ||
                    provinceCodeTmp1 === '8' || provinceCodeTmp1 === '9'
                ){
                    provinceCode = '0'+provinceCodeTmp1;
                    districtCode = '0'+districtCodeTmp1;
                    communeCode = '0'+communeCodeTmp1;
                    villageCode = '0'+villageCodeTmp1;
                }else{
                    provinceCode = provinceCodeTmp1;
                    districtCode = districtCodeTmp1;
                    communeCode = communeCodeTmp1;
                    villageCode = villageCodeTmp1;
                }

                $('#idFormUser2').modal('hide');
                // $('#btnSubmit').removeClass('disabled');
                // $('#btnValidate').addClass('disabled');
                // disableFormFields();
                ValidateNidFace();
            }
            else if (submitButtonId === 'btnSaveAddressPOB'){
                var pobProvinceCodeTmp1 = $('#provincePOB3').val();
                var pobDistrictCodeTmp1 = $('#districtPOB3').val();
                var pobCommuneCodeTmp1 = $('#communePOB3').val();
                var pobVillageCodeTmp1 = $('#villagePOB3').val();

                if
                (
                    pobProvinceCodeTmp1 === '0' || pobProvinceCodeTmp1 === '1' ||
                    pobProvinceCodeTmp1 === '2' || pobProvinceCodeTmp1 === '3' ||
                    pobProvinceCodeTmp1 === '4' || pobProvinceCodeTmp1 === '5' ||
                    pobProvinceCodeTmp1 === '6' || pobProvinceCodeTmp1 === '7' ||
                    pobProvinceCodeTmp1 === '8' || pobProvinceCodeTmp1 === '9'
                ){
                    pobProvinceCode = '0'+pobProvinceCodeTmp1;
                    pobDistrictCode = '0'+pobDistrictCodeTmp1;
                    pobCommuneCode = '0'+pobCommuneCodeTmp1;
                    pobVillageCode = '0'+pobVillageCodeTmp1;
                }else {
                    pobProvinceCode = pobProvinceCodeTmp1;
                    pobDistrictCode = pobDistrictCodeTmp1;
                    pobCommuneCode = pobCommuneCodeTmp1;
                    pobVillageCode = pobVillageCodeTmp1;
                }

                // alert('p: '+pobProvinceCode+' d: '+pobDistrictCode+' c: '+pobCommuneCode+' v: '+pobVillageCode);
                $('#idFormUser3').modal('hide');
                // $('#btnSubmit').removeClass('disabled');
                // $('#btnValidate').addClass('disabled');
                // disableFormFields();
                ValidateNidFace();
            }
        }
        forms.classList.add('was-validated');
    }, false);
});


