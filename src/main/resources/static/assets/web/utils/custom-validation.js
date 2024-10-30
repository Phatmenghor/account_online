$('#dateOfBirth').on('input change onSelectDate', function () {
    var input = document.getElementById('txtDateOfBirth');
    var errorMessage = document.getElementById('dateOfBirthErrorMessage');

    var selectedDate = $(this).val();
    var currentDate = new Date();

    var datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;

    if (!datePattern.test(selectedDate)) {
        errorMessage.textContent = 'Invalid date of birth.';
        errorMessage.style.display = 'block';
        errorMessage.classList.add('invalid-feedback');
    } else {
        var dateParts = selectedDate.split('/');
        var formattedDate = dateParts[1] + '/' + dateParts[0] + '/' + dateParts[2];
        var birthDate = new Date(formattedDate);

        var age = currentDate.getFullYear() - birthDate.getFullYear();
        var monthDiff = currentDate.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 18) {
            errorMessage.textContent = 'The age must be greater than or equal to 18 years';
            errorMessage.style.display = 'block';
            errorMessage.classList.add('invalid-feedback');
        } else {
            errorMessage.style.display = 'none';
            errorMessage.classList.remove('invalid-feedback');
        }
        console.log("Age: " + age);
        console.log("selectDate: " + selectedDate);
        console.log("birthDate: " + birthDate);
    }
});