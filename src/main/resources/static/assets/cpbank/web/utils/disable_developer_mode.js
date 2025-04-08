



// Compile and run this code and see if it is easy to use F12 for developer tools or use the context menu to inspect an element
var addHandler = function (element, type, handler) {
    if (element.addEventListener) {
        element.addEventListener(type, handler, false);
    } else if (element.attachEvent) {
        element.attachEvent("on" + type, handler);
    } else {
        element["on" + type] = handler;
    }
};

var preventDefault = function (event) {
    if (event.preventDefault) {
        event.preventDefault();
    } else {
        event.returnValue = false;
    }
};

addHandler(window, "contextmenu", function (event) {
    preventDefault(event);
});
document.onkeydown = function (event) {
    if (event.keyCode == 123) { // Prevent F12
        return false;
    }
    else if (event.ctrlKey && event.shiftKey && event.keyCode == 73) { // Prevent Ctrl+Shift+I
        return false;
    }
};