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

// Global OTP Manager instance
let otpManager = null;

$(document).ready(function () {
    console.log('Document ready - initializing components');

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

    // Initialize OTP Manager
    otpManager = new OTPManager();
//    console.log('OTP Manager initialized:', otpManager);

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

// Enhanced OTP Management System with Per-Phone Ban and Debouncing
class OTPManager {
    constructor() {
        this.countdownInterval = null;
        this.banCountdownInterval = null;
        this.resendCountdownSeconds = 60;
        this.failedAttempts = 0;
        this.maxFailedAttempts = 3;
        this.currentPhoneNumber = null;
        this.isOTPVerified = false;
        this.bannedPhones = new Map(); // Store ban info per phone number
        this.lang = localStorage.getItem('selectedLang') || 'kh';

        // Prevent multiple simultaneous API calls
        this.isVerifyingOTP = false;
        this.isSendingOTP = false;

        this.init();
    }

    init() {
        // Delay binding to ensure DOM is ready
        setTimeout(() => {
            this.bindEvents();
            this.loadState();
            this.updateUILanguage();
//            console.log('OTP Manager fully initialized');
        }, 100);
    }

    bindEvents() {
//        console.log('Binding OTP events...');

        // Check if required elements exist before binding
        if (!$('#contactNumber').length || !$('#otpCode').length || !$('#resendOTPBtn').length) {
//            console.warn('OTP elements not found, skipping event binding');
            return;
        }

        // Phone number change event - ONLY on blur (leaving field)
        $('#contactNumber').off('blur').on('blur', (e) => {
            const newPhoneNumber = $(e.target).val().trim();
//            console.log('Phone number blur event triggered:', newPhoneNumber);

            if (newPhoneNumber && newPhoneNumber !== this.currentPhoneNumber && newPhoneNumber.length >= 9) {
//                console.log('Phone number meets criteria, sending OTP');

                // Clear any previous ban countdown when switching phone numbers
                this.clearBanCountdown();

                // Update current phone number
                this.currentPhoneNumber = newPhoneNumber;
                this.resetOTPState();

                // Check if this phone number is banned
                if (this.isPhoneBanned(newPhoneNumber)) {
                    this.showPhoneBanStatus(newPhoneNumber);
                    return;
                }

                // Phone is not banned, clear any previous ban status and send OTP
                this.updateOTPStatus('', ''); // Clear any previous ban messages
                this.enableResendButton(); // Make sure resend button is enabled

                setTimeout(() => {
                    this.sendOTP();
                }, 200);
            }
        });

        // OTP code input event with debouncing to prevent multiple calls
        let otpTimeout = null;
        $('#otpCode').off('input keyup').on('input keyup', (e) => {
            const otpCode = $(e.target).val().trim();
//            console.log('OTP code input:', otpCode, 'Length:', otpCode.length);

            // Clear previous timeout
            if (otpTimeout) {
                clearTimeout(otpTimeout);
            }

            if (otpCode && otpCode.length === 6) {
//                console.log('OTP code complete, will verify after delay...');
                // Debounce - wait 500ms before verifying to prevent multiple calls
                otpTimeout = setTimeout(() => {
                    if (!this.isVerifyingOTP) { // Prevent multiple simultaneous calls
                        this.verifyOTP(otpCode);
                    }
                }, 500);
            }
        });

        // Resend button click
        $('#resendOTPBtn').off('click').on('click', (e) => {
            e.preventDefault();
//            console.log('Resend button clicked, disabled:', this.isResendDisabled());

            if (!this.isResendDisabled() && !this.isSendingOTP) {
                this.sendOTP();
            }
        });

//        console.log('OTP Manager events bound successfully');
    }

    loadState() {
        try {
            const savedState = sessionStorage.getItem('otpState');
            if (savedState) {
                const state = JSON.parse(savedState);
                this.failedAttempts = state.failedAttempts || 0;
                this.currentPhoneNumber = state.currentPhoneNumber || null;
                this.isOTPVerified = state.isOTPVerified || false;

                // Load banned phones map
                if (state.bannedPhones) {
                    this.bannedPhones = new Map(state.bannedPhones);
                    // Clean up expired bans
                    this.cleanExpiredBans();
                }

                // Update UI based on loaded state
                if (this.currentPhoneNumber) {
                    const phoneField = $('#contactNumber');
                    if (phoneField.length) {
                        phoneField.val(this.currentPhoneNumber);
                    }

                    // Check if current phone is banned
                    if (this.isPhoneBanned(this.currentPhoneNumber)) {
                        this.showPhoneBanStatus(this.currentPhoneNumber);
                    }
                }

                if (this.isOTPVerified) {
                    this.updateOTPStatus(this.getTranslation('otpVerified'), 'success');
                }
            }
        } catch (e) {
            console.warn('Failed to load OTP state:', e);
        }
    }

    saveState() {
        try {
            const state = {
                failedAttempts: this.failedAttempts,
                currentPhoneNumber: this.currentPhoneNumber,
                isOTPVerified: this.isOTPVerified,
                bannedPhones: Array.from(this.bannedPhones.entries()) // Convert Map to Array for storage
            };
            sessionStorage.setItem('otpState', JSON.stringify(state));
        } catch (e) {
            console.warn('Failed to save OTP state:', e);
        }
    }

    resetOTPState() {
        this.isOTPVerified = false;
        const otpCodeField = $('#otpCode');
        if (otpCodeField.length) {
            otpCodeField.val('');
        }
        // Clear any ban countdown when resetting OTP state
        this.clearBanCountdown();
        this.updateOTPStatus('');
        this.saveState();
    }

    // Phone-specific ban methods
    isPhoneBanned(phoneNumber) {
        if (!phoneNumber || !this.bannedPhones.has(phoneNumber)) {
            return false;
        }

        const banInfo = this.bannedPhones.get(phoneNumber);
        const now = new Date();

        if (banInfo.banEndTime && now < new Date(banInfo.banEndTime)) {
            return true;
        } else {
            // Ban expired, remove it
            this.bannedPhones.delete(phoneNumber);
            this.saveState();
            return false;
        }
    }

    banPhone(phoneNumber, banTimeSeconds) {
        const cleanSeconds = Math.floor(Math.abs(parseInt(banTimeSeconds) || 0));
        const banEndTime = new Date(Date.now() + (cleanSeconds * 1000));

        this.bannedPhones.set(phoneNumber, {
            banEndTime: banEndTime.toISOString(),
            banTimeSeconds: cleanSeconds
        });

        this.saveState();
//        console.log(`Phone ${phoneNumber} banned for ${cleanSeconds} seconds`);
    }

    showPhoneBanStatus(phoneNumber) {
        if (!this.isPhoneBanned(phoneNumber)) return;

        const banInfo = this.bannedPhones.get(phoneNumber);
        const rawSeconds = Math.max(0, (new Date(banInfo.banEndTime) - new Date()) / 1000);
        const remainingSeconds = Math.floor(rawSeconds);

        if (remainingSeconds > 0) {
            this.disableResendButton();
            const banTimeFormatted = this.formatTime(remainingSeconds);
            this.updateOTPStatus(this.getTranslation('accountBanned').replace('{time}', banTimeFormatted), 'error');
            this.startPhoneBanCountdown(phoneNumber, remainingSeconds);
//            console.log(`Phone ban status: ${remainingSeconds} seconds -> ${banTimeFormatted}`);
        } else {
            this.bannedPhones.delete(phoneNumber);
            this.saveState();
        }
    }

    cleanExpiredBans() {
        const now = new Date();
        for (const [phoneNumber, banInfo] of this.bannedPhones.entries()) {
            if (now >= new Date(banInfo.banEndTime)) {
                this.bannedPhones.delete(phoneNumber);
            }
        }
        this.saveState();
    }

    resetBanState() {
        // This method is kept for backward compatibility but now works with current phone
        if (this.currentPhoneNumber && this.bannedPhones.has(this.currentPhoneNumber)) {
            this.bannedPhones.delete(this.currentPhoneNumber);
            this.saveState();
            this.clearBanCountdown();
            this.enableResendButton();
//            console.log(`Ban state reset for phone: ${this.currentPhoneNumber}`);
        }
    }

    sendOTP() {
//        console.log('sendOTP called');

        // Prevent multiple simultaneous calls
        if (this.isSendingOTP) {
//            console.log('Already sending OTP, skipping...');
            return;
        }

        const phoneField = $('#contactNumber');
        if (!phoneField.length) {
            console.error('Phone number field not found');
            return;
        }

        const phoneNumber = phoneField.val().trim();
//        console.log('Sending OTP to:', phoneNumber);

        if (!phoneNumber || phoneNumber.length < 9) {
            showSweetAlert('error', this.getTranslation('error'), this.getTranslation('invalidPhoneNumber'));
            return;
        }

        // Check if this specific phone number is banned
        if (this.isPhoneBanned(phoneNumber)) {
            this.showPhoneBanStatus(phoneNumber);
            return;
        }

        this.isSendingOTP = true; // Set flag to prevent multiple calls
        this.updateOTPStatus(this.getTranslation('sendingOTP'), 'info');
        this.disableResendButton();
        // Removed showLoading() - only show status message under input

        const requestData = {
            phone: phoneNumber,
            App: '0',
            Text: ""
        };

//        console.log('Sending AJAX request to:', "api/v1/otp/send", requestData);

        $.ajax({
            type: "POST",
            url: "api/v1/otp/send",
            contentType: 'application/json',
            data: JSON.stringify(requestData),
            beforeSend: function() {
//                console.log('AJAX request started for OTP send');
            },
            success: (response) => {
                this.isSendingOTP = false; // Reset flag
                // Removed hideLoading() - no modal to hide
                console.log('Hi', response);
                this.handleSendOTPSuccess(response);
            },
            error: (xhr, status, error) => {
                this.isSendingOTP = false; // Reset flag
                // Removed hideLoading() - no modal to hide
                console.log('Hi', xhr.status, xhr.responseText, status, error);
                this.handleSendOTPError(xhr, status, error);
            }
        });
    }

    handleSendOTPSuccess(response) {
//        console.log('Send OTP Response:', response);

        // Clear any previous ban countdown when OTP is successfully processed
        this.clearBanCountdown();

        // Handle direct number response (status 200 with number)
        if (typeof response === 'number') {
            if (response > 0) {
                // Positive number = OTP sent successfully (6 digits = OTP code)
                const message = this.getTranslation('otpSent');
                this.updateOTPStatus(message, 'success');
                this.startResendCountdown();

                Toast.fire({
                    icon: 'success',
                    title: message
                });
            } else if (response === -500) {
                // -500 = Phone banned for verification, need to get actual ban time
//                console.log('Phone number banned (-500), checking ban status...');
                this.checkBanStatus();
            } else if (response < 0 && response >= -60) {
                // Negative numbers from -60 to -1 = wait time in seconds before next send
                const waitSeconds = Math.abs(response);
//                console.log(`Wait time: ${waitSeconds} seconds`);
                this.startResendCountdown(waitSeconds);
                const message = this.getTranslation('waitBeforeResend').replace('{time}', this.formatTime(waitSeconds));
                this.updateOTPStatus(message, 'warning');

                Toast.fire({
                    icon: 'info',
                    title: message
                });
            }
        } else if (response && typeof response === 'object' && response.status === 'OK') {
            // Handle object response with status OK
            const message = response.message || this.getTranslation('otpSent');
            this.updateOTPStatus(message, 'success');
            this.startResendCountdown();

            Toast.fire({
                icon: 'success',
                title: message
            });
        } else {
            // Fallback - treat as success
            this.updateOTPStatus(this.getTranslation('otpSent'), 'success');
            this.startResendCountdown();

            Toast.fire({
                icon: 'success',
                title: this.getTranslation('otpSent')
            });
        }
    }

    handleSendOTPError(xhr, status, error) {
//        console.log('Send OTP Error:', xhr.status, xhr.responseText);
        let errorMessage = this.getTranslation('otpSendFailed');

        try {
            const response = JSON.parse(xhr.responseText);

            if (response.message) {
                if (response.message.includes('TOO_MANY_ATTEMPTS')) {
                    // Backend sends format: "TOO_MANY_ATTEMPTS-298"
                    const parts = response.message.split('-');
                    if (parts.length > 1) {
                        const banTime = parseInt(parts[1]);

                        if (!isNaN(banTime) && banTime > 0) {
//                            console.log(`Ban time from send error: ${banTime} seconds`);
                            this.handleBanResponse(banTime);
                            return;
                        }
                    }

                    // Fallback to default ban time if parsing fails
//                    console.log('Failed to parse ban time, using default 5 minutes');
                    this.handleBanResponse(300);
                    return;
                }
                errorMessage = this.translateAPIMessage(response.message);
            }
        } catch (e) {
            console.warn('Failed to parse error response:', e);
        }

        this.updateOTPStatus(errorMessage, 'error');
        showSweetAlert('error', this.getTranslation('error'), errorMessage);
        this.enableResendButton();
    }

    verifyOTP(otpCode) {
//        console.log('verifyOTP called with code:', otpCode);

        // Prevent multiple simultaneous calls
        if (this.isVerifyingOTP) {
//            console.log('Already verifying OTP, skipping...');
            return;
        }

        const phoneField = $('#contactNumber');
        if (!phoneField.length) {
            console.error('Phone number field not found');
            return;
        }

        const phoneNumber = phoneField.val().trim();
        if (!phoneNumber) {
            showSweetAlert('error', this.getTranslation('error'), this.getTranslation('enterPhoneFirst'));
            return;
        }

        // Check if this specific phone number is banned
        if (this.isPhoneBanned(phoneNumber)) {
            this.showPhoneBanStatus(phoneNumber);
            return;
        }

        this.isVerifyingOTP = true; // Set flag to prevent multiple calls
        this.updateOTPStatus(this.getTranslation('verifyingOTP'), 'info');
        showLoading(this.getTranslation('verifyingOTP'));

        const requestData = {
            phone_number: phoneNumber,
            otp_code: parseInt(otpCode)
        };

//        console.log('Sending verify OTP request:', requestData);

        $.ajax({
            type: "POST",
            url: "api/v1/otp/verify",
            contentType: 'application/json',
            data: JSON.stringify(requestData),
            success: (response) => {
                this.isVerifyingOTP = false; // Reset flag
                hideLoading();
//                console.log('Verify OTP success:', response);
                this.handleVerifyOTPSuccess(response);
            },
            error: (xhr, status, error) => {
                this.isVerifyingOTP = false; // Reset flag
                hideLoading();
//                console.log('Verify OTP error:', xhr.status, xhr.responseText);
                this.handleVerifyOTPError(xhr, status, error);
            }
        });
    }

    handleVerifyOTPSuccess(response) {
//        console.log('Verify OTP Success:', response);
        let message = this.getTranslation('otpVerified');

        // Handle different response formats
        if (response && typeof response === 'object' && response.status === 'OK') {
            message = this.translateAPIMessage(response.message) || message;
        } else if (typeof response === 'string') {
            try {
                const parsedResponse = JSON.parse(response);
                if (parsedResponse.status === 'OK') {
                    message = this.translateAPIMessage(parsedResponse.message) || message;
                }
            } catch (e) {
                message = this.getTranslation('otpVerified');
            }
        }

        this.isOTPVerified = true;
        this.failedAttempts = 0;
        this.updateOTPStatus(message, 'success');
        this.saveState();

        Toast.fire({
            icon: 'success',
            title: message
        });

        this.onOTPVerified();
    }

    handleVerifyOTPError(xhr, status, error) {
//        console.log('Verify OTP Error:', xhr.status, xhr.responseText);
        let errorMessage = this.getTranslation('otpVerifyFailed');

        try {
            const response = JSON.parse(xhr.responseText);

            if (response.message) {
                if (response.message.includes('TOO_MANY_ATTEMPTS')) {
                    // Backend sends format: "TOO_MANY_ATTEMPTS-298"
                    const parts = response.message.split('-');
                    if (parts.length > 1) {
                        const banTime = parseInt(parts[1]);

                        if (!isNaN(banTime) && banTime > 0) {
//                            console.log(`Ban time from verify error: ${banTime} seconds`);
                            this.handleBanResponse(banTime);
                            return;
                        }
                    }

                    // Fallback to default ban time if parsing fails
//                    console.log('Failed to parse ban time, using default 5 minutes');
                    this.handleBanResponse(300);
                    return;
                }

                errorMessage = this.translateAPIMessage(response.message);

                // Increment failed attempts for invalid OTP (but not for expired or banned)
                if (response.message === 'OTP_INVALID') {
                    this.failedAttempts++;
                    this.saveState();
                }
            }
        } catch (e) {
            console.warn('Failed to parse error response:', e);
            this.failedAttempts++;
            this.saveState();
        }

        // Clear OTP field and show error using consistent pattern
        const otpCodeField = $('#otpCode');
        if (otpCodeField.length) {
            otpCodeField.val('');
        }
        this.updateOTPStatus(errorMessage, 'error');
        showSweetAlert('error', this.getTranslation('error'), errorMessage);
    }

    checkBanStatus() {
        // When -500 is returned from send OTP, call verify API to get actual ban time
        const phoneField = $('#contactNumber');
        if (!phoneField.length) {
            console.error('Phone number field not found');
            this.handleBanResponse(300);
            return;
        }

        const phoneNumber = phoneField.val().trim();
        if (!phoneNumber) {
            // Fallback to 5 minutes if no phone number
            this.handleBanResponse(300);
            return;
        }

//        console.log('Checking ban status by calling verify API...');

        const requestData = {
            phone_number: phoneNumber,
            otp_code: 123456 // Dummy OTP to trigger ban response
        };

        $.ajax({
            type: "POST",
            url: "api/v1/otp/verify",
            contentType: 'application/json',
            data: JSON.stringify(requestData),
            success: (response) => {
                // This shouldn't happen when checking ban status
//                console.log('Unexpected success from ban check:', response);
                // Fallback to 5 minutes
                this.handleBanResponse(300);
            },
            error: (xhr, status, error) => {
//                console.log('Ban check error response:', xhr.responseText);
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.message && response.message.includes('TOO_MANY_ATTEMPTS')) {
                        const parts = response.message.split('-');
                        if (parts.length > 1) {
                            const banTime = parseInt(parts[1]);

                            if (!isNaN(banTime) && banTime > 0) {
//                                console.log(`Actual ban time: ${banTime} seconds`);
                                this.handleBanResponse(banTime);
                            } else {
                                // Default to 5 minutes if parsing fails
                                this.handleBanResponse(300);
                            }
                        } else {
                            // Default to 5 minutes if no time specified
                            this.handleBanResponse(300);
                        }
                    } else {
                        // Fallback to 5 minutes for any other error
                        this.handleBanResponse(300);
                    }
                } catch (e) {
                    // Fallback to 5 minutes ban if parsing fails
                    console.warn('Failed to parse ban check response:', e);
                    this.handleBanResponse(300);
                }
            }
        });
    }

    translateAPIMessage(message) {
        const translations = {
            'OTP_VERIFIED': this.getTranslation('otpVerified'),
            'OTP_INVALID': this.getTranslation('otpInvalid'),
            'OTP_EXPIRED': this.getTranslation('otpExpired'),
            'TOO_MANY_ATTEMPTS': this.getTranslation('tooManyAttempts')
        };

        return translations[message] || message;
    }

    handleBanResponse(banTimeSeconds) {
        const cleanSeconds = Math.floor(Math.abs(parseInt(banTimeSeconds) || 0));

//        console.log(`Handling ban: ${cleanSeconds} seconds`);

        // Use clean seconds for ban end time calculation
        this.banEndTime = new Date(Date.now() + (cleanSeconds * 1000));
        this.isBanned = true;
        this.saveState();

        // Show ban alert using consistent pattern
        this.showBanAlert(cleanSeconds);
        this.disableResendButton();
    }

    showBanAlert(banTimeSeconds = null) {
        // Calculate remaining ban time
        let remainingSeconds = 0;

        if (banTimeSeconds !== null) {
            remainingSeconds = Math.floor(Math.abs(parseInt(banTimeSeconds) || 0));
        } else if (this.banEndTime) {
            const rawSeconds = Math.max(0, (this.banEndTime - new Date()) / 1000);
            remainingSeconds = Math.floor(rawSeconds);
        }

        if (remainingSeconds <= 0) {
            this.resetBanState();
            return;
        }

//        console.log(`Showing ban alert: ${remainingSeconds} seconds remaining`);

        // Format time properly using our formatTime function
        const banTimeFormatted = this.formatTime(remainingSeconds);

        // Create ban message content following register form pattern
        const banMessage = this.getTranslation('banMessage').replace('{time}', banTimeFormatted);

        // Show alert using consistent SweetAlert pattern
        showSweetAlert('warning', this.getTranslation('banTitle'), banMessage);

        // Update status and start countdown
        this.updateOTPStatus(this.getTranslation('accountBanned').replace('{time}', banTimeFormatted), 'error');
        this.startBanCountdown(remainingSeconds);
    }

    showBanStatus() {
        if (!this.banEndTime) return;

        const rawSeconds = Math.max(0, (this.banEndTime - new Date()) / 1000);
        const remainingSeconds = Math.floor(rawSeconds);

        if (remainingSeconds > 0) {
            this.disableResendButton();
            const banTimeFormatted = this.formatTime(remainingSeconds);
            this.updateOTPStatus(this.getTranslation('accountBanned').replace('{time}', banTimeFormatted), 'error');

//            console.log(`Ban status: ${remainingSeconds} seconds -> ${banTimeFormatted}`);
        } else {
            this.resetBanState();
        }
    }

    startResendCountdown(customSeconds = null) {
        const totalSeconds = customSeconds || this.resendCountdownSeconds;
        let remainingSeconds = Math.floor(Math.abs(parseFloat(totalSeconds) || 0));

        // Clear any ban countdown when starting resend countdown
        this.clearBanCountdown();

        this.disableResendButton();

        // Clear any existing countdown
        this.clearResendCountdown();

        this.countdownInterval = setInterval(() => {
            if (remainingSeconds <= 0) {
                this.clearResendCountdown();
                this.enableResendButton();
                return;
            }

            this.updateResendCountdown(remainingSeconds);
            remainingSeconds--;
        }, 1000);

        // Initial update
        this.updateResendCountdown(remainingSeconds);
    }

    startBanCountdown(totalSeconds) {
        // Ensure we start with a clean integer
        let remainingSeconds = Math.floor(Math.abs(parseInt(totalSeconds) || 0));

        // Clear any existing countdown
        this.clearBanCountdown();

//        console.log(`Starting ban countdown with ${remainingSeconds} seconds`);

        this.banCountdownInterval = setInterval(() => {
            if (remainingSeconds <= 0) {
                this.clearBanCountdown();
                this.resetBanState();
                return;
            }

            // Update the status display with current time
            const banTimeFormatted = this.formatTime(remainingSeconds);
            this.updateOTPStatus(this.getTranslation('accountBanned').replace('{time}', banTimeFormatted), 'error');

            remainingSeconds--;
        }, 1000);
    }

    updateResendCountdown(seconds) {
        const cleanSeconds = Math.floor(Math.abs(parseFloat(seconds) || 0));
        const formatted = this.formatTime(cleanSeconds);

        const resendCountdown = $('#resendCountdown');
        const resendText = $('#resendOTPText');

        if (resendCountdown.length) {
            resendCountdown.text(`(${formatted})`).removeClass('d-none');
        }
        if (resendText.length) {
            resendText.addClass('d-none');
        }
    }

    clearResendCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }

    clearBanCountdown() {
        if (this.banCountdownInterval) {
            clearInterval(this.banCountdownInterval);
            this.banCountdownInterval = null;
        }
    }

    formatTime(seconds) {
        // Convert to clean integer - handle any input type
        let totalSeconds = 0;

        if (typeof seconds === 'string') {
            // Remove any non-numeric characters except decimal point, then convert to integer
            const cleaned = seconds.replace(/[^0-9.]/g, '');
            totalSeconds = Math.floor(Math.abs(parseFloat(cleaned) || 0));
        } else {
            totalSeconds = Math.floor(Math.abs(parseInt(seconds) || 0));
        }

        const minutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;

        // Get language for proper formatting
        const lang = this.lang || localStorage.getItem('selectedLang') || 'kh';

//        console.log(`formatTime: input="${seconds}" -> totalSeconds=${totalSeconds} -> ${minutes}m ${remainingSeconds}s -> lang=${lang}`);

        if (minutes > 0) {
            if (lang === 'kh') {
                // Khmer format: "4 នាទី 58 វិនាទី" or "4 នាទី" if no seconds
                if (remainingSeconds > 0) {
                    return `${minutes} នាទី ${remainingSeconds} វិនាទី`;
                } else {
                    return `${minutes} នាទី`;
                }
            } else {
                // English format: "4 minutes and 58 seconds" or "4 minutes" if no seconds
                const minuteText = minutes === 1 ? 'minute' : 'minutes';
                if (remainingSeconds > 0) {
                    const secondText = remainingSeconds === 1 ? 'second' : 'seconds';
                    return `${minutes} ${minuteText} and ${remainingSeconds} ${secondText}`;
                } else {
                    return `${minutes} ${minuteText}`;
                }
            }
        } else {
            if (lang === 'kh') {
                return `${remainingSeconds} វិនាទី`;
            } else {
                const secondText = remainingSeconds === 1 ? 'second' : 'seconds';
                return `${remainingSeconds} ${secondText}`;
            }
        }
    }

    disableResendButton() {
        const resendBtn = $('#resendOTPBtn');
        if (resendBtn.length) {
            resendBtn.prop('disabled', true).addClass('disabled');
        }
    }

    enableResendButton() {
        const resendBtn = $('#resendOTPBtn');
        const resendCountdown = $('#resendCountdown');
        const resendText = $('#resendOTPText');

        if (resendBtn.length) {
            resendBtn.prop('disabled', false).removeClass('disabled');
        }
        if (resendCountdown.length) {
            resendCountdown.addClass('d-none');
        }
        if (resendText.length) {
            resendText.removeClass('d-none');
        }

        // Clear any ban status messages when enabling resend button
        // (unless current phone is actually banned)
        if (this.currentPhoneNumber && !this.isPhoneBanned(this.currentPhoneNumber)) {
            this.updateOTPStatus('', '');
        }
    }

    isResendDisabled() {
        const resendBtn = $('#resendOTPBtn');
        return resendBtn.length ? resendBtn.prop('disabled') : false;
    }

    updateOTPStatus(message, type = '') {
        const statusElement = $('#otpStatus');

        if (!statusElement.length) {
            console.warn('OTP status element not found');
            return;
        }

        if (!message) {
            statusElement.html('').removeClass();
            return;
        }

        let className = 'text-info';
        let icon = 'fas fa-info-circle';

        switch (type) {
            case 'success':
                className = 'text-success';
                icon = 'fas fa-check-circle';
                break;
            case 'error':
                className = 'text-danger';
                icon = 'fas fa-exclamation-circle';
                break;
            case 'warning':
                className = 'text-warning';
                icon = 'fas fa-exclamation-triangle';
                break;
            case 'info':
                // Add spinning animation for loading states
                if (message.includes('កំពុងផ្ញើ') || message.includes('Sending') ||
                    message.includes('កំពុងផ្ទៀងផ្ទាត់') || message.includes('Verifying')) {
                    icon = 'fas fa-spinner fa-spin';
                } else {
                    icon = 'fas fa-info-circle';
                }
                break;
        }

        statusElement.html(`<small class="${className}"><i class="${icon} me-1"></i>${message}</small>`);
    }

    onOTPVerified() {
//        console.log('OTP verified successfully');
    }

    updateUILanguage() {
        this.lang = localStorage.getItem('selectedLang') || 'kh';
    }

    getTranslation(key) {
        const translations = {
            kh: {
                otpSent: 'បានផ្ញើលេខកូដ OTP ដោយជោគជ័យ',
                otpVerified: 'កូដ OTP ត្រឹមត្រូវ',
                otpInvalid: 'កូដ OTP មិនត្រឹមត្រូវ',
                otpExpired: 'កូដ OTP ផុតកំណត់',
                otpSendFailed: 'ការផ្ញើកូដ OTP បានបរាជ័យ',
                otpVerifyFailed: 'ការផ្ទៀងផ្ទាត់កូដ OTP បានបរាជ័យ',
                sendingOTP: 'កំពុងផ្ញើកូដ OTP...',
                verifyingOTP: 'កំពុងផ្ទៀងផ្ទាត់កូដ OTP...',
                tooManyAttempts: 'ការព្យាយាមច្រើនពេក។ សូមរង់ចាំ {time}',
                banTitle: 'គណនីត្រូវបានរឹតបន្តឹងជាបណ្តាះអាសន្ន',
                banMessage: 'ការព្យាយាមផ្ទៀងផ្ទាត់កូដ OTP មិនត្រឹមត្រូវច្រើនពេក។ សូមរង់ចាំ {time} មុនពេលព្យាយាមម្តងទៀត។',
                accountBanned: 'គណនីត្រូវបានរឹតបន្តឹង សូមរង់ចាំ {time}',
                invalidPhoneNumber: 'សូមបញ្ចូលលេខទូរស័ព្ទត្រឹមត្រូវ',
                enterPhoneFirst: 'សូមបញ្ចូលលេខទូរស័ព្ទជាមុនសិន',
                waitBeforeResend: 'សូមរង់ចាំ {time} មុនពេលផ្ញើម្តងទៀត',
                error: 'កំហុស',
                ok: 'យល់ព្រម'
            },
            en: {
                otpSent: 'OTP sent successfully',
                otpVerified: 'OTP verified successfully',
                otpInvalid: 'Invalid OTP code',
                otpExpired: 'OTP code has expired',
                otpSendFailed: 'Failed to send OTP',
                otpVerifyFailed: 'OTP verification failed',
                sendingOTP: 'Sending OTP...',
                verifyingOTP: 'Verifying OTP...',
                tooManyAttempts: 'Too many attempts. Please wait {time}',
                banTitle: 'Account Temporarily Restricted',
                banMessage: 'Too many failed OTP attempts. Please wait {time} before trying again.',
                accountBanned: 'Account is restricted. Please wait {time}',
                invalidPhoneNumber: 'Please enter a valid phone number',
                enterPhoneFirst: 'Please enter phone number first',
                waitBeforeResend: 'Please wait {time} before resending',
                error: 'Error',
                ok: 'OK'
            }
        };

        return translations[this.lang]?.[key] || translations['en'][key] || key;
    }
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
                // Check if OTP is verified before submitting
                if (!otpManager.isOTPVerified) {
                    showSweetAlert('warning', otpManager.getTranslation('error'), 'Please verify OTP first');
                    return;
                }
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
    $('#legalIdImageDisplay').attr('src', '/assets/cpbank/images/National_ID_selfie.png');
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
    $("#legalIdImageDisplay").attr("src", "/assets/cpbank/images/National_ID_selfie.png");
    $("#frontImage").val(null);
    $("#imgFrontImageDisplay").attr("src", "/assets/cpbank/images/image_selfie.jpg");

    // Reset OTP state and clear all countdowns
    if (otpManager) {
        otpManager.resetOTPState();
        otpManager.resetBanState();
        otpManager.clearBanCountdown();
        otpManager.clearResendCountdown();
        // Clear the current phone number to avoid conflicts
        otpManager.currentPhoneNumber = null;
        otpManager.updateOTPStatus('', '');
        otpManager.enableResendButton();
    }
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
                    <img src="/assets/cpbank/icon/fail1.png" alt="fail" style="width: 16px; height: 16px;" />
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