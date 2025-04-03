$(document).ready(function() {

});


// Hold screen to validation
var form = document.getElementsByClassName('need-validate');
var validation = Array.prototype.filter.call(form, function (forms) {
    forms.addEventListener('submit', function (event) {
        if (forms.checkValidity() === false) {
            event.preventDefault();
        }
        else {
            event.preventDefault();

            var IDCARD = $('#txtIdCard').val();
            var PASSWORD = $('#txtPassword').val();

            var json={
                id_card: IDCARD,
                password: PASSWORD
            };

            $.ajax({
                type: "POST",
                url: "api/v1/auth/check-login",
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(json),
                success: function (response) {
                    console.log(response)
                    if (response.ErrCode === 0){
                           // window.location.href = "/OpenAcct/register-by-staff";
                         window.location.href = "/register-by-staff";
                    }
                    else if (response.ErrCode === 1){
                        Swal.fire({
                            title: "Failed..!",
                            text: response.ErrMsg,
                            icon: "error",
                            showConfirmButton: true,
                            timer: 6000,
                        });
                    }
                    else if (response.ErrCode === 2){
                           // window.location.href = "/OpenAcct/change-password";
                         window.location.href = "/change-password";
                    }
                    else if (response.ErrCode === 3){
                          // window.location.href = "/OpenAcct/expired-password";
                          window.location.href = "/expired-password";
                    }
                    else{
                        Swal.fire({
                            title: "Failed..!",
                            text: response.ErrMsg,
                            icon: "error",
                            showConfirmButton: true,
                            timer: 6000,
                        });
                    }
                },
                error: function (xhr, status, error) {
                    Swal.fire({
                        title: "Failed..!",
                        html: "An error occurred please try again later",
                        icon: "error",
                        showConfirmButton: true,
                        timer: 6000,
                    });
                },
            });
        }
        forms.classList.add('was-validated');
    }, false);
});