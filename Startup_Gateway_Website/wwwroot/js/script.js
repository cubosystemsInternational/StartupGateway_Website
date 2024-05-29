$(function () {
    'use strict';
    $(".lazy").lazyload({
        effect: "fadeIn"
    });

    $(window).on("scroll",
        function (e) {
            var fromTop = $(window).scrollTop();
            $("body").toggleClass("down", (fromTop > 50));
            $("body").toggleClass("up", (fromTop < 50));

            // show benefits button when scroll
            $(".benefits-btn").toggleClass("hidden-benefits", (fromTop < 50));

            var fromBottom = $(window).scrollTop() + $(window).height();
            if (fromBottom > $(document).height() - 700 && $(window).width() > 768) {
                $('.js-contact-home > div').addClass("animate");
            }
            // show benefits button when scroll
            $(".benefits-btn").toggleClass("hidden-benefits", (fromTop < 50));

            if (fromBottom > $(document).height() - 900 && $(window).width() <= 768) {
                $('.js-contact-home > div').addClass("animate");
            }

            if (fromBottom > $(document).height() - 1400 && $(window).width() > 768) {
                $('.js-contact-blog > div').addClass("animate");
            }

            if (fromBottom > $(document).height() - 1600 && $(window).width() <= 768) {
                $('.js-contact-blog > div').addClass("animate");
            }

            if ($(this).scrollTop() >= 500) {
                $('#return-to-top').fadeIn(500);
            } else {
                $('#return-to-top').fadeOut(500);
            }

            if (!loadPosts) {
                onScrollLoadBlog();
            } else {
                e.preventDefault();
                e.stopPropagation();
            }
        });
});

$(document).ready(function () {
    onMobileCheck();
    assignHoverSocialIcons();

    $('#loader-wrp').fadeOut('slow');
    $('body').removeClass('overflow-hidden');

    //below added by audits branch
    var name = $("#js-breadcrumb-get-value .ba-active").attr("name");
    checkFilter(name);

    var url = $(location).attr('href');
    var lastChar = url.substr(-1);
    if (lastChar != '/') {
        url = url + '/';
    }
    history.pushState(url, url, url);

    var container = document.querySelectorAll(".grid-section > div")[3];
    $('#baner-blog').insertAfter(container);

    //hardcoded repositioning of download for whitepaper article
    var blogPostBlock = document.querySelectorAll(".grid-section > div")[1];
    if ($('.mail-section').length > 0) {
        if ($("h1").text().indexOf('Telemedicine App Development') !== -1) {
            $('.mail-section').insertAfter(blogPostBlock);
        }
    }

    $(".pulse").on("click",
        async function () {
            const { Map, OverlayView, MapTypeId } = await google.maps.importLibrary("maps");
            var coords = $("#map").attr("data-location").split(",");
            if (!mapClicked) {
                definePopupClass();
                var myLatlng = {
                    lat: parseFloat(coords[0]),
                    lng: parseFloat(coords[1])
                };;
                var myOptions = {
                    zoom: 16,
                    center: myLatlng,
                    streetViewControl: false,
                    zoomControl: false,
                    fullscreenControl: false,
                    mapTypeId: MapTypeId.ROADMAP
                }

                map = new Map(document.getElementById("map"), myOptions);

                function definePopupClass() {

                    Popup = function (position, content) {
                        this.position = position;

                        content.classList.add('popup-bubble-content');

                        var pixelOffset = document.createElement('div');
                        pixelOffset.classList.add('popup-bubble-anchor');
                        pixelOffset.appendChild(content);

                        this.anchor = document.createElement('div');
                        this.anchor.classList.add('popup-tip-anchor');
                        this.anchor.appendChild(pixelOffset);

                        // Optionally stop clicks, etc., from bubbling up to the map.
                        this.stopEventPropagation();
                    };
                    // NOTE: google.maps.OverlayView is only defined once the Maps API has
                    // loaded. That is why Popup is defined inside initMap().
                    Popup.prototype = Object.create(OverlayView.prototype);

                    /** Called when the popup is added to the map. */
                    Popup.prototype.onAdd = function () {
                        this.getPanes().floatPane.appendChild(this.anchor);
                    };

                    /** Called when the popup is removed from the map. */
                    Popup.prototype.onRemove = function () {
                        if (this.anchor.parentElement) {
                            this.anchor.parentElement.removeChild(this.anchor);
                        }
                    };

                    /** Called when the popup needs to draw itself. */
                    Popup.prototype.draw = function () {
                        var divPosition = this.getProjection().fromLatLngToDivPixel(this.position);
                        // Hide the popup when it is far out of view.
                        var display =
                            Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000 ? 'block' : 'none';

                        if (display === 'block') {
                            this.anchor.style.left = divPosition.x + 'px';
                            this.anchor.style.top = divPosition.y + 'px';
                        }
                        if (this.anchor.style.display !== display) {
                            this.anchor.style.display = display;
                        }
                    };


                    /** Stops clicks/drags from bubbling up to the map. */
                    Popup.prototype.stopEventPropagation = function () {
                        var anchor = this.anchor;
                        anchor.style.cursor = 'auto';
                    };
                };

                var contentPopup = document.getElementById('content');
                popup = new Popup(
                    myLatlng,
                    contentPopup);
                popup.setMap(map);
                mapClicked = true;
            } else {
                map.setCenter(new google.maps.LatLng(coords[0], coords[1]));
            }
        });

    $("#servises-careere .panel-heading").on("click", function () {
        if ($(".panel-heading").hasClass("active")) {
            $(".collapse").each(function () {
                if ($(".panel-collapse").attr("style", "display: none !important")) {
                    $('.panel-collapse').attr("style", "");
                }
                $(this).insertAfter($(this).parent().find(".active"));

            });
            var $card = $(this).closest('.active');
            $('html,body').animate({
                scrollTop: $card.offset().top - 75
            }, 500);
        } else {
            $('.panel-collapse').attr("style", "display: none !important");
        }
    })

    if ($('#accordion .active').length > 0) {
        $(".collapse").each(function () {
            var $active = $(this).parent().find(".active");
            if ($active.length > 0) {
                $(this).insertAfter($active);
                $('html, body').animate({
                    scrollTop: $('#accordion .active').offset().top - 75
                }, 'slow');
            }
        });
    }
})


var blogPageCount = 1;
var loadMore = false;

function debounce(func, wait, immediate) {
    var timeout;

    return function executedFunction() {
        var context = this;
        var args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

$('#return-to-top').click(function () {
    $('body,html').animate({
        scrollTop: 0
    },
        500);
});

var mapClicked = false;
var map;
var popup;

$(window).on('load', function () {
    var blockHeight = $('.latest-work-img').height() + 105;
    $('#portfolio-tab').css("height", blockHeight);

    initFeaturedClientsList();
    initClientsList();
    initClientsListTwo()
    initQuotesList();
    initMethodologiesList();
    initOurCasesList();
    initIndexFilter();
    initPortfolioFilter();
    initTopBannerList();

    initRecruiterTeamList();
    initSmallRecruiterTeamListMobile();
    formCaseStudy();
});

function formCaseStudy() {
    const btn = document.querySelector('#case-study-submit');
    const form = document.querySelector('#case-study');

    if (btn) {
        btn.addEventListener('click', () => {
            setTimeout(() => {
                form.querySelectorAll('input').forEach((input) => {
                    input.value = "";
                })
            }, 1000)
        })
    }
}

function changeSharingMetatags(descr, keyWords, title, image, url) {
    if (descr !== undefined && descr !== null && descr !== "" && descr !== " ") {
        $($("meta[name='description']")[0]).attr("content", descr);
    }

    if (keyWords !== undefined && keyWords !== null && keyWords !== "" && keyWords !== " ") {
        $($("meta[name='keywords']")[0]).attr("content", keyWords);
    }

    if (image !== undefined && image !== null && image !== "" && image !== " ") {
        $($("meta[property='og:image']")[0]).attr("content", location.host + image);
    }

    if (title !== undefined && title !== null && title !== "" && title !== " ") {
        $("title")[0].innerText = title;
    }

    if (url !== undefined)
        changeVacancyEvent(url);
}



$(window).on('load', function () {
    var blockHeight = $('.latest-work-img').height() + 105;
    $('#portfolio-tab').css("height", blockHeight);
    zoomInit();
});

function zoomInit() {
    mediumZoom(document.querySelectorAll('.blogpost-zoom img'));
}

$(".modal").on("show.bs.modal",
    function (e) {
        if (isMobile.iOS()) {
            scrollPos = $('body').scrollTop();
            $('body').css({
                overflow: 'hidden',
                position: 'fixed',
                top: -scrollPos
            });
        }

        $(".header-small").css("padding-left", "0");
        $(".header-small").css("padding-right", "17px");
        $("#return-to-top").css("right", "67px");
    });

$(".modal").on("hidden.bs.modal", function (e) {
    if (isMobile.iOS()) {
        $('body').css({
            overflow: '',
            position: '',
            top: ''
        }).scrollTop(scrollPos);
    }
    $(".header-small").css("padding-left", "0");
    $(".header-small").css("padding-right", "0");
    $("#return-to-top").css("right", "50px");
});



$('.navbar-toggle').on('click', function (event) {
    menuToggle(event);
});


$('.btn-close-nav').on('click', function () {
    $("html").css("overflow", "");
    $("body").css("height", "");
    $(".popup-menu").css("height", "");
    $('.navbar-toggle').removeClass('open');
    $("body").removeClass("popup-menu-active");

});

function menuToggle(event) {
    event.preventDefault();
    var menuNav = $(event.target).hasClass("navbar-toggle")
        ? $(event.target)
        : $(event.target).parent(".navbar-toggle");
    menuNav.toggleClass('open');
    var mainNav = $(event.target).parents(".navbar-default");
    if (menuNav.hasClass('open')) {
        $("html").css("overflow", "hidden");
        $("body").css("height", "100%");
        $(".popup-menu").css("height", mainNav.hasClass("header-small")
            ? "100%" :
            "100%");
        $("body").addClass("popup-menu-active");
    } else {
        $("html").css("overflow", "");
        $("body").css("height", "");
        $(".popup-menu").css("height", "");
        $("body").removeClass("popup-menu-active");
    }
}

function stopBodyScrolling(bool) {
    if (bool) {
        document.body.addEventListener("touchmove", freezeVp, false);
    } else {
        document.body.removeEventListener("touchmove", freezeVp, false);
    }
}

var freezeVp = function (e) {
    e.preventDefault();
};

$('.contact-us .contact-us-form input, .contact-us .contact-us-form textarea').focus(function () {
    var $anchor = $(this);
    $anchor.prev().css("top", "0px");
    $anchor.next().css("border-top", "1px solid #1998a8");
});

$('form input, form textarea').focusout(function () {
    var $anchor = $(this);
    if ($anchor.val().length == 0) {
        $anchor.prev().css("top", "35px");
        if (!$anchor.next().hasClass('js-no-animation')) {
            $anchor.next().css("border-top", "1px solid #b4cbe0");
        }
    }
});

$('form input, form textarea').focus(function () {
    var $anchor = $(this);
    $anchor.prev().css("top", "0px");

    if (!$anchor.next().hasClass('js-no-animation')) {
        $anchor.next().css("border-top", "1px solid #1998a8");
    }

});

$('#hr-apply-modal .apply-form input, #hr-apply-modal .apply-form textarea').focusout(function () {
    var $anchor = $(this);
    if ($anchor.val().length == 0) {
        $anchor.prev().css("top", "35px");
        $anchor.next().css("border-top", "1px solid #b4cbe0");
    }
});

$(".scroll").click(function () {
    var next = $(this).closest(".item").nextAll(".item").not(".hide-project").first();
    if (next.length == 1) {
        var offset = next.offset().top - 50;
        $("html, body").animate({ scrollTop: offset }, "slow");
    }
});

//scroll for careers page
$('.benefits-btn').on('click', function () {
    $('html, body').animate({ scrollTop: $('.section-odd').first().offset().top - 72 }, 'slow');

});

$(".scroll-projects").click(function () {
    $("html, body").animate({ scrollTop: $(".left-project").offset().top - 50 }, "slow");
});

//initial functions

$(".person-email, .person-skype, .person-phone, .share-blog-link").on("click", function (event) {
    var lem = $(this);
    CopyText(lem);
    tooltipPopup(lem);
})

function tooltipPopup(e) {
    e.tooltip({ title: "Copied to clipboard", placement: "bottom", trigger: 'manual' });
    e.tooltip('show');
    setTimeout(function () { e.tooltip('hide') }, 750)
}

function CopyText(e) {
    var $temp = $("<input>");
    $(e).append($temp);
    if (isMobile.iOS()) {
        $temp.val(e.text());
        var el = $temp.get(0);
        var editable = el.contentEditable;
        var readOnly = el.readOnly;
        el.contentEditable = true;
        el.readOnly = true;
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        el.setSelectionRange(0, 999999);
        el.contentEditable = editable;
        el.readOnly = readOnly;
    } else {
        $temp.val(e.text());
        $temp.select();
    }
    document.execCommand("copy");
    $temp.remove();
}


function initTopBannerList() {
    $('#top-banner-list').owlCarousel({
        margin: 20,
        items: 1,
    });
}


function initFeaturedClientsList() {
    $('#featured-clients').owlCarousel({
        margin: 20,
        dots: true,
        loop: true,
        lazyLoad: true,
        lazyLoadEager: 1,
        responsive: {
            0: {
                items: 1,

            },
            480: {
                items: 2,

            },
            768: {
                items: 4,
            }
        }
    });
}

function initClientsList() {
    $('#clients-list').owlCarousel({
        //items: 5,
        margin: 20,
        // autoWidth: true
        //stagePadding: 100
        nav: true,

        responsive: {
            0: {
                items: 1,

            },
            480: {
                items: 2,

            },
            768: {
                items: 4,
            },
            992: {
                items: 5,
            }
        }
    });



}

function initClientsListTwo() {
    $('#clients-lists').owlCarousel({
        //items: 5,
        margin: 20,
        // autoWidth: true,
        //stagePadding: 100
        nav: true,

        responsive: {
            0: {
                items: 1,

            },
            480: {
                items: 2,

            },
            768: {
                items: 4,
            },
            992: {
                items: 5,
            }
        }
    });


}

function initSmallRecruiterTeamListMobile() {
    if (!$('#recruiter-team-sm'))
        return;

    var loop = $('#recruiter-team-sm .item').length > 1;

    var carousel = $('#recruiter-team-sm');
    carousel.owlCarousel({
        items: 1,
        loop: loop,
        pullDrag: loop,
        touchDrag: loop,
        mouseDrag: loop
    });

    $(".slide-member-prev").click(function () {
        carousel.owlCarousel().trigger('prev.owl.carousel');
    });

    $(".slide-member-next").click(function () {
        carousel.owlCarousel().trigger('next.owl.carousel');
    });
}

function initRecruiterTeamList() {
    if (!$('#recruiter-team'))
        return;

    var loop = $('#recruiter-team .item').length > 1;

    $('#recruiter-team').owlCarousel({
        items: 1,
        loop: loop,
        pullDrag: loop,
        touchDrag: loop,
        mouseDrag: loop
    });

    var owl = $('#recruiter-team').owlCarousel();
    $(".slide-member-prev").click(function () {
        owl.trigger('prev.owl.carousel');
    });

    $(".slide-member-next").click(function () {
        owl.trigger('next.owl.carousel');
    });
}

function initQuotesList() {
    $('#quotes-list').owlCarousel({
        items: 1,
        loop: true,
        autoplay: true,
        autoplayHoverPause: true
    });

    var owl = $('#quotes-list').owlCarousel();
    $(".slide-quote-btn-prev").click(function () {
        owl.trigger('prev.owl.carousel');
    });

    $(".slide-quote-btn-next").click(function () {
        owl.trigger('next.owl.carousel');
    });
}

function initMethodologiesList() {
    if ($('#methodologies-list') === undefined)
        return;

    $('#methodologies-list').owlCarousel({
        items: 1,
        loop: true
    });

    var owl = $('#methodologies-list').owlCarousel();
    var leftPos = $('#methodologies-list .owl-dots').outerWidth(true) - parseInt($('#methodologies-list .owl-dots').css("margin-left"), 10);
    $(".slide-methodolody-btn-next").css("left", leftPos)

    $(".slide-methodolody-btn-prev").click(function () {
        owl.trigger('prev.owl.carousel');
    });

    $(".slide-methodolody-btn-next").click(function () {
        owl.trigger('next.owl.carousel');
    });
}

function initOurCasesList() {
    $('#our-cases-list').owlCarousel({
        items: 1,
        loop: true,
        autoplay: true,
        autoplayHoverPause: true,
        nav: true,
        lazyLoad: true,
        lazyLoadEager: 1,
    });

    var owl = $('#our-cases-list').owlCarousel();

    $(".slide-case-btn-prev").click(function () {
        owl.trigger('prev.owl.carousel');
    });

    $(".slide-case-btn-next").click(function () {
        owl.trigger('next.owl.carousel');
    });
}

function initPortfolioFilter() {
    $('.portfolio-main-categories-tabs').find('a').on('click', function () {
        var category = $(this).attr('data-category');
        var itemsContainer = $('.portfolio-item-list');

        //because iterator starts at 0 not at 1
        if (category === 'all') {
            itemsContainer.find('div.item').removeClass('hide-project');
            itemsContainer.find('div.item').removeClass("project-even");
            itemsContainer.find('div.item').removeClass("project-odd");
            itemsContainer.find('div.item' + ':even').addClass("project-odd");
            itemsContainer.find('div.item' + ':odd').addClass("project-even");
            itemsContainer.find("div.item").removeClass(function (index, className) {
                return (className.match(/background-[0-9]*/) || []).join(' ');
            });
            itemsContainer.find("div.item").each(function (index) {
                $(this).addClass("background-" + (index + 1));
            });
            return;
        }

        itemsContainer.find('div.item').removeClass("project-even");
        itemsContainer.find('div.item').removeClass("project-odd");

        itemsContainer.find('div.item').not('.' + category).addClass('hide-project');
        itemsContainer.find('div.item.' + category).removeClass('hide-project');
        itemsContainer.find('div.item.' + category + ":even").addClass("project-odd");
        itemsContainer.find('div.item.' + category + ":odd").addClass("project-even");

        itemsContainer.find("div.item" + ":not(.hide-project)").removeClass(function (index, className) {
            return (className.match(/background-[0-9]*/) || []).join(' ');
        });
        itemsContainer.find("div.item" + ":not(.hide-project)").each(function (index) {
            $(this).addClass("background-" + (index + 1));
        });
    });
}

function initIndexFilter() {
    $('.portfolio-categories-tabs').find('a').on('click', function () {
        console.log(111)
        var category = $(this).attr('data-category');
        var itemsContainer = $('.glider');
        if (category === 'all') {
            $(".slidecontainer").addClass("intro");
            $.when(itemsContainer.find('div.item')
                .show('fast'))
                .done(function () { $('.glider').mCustomScrollbar("update"); });
            return;
        } else {
            $(".slidecontainer").removeClass("intro");
        }

        itemsContainer.find('div.item.' + category + ':even').addClass("juj-even");
        itemsContainer.find('div.item').hide('fast');
        $.when(itemsContainer.find('div.item.' + category).show('fast'))
            .done(function () {
                $.when(itemsContainer.find('div.item').not('.' + category).hide('fast'))
                    .done(function () { $('.glider').mCustomScrollbar("update"); });
            });
    });
}

function destroyPortfolioList() {
    $('.portfolio-list').mCustomScrollbar("destroy");
}

var applyRotate = function (el, cycleLength) {
    return function (value) {
        var degrees = ((value / cycleLength) * 360) + 90;
        el.style.transform = 'rotate(${degrees}deg)';
    }
}

function assignHoverSocialIcons() {
    if ($(".social-icon").length != 0) {
        var style = document.createElement('style');
        var css = '';
        $(".social-icon").each(function () {
            css += '#' + $(this).attr("id") + ':hover{background-image:' + $(this).data('backhover') + '!important;}';
        });
        style.appendChild(document.createTextNode(css));
        document.getElementsByTagName('head')[0].appendChild(style);
    }
};

$(".modal, .modal .close").on("click",
    function () {
        if ($('.embed-responsive-item').length) {
            $('.embed-responsive-item')[0].contentWindow
                .postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
        }
    });

$('.services #services .nav-pills a').on("click", function (event) {
    var serviceUrl = $(this).attr('href');
    var id = $(this).attr('id');
    getService(serviceUrl, id);
});

$('.services #section-mobile .panel-group .js-collapse').on("click", function (event) {
    var serviceUrl = $(this).attr('href');
    var id = $(this).attr('id');
    getService(serviceUrl, id);
});

$('#js-breadcrumb-get-value a').on("click", function () {
    var name = $(this).attr('name');
    if (name == "All" || name == "Alle") {
        $("#breadcrumb-name").empty();
    } else {
        $("#breadcrumb-name").text(name);
    }
});

$('.blog #js-breadcrumb-get-value a').on("click", function () {
    var name = $(this).attr('name');
    checkFilter(name)
});

function changeTags(name) {
    if (name == "All" || name == "Alle") {
        $("#breadcrumb-name").empty();
    } else {
        $("#breadcrumb-name").text(name);
    }

    checkFilter(name)
}

function getService(url, id) {
    window.history.pushState(url, url, url);
    var getUrl = "/umbraco/Surface/SurfaceService/GetServiceDescription/";
    $.ajax({
        url: getUrl + "?url=" + url + "&serviceId=" + id,
        type: "GET",
        contentType: false,
        processData: false,
        success: function (data) {
            onSuccessServices(data);
            onSuccessServicesMobile(data)
        },
        error: function (xhr, err) {
            console.log(xhr, err)
        }
    });
}

function onSuccessServicesMobile(data) {
    $("#section-mobile .panel-body .title").text(data.VacancyName);
    $("#section-mobile .panel-body .summary").html(data.VacancyDescription);
}

function onSuccessServices(data) {
    $("#services .tab-content .title").text(data.VacancyName);
    $("#services .tab-content .summary").html(data.VacancyDescription);
}

var isMobile = {
    iOS: function () {
        var iDevices = [
            'iPad Simulator',
            'iPhone Simulator',
            'iPod Simulator',
            'iPad',
            'iPhone',
            'iPod'
        ];

        if (!!navigator.platform) {
            while (iDevices.length) {
                if (navigator.platform === iDevices.pop()) { return true; }
            }
        }

        return false;
    }
}

function onMobileCheck() {

    if (isMobile.iOS()) {
        $('body').addClass('apple-ios');
    }
}

////////////Careers Start

function getVacancy(url) {
    window.history.pushState(url, url, url);
    var getUrl = "/umbraco/Surface/SurfaceCareers/GetVacancyDescription/";
    $.ajax({
        url: getUrl + "?url=" + url,
        type: "GET",
        contentType: false,
        processData: false,
        success: function (data) {
            onSuccessVacancy(data);
            onSuccessVacancyMobile(data);
        },
        error: function (xhr, err) {
            console.log(xhr, err)
        }
    });
}

function onSuccessVacancy(data) {
    $("#carriers .tab-content .title").text(data.vacancyName);
    $("#carriers .tab-content .summary").html(data.vacancyDescription);
}
function onSuccessVacancyMobile(data) {
    $("#section-mobile .panel-body .title").text(data.vacancyName);
    $("#section-mobile .panel-body .summary").html(data.vacancyDescription);
}

function changeVacancyEvent(url) {
    getVacancy(url);
    SocialShare.createShareBox(".ss-box", window.location.href, "facebook, pinterest, linkedIn, pinterest, telegram,  whatsapp, email");
}

var getPosition = function () {
    var position = $('#carriers .nav-pills .active').find(".carrier-text").text().trim();
    return position;
}

////////////Careers End

////////////Blog Start
function initBlogpostPage() {
    if ($(".blogpost") === undefined)
        return
    var showDots = $("#blogposts .item").length > 3;
    $('#blogposts').owlCarousel({
        items: 3,
        dots: showDots,
        lazyLoad: true,
        lazyLoadEager: 1,
        margin: 35,
        responsive: {
            992: {
                items: 3
            },
            768: {
                items: 2
            },
            600: {
                items: 2
            },
            319: {
                items: 1
            }
        }
    });

    loadMore = $("#loadMore").data("load-more") === true;
}

(function Init() {
    initBlogpostPage();
})()

function onChangeUrl(url) {
    window.history.pushState(url, url, url);
}

$("body").on("click", "div.share", function (e) {
    $("#blogPost .share-blog-link").text($(this).data("blog-link"));
})

$(".blog-tags li").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    var selectedTag = $(e.target).closest("li");
    var tagUrlName = selectedTag.children("a").attr("href").split("/").pop();
    var culture = $(".blog").data("culture");
    var blogUrl = selectedTag.children("a").attr('href');
    onMakeTagActive(selectedTag);
    onChangeUrl(blogUrl);
    blogPageCount = 1;
    $("#blogpostsList").load("/umbraco/Surface/SurfaceBlog/GetBlogs?tag=" + tagUrlName + "&culture=" + culture, function () {
        $(".lazy").lazyload({
            effect: "fadeIn"
        });
        SocialShare.createShareBox(".ss-box", window.location.href, "facebook, pinterest, linkedIn, pinterest, telegram,  whatsapp, email");
    });
    loadMore = $("#loadMore").data("load-more") === true;
    onChangeTagHeaderSelected();
});


$(".blog .ba-category-list a").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    var selectedTag = $(e.target);
    if (selectedTag.is('span')) {
        selectedTag = selectedTag.parent();
    }

    var tagUrlName = selectedTag.attr("href").split("/").pop();
    var culture = $(".blog").data("culture");
    var blogUrl = selectedTag.attr('href');
    onMakeTagActive(selectedTag);
    onChangeUrl(blogUrl);
    blogPageCount = 1;
    $("#blogpostsList").load("/umbraco/Surface/SurfaceBlog/GetBlogs?tag=" + tagUrlName + "&culture=" + culture, function () {
        $(".lazy").lazyload({
            effect: "fadeIn"
        });

        SocialShare.createShareBox(".ss-box", window.location.href, "facebook, pinterest, linkedIn, pinterest, telegram,  whatsapp, email");
    });
    loadMore = $("#loadMore").data("load-more") === true;
    onChangeTagHeaderSelected();
});

$("#blogpostsList").on("click", ".post-categories li", function (e) {
    e.preventDefault();
    e.stopPropagation();
    var selectedTag = $(e.target).closest("li");
    var tagUrlName = selectedTag.children("a").attr("href").split("/").pop();
    var culture = $(".blog").data("culture");
    var blogUrl = selectedTag.children("a").attr('href');
    blogPageCount = 1;
    onMakeTagActive(selectedTag);
    onChangeUrl(blogUrl);
    $("#blogpostsList").load("/umbraco/Surface/SurfaceBlog/GetBlogs?tag=" + tagUrlName + "&culture=" + culture, function () {
        $(".lazy").lazyload({
            effect: "fadeIn"
        });

        SocialShare.createShareBox(".ss-box", window.location.href, "facebook, pinterest, linkedIn, pinterest, telegram,  whatsapp, email");
    });
    loadMore = $("#loadMore").data("load-more") === true;
    onChangeTagHeaderSelected();
})

var loadPosts = false;

function onLoadBlogs() {
    var selectedTag = $("ul.blog-tags li.active");
    if (selectedTag.length != 0) {
        var tagUrlName = selectedTag.children("a").attr("href").split("/").pop();
        $.ajax({
            url: "/umbraco/Surface/SurfaceBlog/GetBlogs"
                + "?tag=" + tagUrlName
                + "&page=" + blogPageCount,
            type: "GET",
            contentType: false,
            processData: false,
            beforeSend: function () {
                $("#blogLoader").removeClass("hide-loader");
                $("#blogLoader").addClass("show-loader");
            },
            complete: function () {
            },
            success: function (data) {
                $("#blogLoader").removeClass("show-loader");
                $("#blogLoader").addClass("hide-loader");
                onSuccessBlogLoad(data);
                loadPosts = false;
            },
            error: function (xhr, err) {
                console.log(xhr, err);
                loadPosts = false;
            }
        });
    }
}

var onScrollLoadBlog = debounce(function (e) {
    var scrollTop = $(window).scrollTop();
    var windowHeight = $(window).height();
    var documentHeight = $(document).outerHeight();
    var footerHeight = $("footer").outerHeight();
    var loadHeight = 100;

    if (loadMore && scrollTop + windowHeight > documentHeight - footerHeight - loadHeight) {
        loadPosts = true;
        blogPageCount++;
        onLoadBlogs();
    }
}, 1000 / 60, 0);

function onSuccessBlogLoad(data) {
    $("#blogpostsList").append(data);
    loadMore = $("#loadMore").data("load-more") === true;
    $("#loadMore").remove();
    $(".lazy").lazyload({
        effect: "fadeIn"
    });
    onChangeTagHeaderSelected();
}


function onMakeTagActive(targetTag) {
    $("ul.blog-tags li.active").removeClass("active");
    $("ul.blog-tags li").each(function (index, elem) {
        if ($(elem).text().trim() === targetTag.text().trim()) {
            $(elem).addClass("active");
            return;
        }
    });

    $(".blog .ba-category-list a.ba-active").removeClass("ba-active");
    $(".blog .ba-category-list a.ba-category").each(function (index, elem) {
        if ($(elem).text().trim() === targetTag.text().trim()) {
            $(elem).addClass("ba-active");
            return;
        }
    });
}

function onChangeTagHeaderSelected() {
    var tag = $('.blog .ba-category-list a.ba-active');
    var tagText = tag.text().trim();
    var postCount = tag.data('blogpost-count');
    $('#tagHeaderSelected').text(tagText + ' (' + postCount + ')');
    $('.ba-message').hide();
    let tagMessage = $('.ba-message[data-ba-tag="' + tagText + '"]');
    if (!tagMessage || tagMessage.length <= 0) {
        tagMessage = $('.ba-message[data-ba-tag="ALL"]');
    }
    tagMessage.show();
}

function subscribeMessageSuccess() {
    $('.js-subscribe-message').fadeIn();
    setTimeout(function () {
        $('.js-subscribe-message').fadeOut();
    }, 2500);



    setTimeout(() => {
        if (document.querySelector('#SubscriberEmail')) {
            document.querySelectorAll('#SubscriberEmail').forEach(element => {
                element.value = "";
            });
        }
    }, 500)

    console.log('?')
}
function subscribeMessageFailure() {
    $('.js-subscribe-message-failure').fadeIn();
    setTimeout(function () {
        $('.js-subscribe-message-failure').fadeOut();
    }, 2500);
}
////////////Blog End

////////////Social Media Feed Start

$('.ba-media-selector .btn').on("click", function (e) {
    $('.ba-media-selector .btn').removeClass('ba-btn-active');
    $(e.target).addClass('ba-btn-active');
    if (e.target.id === 'btnTwitter') {
        $('.js-twitter-feed-container').show();
        $('.js-facebook-feed-container').hide();
        $('.js-linkedin-feed-container').hide();
    }
    if (e.target.id === 'btnFacebook') {
        $('.js-twitter-feed-container').hide();
        $('.js-facebook-feed-container').show();
        $('.js-linkedin-feed-container').hide();
    }
    if (e.target.id === 'btnLinkedIn') {
        $('.js-twitter-feed-container').hide();
        $('.js-facebook-feed-container').hide();
        $('.js-linkedin-feed-container').show();
    }
})

////////////Social Media Feed End

$(".js-collapse").click(function () {
    if ($(this).parent().hasClass('active')) {
        $(this).parent().removeClass('active');
    } else {
        $(this).parent().addClass('active').siblings().removeClass('active');

    }
});


$('.collapse').on('shown.bs.collapse', function (e) {
    var $card = $(this).closest('.panel');
    if ($card.length) {
        $('html,body').animate({
            scrollTop: $card.offset().top - 75
        }, 500);
    }
});
//////////// landing page active

$('.panel-heading a').click(function () {
    $('.panel-heading').removeClass('active');
    if (!$(this).closest('.panel').find('.panel-collapse').hasClass('in'))
        $(this).parents('.panel-heading').addClass('active');
});

function checkFilter(name) {
    if (name !== "All" && name !== "Alle") {
        $("#blog-not-filter").hide();
        $("#blog-with-filter").show();
    }

    else {
        $("#blog-not-filter").show();
        $("#blog-with-filter").hide();
    }
}
