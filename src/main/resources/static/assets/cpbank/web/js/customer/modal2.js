
//get value when change address
var valueProvinceCodeModal2;
$("#province2").change(function() {
    var selectOptionValue = $(this).val();
    valueProvinceCodeModal2 = selectOptionValue;
    //alert(valueProvinceCode);
    getDistrictM2(valueProvinceCodeModal2);
});

var valueDistrictModal2;
$("#district2").change(function() {
    var selectOptionValue = $(this).val();
    valueDistrictModal2 = selectOptionValue;
    //alert(valueProvinceCode);
    getCommuneM2(valueDistrictModal2);
});

var valueCommuneCodeModal2;
$("#commune2").change(function() {
    var selectOptionValue = $(this).val();
    valueCommuneCodeModal2 = selectOptionValue;
    //alert(valueProvinceCode);
    getVillageM2(valueCommuneCodeModal2);
});


// ADDRESS FUNCTION
// --------------------------------------------------------------------
//get province
var PROVINCE_TEXT_M2;
function getProM2() {
    // Get the loader element
    var loader = document.getElementById("loadingProvince2");

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
                var province2 = $('#province2');
                province2.empty();

                var defaultOption = new Option('---Choose One---', '');
                defaultOption.disabled = true; // Disable the option
                defaultOption.selected = true; // Select the option
                province2.append(defaultOption);

                for (var i = 0; i < response.locations.length; i++) {
                    var provinceData = response.locations[i];
                    var provinceValue = provinceData.PROVINCE_CODE;
                    PROVINCE_TEXT_M2 = provinceData.PROVINCE_DESC;
                    var option = new Option(PROVINCE_TEXT_M2, provinceValue);
                    province2.append(option); // Append the option to the select element
                }
            }
            loader.classList.remove("myloader");
        }
    });
}

//get district
var DISTRICT_TEXT_M2 = null;
function getDistrictM2(id) {
    // Get the loader element
    var loader = document.getElementById("loadingDistrict2");
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
                var district2 = $('#district2');
                district2.empty();

                var defaultOption = new Option('---Choose One---', '');
                defaultOption.disabled = true; // Disable the option
                defaultOption.selected = true; // Select the option
                district2.append(defaultOption);

                for (var i = 0; i < response.locations.length; i++) {
                    var DistrictData = response.locations[i];
                    var DistrictValue = DistrictData.DISTRICT_CODE;
                    DISTRICT_TEXT_M2 = DistrictData.DISTRICT_DESC;
                    var option = new Option(DISTRICT_TEXT_M2, DistrictValue);
                    district2.append(option); // Append the option to the select element
                }
            }
            loader.classList.remove("myloader");
        }
    });
}


//get commune
var COMMUNE_TEXT_M2 = null;
function getCommuneM2(id) {
    // Get the loader element
    var loader = document.getElementById("loadingCommune2");

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
                var commune2 = $('#commune2');
                commune2.empty();

                var defaultOption = new Option('---Choose One---', '');
                defaultOption.disabled = true; // Disable the option
                defaultOption.selected = true; // Select the option
                commune2.append(defaultOption);

                for (var i = 0; i < response.locations.length; i++) {
                    var CommuneData = response.locations[i];
                    var CommuneValue = CommuneData.COMMUNE_CODE;
                    COMMUNE_TEXT_M2 = CommuneData.COMMUNE_DESC;
                    var option = new Option(COMMUNE_TEXT_M2, CommuneValue);
                    commune2.append(option); // Append the option to the select element
                }
            }
            loader.classList.remove("myloader");
        }
    });
}



//get village
var VILLAGE_TEXT_M2 = null;
function getVillageM2(id) {
    // Get the loader element
    var loader = document.getElementById("loadingVillage2");

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
                var village2 = $('#village2');
                village2.empty();

                var defaultOption = new Option('---Choose One---', '');
                defaultOption.disabled = true; // Disable the option
                defaultOption.selected = true; // Select the option
                village2.append(defaultOption);

                for (var i = 0; i < response.locations.length; i++) {
                    var VillageData = response.locations[i];
                    var VillageValue = VillageData.VILLAGE_CODE;
                    VILLAGE_TEXT_M2 = VillageData.VILLAGE_DESC;
                    var option = new Option(VILLAGE_TEXT_M2, VillageValue);
                    village2.append(option); // Append the option to the select element
                }
            }
            loader.classList.remove("myloader");
        }
    });
}



//append data to select first option
var defaultOption = new Option('---Choose One---', '');

var ddlProvince2 = $('#province2');
ddlProvince2.empty();
defaultOption.disabled = true; // Disable the option
defaultOption.selected = true; // Select the option
ddlProvince2.append(defaultOption)


var ddlDistrict2 = $('#district2');
ddlDistrict1.empty();
defaultOption.disabled = true; // Disable the option
defaultOption.selected = true; // Select the option
ddlDistrict2.append(defaultOption);

var ddlcommune2 = $('#commune2');
ddlcommune1.empty();
defaultOption.disabled = true; // Disable the option
defaultOption.selected = true; // Select the option
ddlcommune2.append(defaultOption);

var ddlVillage2 = $('#village2');
ddlVillage2.empty();
defaultOption.disabled = true; // Disable the option
defaultOption.selected = true; // Select the option
ddlVillage2.append(defaultOption);


