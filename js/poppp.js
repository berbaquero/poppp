$(document).ready(function() {

    var shotTemplate = "{{#shots}}<article class='shotWrap'><div class='shot' style='background-image: url({{image_teaser_url}})'></div></article>{{/shots}}";

    var sliderTemplate = "<div id='slider'><div>{{#shots}}<div><div><img class='shotImage' data-img='{{image_url}}' src='{{image_teaser_url}}' /><p data-url='{{short_url}}'>{{title}}</p></div></div>{{/shots}}</div></div>";
	
    var page = 1, perPage = 30, ancho = 320, activeView = 1, slider,
    sobre = "Gracias por llegar hasta ac&aacute;! Poppp te da acceso r&aacute;pido a los Shots m&aacute;s populares de Dribbble, que son una tremenda fuente de inspiraci&oacute;n (para m&iacute;, al menos). Espero que la encuentres &uacute;til tambi&eacute;n, y te invito a que me env&iacute;es sugerencias :)";

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
                    var s = $('.shotImage[data-id="'+ pos +'"]');
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

    tappable("#title", {
        onTap: function() {
            reveal("#sobre");
        }
    });

    var scrollable = document.getElementById('container');
    new ScrollFix(scrollable);

    // Animaciones

    var slideFromLeft = function () {
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

    var slideFromRight = function () {
        var main = $("#mainView");
        var det = $("#detailView");
        det.css("left", ancho);
        setTimeout(function() {
            main.addClass("slideTransition").css('-webkit-transform', 'translate3d(-' + ancho + 'px, 0px, 0px)');
            det.addClass("slideTransition").css('-webkit-transform', 'translate3d(-' + ancho + 'px, 0px, 0px)');
            setTimeout(function () { // Quita las propiedades de transition
                det.css("left", 0).removeClass("slideTransition").css("-webkit-transform", "");
                main.removeClass("slideTransition").addClass("fuera").css("-webkit-transform", "");
            }, 350);
        }, 100);
        activeView = 2;
    };

    var reveal = function(element) {
        var el = $(element);
        el.removeClass("fuera").addClass("invisible");
        setTimeout(function() {
            el.removeClass("invisible");
        });
    };

    // Metodos de vistas

    var mostrar = function (element) {
        var el = $(element);
        el.removeClass("oculto");
    };

    var sacar = function (element) {
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

    var about = "<section class='fuera slideTransition' id='sobre'><div><p></p><p>Hecha en una Mac. Hacks por <a href='http://twitter.com/berbaquero'>@BerBaquero</a></p></div></section>";

    $("body").append(about);
    $("#sobre div p").first().html(sobre);

    $("#sobre").on('click', function(e) {
        $(this).addClass("fuera").addClass("invisible");
    });

    loadShots();

});