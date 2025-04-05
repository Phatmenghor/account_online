

// Translation translations with more comprehensive content
const translations = {
    en: {
        success: "Success!",
        fail: "Failed!",
        alreadyExists: "Account Already Exists!",
        loading: "Processing your request, please wait...",
        error: "Error",
        tryAgain: "Please try again later",
        invalidPhoto: "Invalid photo format or size",
        validationFailed: "Validation Failed",
        incorrectInfo: "Incorrect information:",
        otpSent: "OTP sent successfully",
        otpVerified: "OTP verified successfully",
        otpFailed: "OTP verification failed",
        photoValid: "Your selfie image matches your ID card",
        photoInvalid: "Your selfie image doesn't match your ID card",
        pleaseWait: "Processing, please wait...",
        sending: "Sending, please wait...",
        refresh: "Please refresh the page and try again, or contact support if the issue persists.",
        confirm: "OK"
    },
    kh: {
        success: "ជោគជ័យ!",
        fail: "បរាជ័យ!",
        alreadyExists: "មានគណនីរួចរាល់!",
        loading: "កំពុងដំណើរការ សូមរង់ចាំ...",
        error: "កំហុស",
        tryAgain: "សូមព្យាយាមម្ដងទៀតនៅពេលក្រោយ",
        invalidPhoto: "រូបភាពមិនត្រឹមត្រូវ ឬទំហំមិនត្រឹមត្រូវ",
        validationFailed: "ការផ្ទៀងផ្ទាត់បានបរាជ័យ",
        incorrectInfo: "ព័ត៌មានមិនត្រឹមត្រូវ:",
        otpSent: "បានផ្ញើលេខកូដ OTP ដោយជោគជ័យ",
        otpVerified: "កូដ OTP ត្រឹមត្រូវ",
        otpFailed: "ការផ្ទៀងផ្ទាត់កូដ OTP បានបរាជ័យ",
        photoValid: "រូបថត selfie របស់អ្នកត្រឹមត្រូវជាមួយអត្តសញ្ញាណប័ណ្ណ",
        photoInvalid: "រូបថត selfie របស់អ្នកមិនត្រឹមត្រូវជាមួយអត្តសញ្ញាណប័ណ្ណ",
        pleaseWait: "កំពុងដំណើរការ សូមរង់ចាំ...",
        sending: "កំពុងផ្ញើ សូមរង់ចាំ...",
        refresh: "សូមចាប់ផ្តើមទំព័រឡើងវិញហើយព្យាយាមម្តងទៀត ឬទាក់ទងផ្នែកគាំទ្ររបស់យើងប្រសិនបើបញ្ហានេះនៅតែបន្ត។",
        confirm: "យល់ព្រម"
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
