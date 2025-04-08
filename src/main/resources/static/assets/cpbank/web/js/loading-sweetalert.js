
// Show loading SweetAlert2
function showLoading(message = translations[lang].pleaseWait) {
    Swal.fire({
        title: null,
        html: `<b>${message}</b>`,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}

// Hide SweetAlert2 without showing any message
function hideLoading() {
    Swal.close();
}


function showSweetAlert(type = 'info', title = '', content = '', customConfirmText = null) {
    Swal.fire({
        icon: type,
        title: title,
        html: content, // Use HTML content
        confirmButtonText: customConfirmText || (translations[lang]?.confirm ?? "OK"),
        timer: 60000,
        timerProgressBar: true,
        customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-title',
            confirmButton: 'swal-confirm-button',
            text: 'swal-text' // Custom class for the text content
        },
        buttonsStyling: false
    });
}



// Reusable Alert
function showAlert(alertType, header, content) {
    const alertElement = document.getElementById("customAlert");
    const alertHeading = alertElement.querySelector(".alert-heading");
    const alertMessage = alertElement.querySelector(".message");

    // Add the appropriate alert class based on alertType
    alertElement.classList.remove("alert-success", "alert-info", "alert-danger", "alert-warning");
    alertElement.classList.add(`alert-${alertType}`); // Add the correct alert type class

    // Set the header and content of the alert
    alertHeading.textContent = header;
    alertMessage.textContent = content;

    // Show the alert
    alertElement.classList.remove("d-none");

    // Hide the alert after a few seconds (optional)
    // setTimeout(() => {
    //     alertElement.classList.add("d-none");
    // }, 5000); // Hide after 5 seconds
}