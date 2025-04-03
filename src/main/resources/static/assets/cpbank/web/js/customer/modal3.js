

//get value when change address
var valueProvinceCodeM3;
$("#provincePOB3").change(function() {
    var selectOptionValue = $(this).val();
    valueProvinceCodeM3 = selectOptionValue;
    //alert(valueProvinceCode);
    getDistrictPOBM3(valueProvinceCodeM3);
});

var valueDistrictPOBM3;
$("#districtPOB3").change(function() {
    var selectOptionValue = $(this).val();
    valueDistrictPOBM3 = selectOptionValue;
    //alert(valueProvinceCode);
    getCommunePOBM3(valueDistrictPOBM3);
});

var valueCommuneCodePOBM3;
$("#communePOB3").change(function() {
    var selectOptionValue = $(this).val();
    valueCommuneCodePOBM3 = selectOptionValue;
    //alert(valueProvinceCode);
    getVillagePOBM3(valueCommuneCodePOBM3);
});


// ADDRESS FUNCTION
// --------------------------------------------------------------------
//get province
var PROVINCE_TEXT_POB_M3;
function getProPOBM3() {
    // Get the loader element
    var loader = document.getElementById("loadingProvincePOB3");

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
                var provincePOB3 = $('#provincePOB3');
                provincePOB3.empty();

                var defaultOption = new Option('---Choose One---', '');
                defaultOption.disabled = true; // Disable the option
                defaultOption.selected = true; // Select the option
                provincePOB3.append(defaultOption);

                for (var i = 0; i < response.locations.length; i++) {
                    var provinceData = response.locations[i];
                    var provinceValue = provinceData.PROVINCE_CODE;
                    PROVINCE_TEXT_POB_M3 = provinceData.PROVINCE_DESC;
                    var option = new Option(PROVINCE_TEXT_POB_M3, provinceValue);
                    provincePOB3.append(option); // Append the option to the select element
                }
            }
            loader.classList.remove("myloader");
        }
    });
}

//get district
var DISTRICT_TEXT_POB_M3 = null;
function getDistrictPOBM3(id) {
    // Get the loader element
    var loader = document.getElementById("loadingDistrictPOB3");
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
                var districtPOB3 = $('#districtPOB3');
                districtPOB3.empty();

                var defaultOption = new Option('---Choose One---', '');
                defaultOption.disabled = true; // Disable the option
                defaultOption.selected = true; // Select the option
                districtPOB3.append(defaultOption);

                for (var i = 0; i < response.locations.length; i++) {
                    var DistrictData = response.locations[i];
                    var DistrictValue = DistrictData.DISTRICT_CODE;
                    DISTRICT_TEXT_POB_M3 = DistrictData.DISTRICT_DESC;
                    var option = new Option(DISTRICT_TEXT_POB_M3, DistrictValue);
                    districtPOB3.append(option); // Append the option to the select element
                }
            }
            loader.classList.remove("myloader");
        }
    });
}


//get commune
var COMMUNE_TEXT_POB_M3 = null;
function getCommunePOBM3(id) {
    // Get the loader element
    var loader = document.getElementById("loadingCommunePOB3");

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
                var communePOB3 = $('#communePOB3');
                communePOB3.empty();

                var defaultOption = new Option('---Choose One---', '');
                defaultOption.disabled = true; // Disable the option
                defaultOption.selected = true; // Select the option
                communePOB3.append(defaultOption);

                for (var i = 0; i < response.locations.length; i++) {
                    var CommuneData = response.locations[i];
                    var CommuneValue = CommuneData.COMMUNE_CODE;
                    COMMUNE_TEXT_POB_M3 = CommuneData.COMMUNE_DESC;
                    var option = new Option(COMMUNE_TEXT_POB_M3, CommuneValue);
                    communePOB3.append(option); // Append the option to the select element
                }
            }
            loader.classList.remove("myloader");
        }
    });
}



//get village
var VILLAGE_TEXT_POB_M3 = null;
function getVillagePOBM3(id) {
    // Get the loader element
    var loader = document.getElementById("loadingVillagePOB3");

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
                var villagePOB3 = $('#villagePOB3');
                villagePOB3.empty();

                var defaultOption = new Option('---Choose One---', '');
                defaultOption.disabled = true; // Disable the option
                defaultOption.selected = true; // Select the option
                villagePOB3.append(defaultOption);

                for (var i = 0; i < response.locations.length; i++) {
                    var VillageData = response.locations[i];
                    var VillageValue = VillageData.VILLAGE_CODE;
                    VILLAGE_TEXT_POB_M3 = VillageData.VILLAGE_DESC;
                    var option = new Option(VILLAGE_TEXT_POB_M3, VillageValue);
                    villagePOB3.append(option); // Append the option to the select element
                }
            }
            loader.classList.remove("myloader");
        }
    });
}



var ddlProvincePOB3 = $('#provincePOB3');
ddlProvincePOB3.empty();
defaultOption.disabled = true; // Disable the option
defaultOption.selected = true; // Select the option
ddlProvincePOB3.append(defaultOption)


var districtPOB3 = $('#districtPOB3');
districtPOB3.empty();
defaultOption.disabled = true; // Disable the option
defaultOption.selected = true; // Select the option
districtPOB3.append(defaultOption);

var communePOB3 = $('#communePOB3');
communePOB3.empty();
defaultOption.disabled = true; // Disable the option
defaultOption.selected = true; // Select the option
communePOB3.append(defaultOption);

var villagePOB3 = $('#villagePOB3');
villagePOB3.empty();
defaultOption.disabled = true; // Disable the option
defaultOption.selected = true; // Select the option
villagePOB3.append(defaultOption);

