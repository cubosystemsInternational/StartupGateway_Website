(function () {
    var captchaChecked = false;

    var ContactForm = {
        captchaCallback: function () {
            captchaChecked = true;
            $('#CaptchaValidateLabel').fadeOut();
        },
        bindSubmitHandler: function () {
            $("#ContactForm").submit(function (e) {
                if (captchaChecked) {
                    $('#CaptchaValidateLabel').fadeOut();
                }
                else {
                    e.preventDefault();
                    $('#CaptchaValidateLabel').fadeIn();
                    return false;
                }
            });
        }
    }
    window.ContactForm = ContactForm;
})();

function contactMessageSuccess() {
    const inputs = [document.querySelectorAll('#ContactForm input'), document.querySelectorAll('#ContactForm textarea')];
    const inputs2 = [document.querySelectorAll('#ApplyForm input'), document.querySelectorAll('#ApplyForm textarea')];

    $('.js-message').fadeIn();
    setTimeout(function () {
        $('.js-message').fadeOut();
    }, 2500);
    $('.cs-fade-shadow').fadeOut();
    grecaptcha.reset();
    $('#ContactForm, #ApplyForm').find('button[type=submit]').prop('disabled', true);

    setTimeout(() => {
        if (inputs) {
            inputs[0].forEach((input) => {
                input.value = "";
            })

            inputs[1].forEach((input) => {
                input.value = "";
            })
        }

        if (inputs2) {
            inputs2[0].forEach((input) => {
                input.value = "";
            })

            inputs2[1].forEach((input) => {
                input.value = "";
            })
        }
    }, 500)
}

function contactMessageFailure() {
    $('.js-message-failure').fadeIn();
    setTimeout(function () {
        $('.js-message-failure').fadeOut();
    }, 2500);
    $('.cs-fade-shadow').fadeOut();


}

$(".input-file").on('change', function () {
    var fileName = $(this).val().toLowerCase();
    var allowFile = isAllowedFileType(fileName);

    $('#CV-error').text(allowFile ? '' : "Send your CV using PDF or Word formats");

    return allowFile;
})

function isAllowedFileType(fileName) {
    return (/\.(pdf|doc|docx)$/i).test(fileName);
}

$("#file-trigger, .attach-file").on("click", function (e) {
    $("#file-trigger").focus();
    $(".input-file").trigger("click");
});

$("#file-trigger").on("keypress", function (e) {
    e.preventDefault();
});

$(".input-file").on("change", function () {
    $("#file-trigger").val($('#CV')[0].files[0].name);
    $(".attach-file").css("display", "none");
    $(".delete-file").css("display", "block");
});

$(".delete-file").on("click", function () {
    $("#file-trigger").focus();
    $('#CV-error').text('');
    $("#file-trigger").val('');
    $('#CV').val('');
    $(".attach-file").css("display", "block");
    $(".delete-file").css("display", "none");
});


$("#ApplyForm").submit(function () {
    var myForm = $("#ApplyForm");
    var form = new FormData($("#ApplyForm")[0]);
    var file = $('#CV')[0].files[0];

    if (!myForm.valid())
        return;

    if (typeof file !== "undefined" && !isAllowedFileType(file.name)) {
        contactMessageFailure();
        return;
    }

    form.append("CV", file);
    form.append("Position", getPosition());

    $.ajax({
        url: myForm.attr('action'),
        type: "POST",
        data: form,
        contentType: false,
        processData: false,
        success: function (data) {
            contactMessageSuccess();
        },
        error: function (xhr, err) {
            contactMessageFailure();
        }
    });

})

var getPosition = function () {
    var position = $('#carriers .nav-pills .active').find(".carrier-text").text().trim();
    return position;
}

$("#carriers .hr-contact-btn").on("click", function () {
    var str = getPosition();
    $("#position-header").text(str);
})

var HEADER_HEIGHT = 0; // Height of header/menu fixed if exists
var isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
var grecaptchaPosition;

var isScrolledIntoView = function (elem) {
    var elemRect = elem.getBoundingClientRect();
    var isVisible = (elemRect.top - HEADER_HEIGHT >= 0 && elemRect.bottom <= window.innerHeight);

    return isVisible;
};

if (isIOS) {
    var recaptchaElements = document.querySelectorAll('.g-recaptcha');

    window.addEventListener('scroll', function () {
        Array.prototype.forEach.call(recaptchaElements, function (element) {
            if (isScrolledIntoView(element)) {
                grecaptchaPosition = document.documentElement.scrollTop || document.body.scrollTop;
            }
        });
    }, false);
}

var onReturnCaptchaCallback = function () {
    ContactForm.captchaCallback();
    $('#ContactForm, #ApplyForm').find('button[type=submit]').prop('disabled', false);
    if (isIOS && grecaptchaPosition !== undefined) {
        window.scrollTo(0, grecaptchaPosition);
    }
}

var onRecaptchaExpired = function () {
    ContactForm.captchaCallback();
    $('#ContactForm,  #ApplyForm').find('button[type=submit]').prop('disabled', true);
}

$(document).ready(function () {
    ContactForm.bindSubmitHandler();
})