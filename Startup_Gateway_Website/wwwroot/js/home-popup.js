$(document).ready(setTimeout(function () {
    showPopup();
}, 5000));

function showPopup() {
    if ($('#popup')) {
        var cookie = $("#popup").attr("data-cookie");
        if (Cookies.get(cookie) === undefined) {
            Cookies.set(cookie, 'true', { expires: 30 });
            $('#popup').modal('show');
        }
    }
}