let timeout;
// const idleDuration = 5000; // 5 seconds in milliseconds
   const idleDuration = 600000; // 10 minutes in milliseconds

function resetTimer() {
    clearTimeout(timeout);
    timeout = setTimeout(logout, idleDuration);
}

function logout() {
    location.href = "/OpenAcct/sign-out";
    // location.href = "/sign-out";
}

document.addEventListener('mousemove', resetTimer);
document.addEventListener('keypress', resetTimer);

resetTimer();