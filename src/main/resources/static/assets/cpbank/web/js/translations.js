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

// Call this on page load to sync the flag with the current language
function initializeLanguage() {
    const storedLang = localStorage.getItem('selectedLang') || 'en';
    updateLanguageDisplay(storedLang);
}

// Function to change language
function changeLanguage(lang) {
    const currentLang = localStorage.getItem('selectedLang');

    if (lang === currentLang) return;

    localStorage.setItem('selectedLang', lang);
    updateLanguageDisplay(lang);

    $.ajax({
        url: 'api/change-language',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ lang: lang }),
        success: function (response) {
            console.log('Language changed to: ', response.lang);
            location.reload();
        },
        error: function (xhr, status, error) {
            console.error('Error changing language:', error);
        }
    });
}

// Update flag display based on selected language
function updateLanguageDisplay(lang) {
    const flagImage = document.getElementById('current-lang-flag');

    if (!flagImage) return;

    switch (lang) {
        case 'en':
            flagImage.src = '/OpenAcct/assets/cpbank/icon/us-flag.png';
            flagImage.alt = 'English';
            break;
        case 'kh':
            flagImage.src = '/OpenAcct/assets/cpbank/icon/cambodia-flag.png';
            flagImage.alt = 'Khmer';
            break;
        default:
            flagImage.src = '/OpenAcct/assets/cpbank/icon/cambodia-flag.png';
            flagImage.alt = 'Khmer';
    }
}

// Initialize on document ready
document.addEventListener('DOMContentLoaded', initializeLanguage);