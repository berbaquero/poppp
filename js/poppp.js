$(document).ready(function() {

    var shotTemplate = "{{#shots}}<article class='shotWrap'><div class='shot' style='background-image: url({{image_teaser_url}})'></div></article>{{/shots}}";

    var sliderTemplate = "<div id='slider'><div>{{#shots}}<div><div><img class='shotImage' data-img='{{image_url}}' src='{{image_teaser_url}}' /><p data-url='{{short_url}}'>{{title}}</p></div></div>{{/shots}}</div></div>";

    var page = 1,
        perPage = 30,
        ancho = 320,
        activeView = 1,
        slider;

    var loadShots = function() {
            var main = $("#wrapper");
            main.append("<p class='loading'>Cargando shots...</p>");
            $.getJSON("//api.dribbble.com/shots/popular?page=" + page + "&per_page=" + perPage + "&callback=?", function(data) {
                $(".loading").remove();
                var html = Mustache.to_html(shotTemplate, data);
                main.append(html);
                var sliderHtml = Mustache.to_html(sliderTemplate, data);
                $("#detailView").append(sliderHtml);
                slider = new Swipe(document.getElementById('slider'), {
                    callback: function(e, pos) {
                        var s = $('.shotImage[data-id="' + pos + '"]');
                        var url = s.attr("data-img");
                        s.attr("src", url);
                    }
                });
                var lista = $(".shotWrap");
                $.each(lista, function(i, s) {
                    $(s).attr("data-shot", i);
                });
                var shots = $(".shotImage");
                $.each(shots, function(i, z) {
                    $(z).attr("data-id", i);
                });
                page++;
            });
        };

    window.applicationCache.addEventListener("updateready", function(e) {
        var update = window.confirm("Update descargado. Recargar para actualizar?");
        if(update) {
            window.location.reload();
        }
    });

    $("header").on('touchmove', function(e) {
        e.preventDefault();
    }, false);

    tappable(".shotWrap", {
        onTap: function(e, target) {
            var id = $(target).attr("data-shot");
            slider.slide(parseInt(id), 100);
            slideFromRight();
            ensenar("#navBack");
        }
    });

    tappable("#navBack", {
        onTap: function(e, target) {
            $(target).addClass("invisible");
            slideFromLeft();
        }
    });

    tappable("#slider div div div p", {
        onTap: function(e, target) {
            var open = window.confirm("Abrir este Shot de Dribble en Safari?");
            if(open) {
                url = $(target).attr("data-url");
                var a = document.createElement('a');
                a.setAttribute("href", url);
                a.setAttribute("target", "_blank");

                var dispatch = document.createEvent("HTMLEvents");
                dispatch.initEvent("click", true, true);
                a.dispatchEvent(dispatch);
            }
        },
        activeClass: "title-active"
    });

    // Animaciones
    var slideFromLeft = function() {
            var main = $("#mainView");
            var det = $("#detailView");
            main.css("left", -ancho);
            setTimeout(function() {
                main.addClass("slideTransition").css('-webkit-transform', 'translate3d(' + ancho + 'px, 0px, 0px)');
                det.addClass("slideTransition").css('-webkit-transform', 'translate3d(' + ancho + 'px, 0px, 0px)');
                setTimeout(function() {
                    main.removeClass("slideTransition").css({
                        "-webkit-transform": "",
                        "left": ""
                    }).removeClass("fuera");
                    det.css({
                        "-webkit-transform": "",
                        "left": ""
                    }).removeClass("slideTransition");
                    sacar("#detailView");
                }, 350);
            }, 50);
            activeView = 1;
        };

    var slideFromRight = function() {
            var main = $("#mainView");
            var det = $("#detailView");
            det.css("left", ancho);
            setTimeout(function() {
                var translate = 'translate3d(-' + ancho + 'px, 0px, 0px)';
                var cssTransform = {
                    '-webkit-transform': translate,
                    'transform': translate
                };
                main.addClass("slideTransition").css(cssTransform);
                det.addClass("slideTransition").css(cssTransform);
                setTimeout(function() { // Quita las propiedades de transition
                    var cssTransformBack = {
                        '-webkit-transform': '',
                        'transform': ''
                    };
                    det.css("left", 0).removeClass("slideTransition").removeClass("fuera").css(cssTransformBack);
                    main.removeClass("slideTransition").addClass("fuera").css(cssTransformBack);
                    activeView = 2;
                }, 351);
            }, 100);
        };

    var reveal = function(element) {
            var el = $(element);
            el.removeClass("fuera").addClass("invisible");
            setTimeout(function() {
                el.removeClass("invisible");
            });
        };

    // Metodos de vistas
    var mostrar = function(element) {
            var el = $(element);
            el.removeClass("oculto");
        };

    var sacar = function(element) {
            var el = $(element);
            el.addClass("fuera");
        };

    var ingresar = function(element) {
            var el = $(element);
            el.removeClass("fuera");
            return el;
        };

    var ocultar = function(element) {
            var el = $(element);
            el.addClass("oculto");
        };

    var ensenar = function(element) {
            var el = $(element);
            el.removeClass("invisible");
        };

    loadShots();

    var d = document,
        body = d.body;

    var supportOrientation = typeof window.orientation !== 'undefined',
        getScrollTop = function() {
            return window.pageYOffset || d.compatMode === 'CSS1Compat' && d.documentElement.scrollTop || body.scrollTop || 0;
        },
        scrollTop = function() {
            if(!supportOrientation) return;
            body.style.height = screen.height + 'px';
            setTimeout(function() {
                window.scrollTo(0, 1);
                var top = getScrollTop();
                window.scrollTo(0, top === 1 ? 0 : 1);
                body.style.height = window.innerHeight + 'px';
            }, 1);
        };

    scrollTop();

});