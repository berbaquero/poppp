(function(win) {
    // "Globals"
    var doc = win.document,
        body = doc.body,
        page = 1,
        perPage = 30,
        activeView = 1,
        channel = 'popular',
        slider, ancho, shots = {};

    // Templates
        detailTemplate = "<div id='detail-image'><img src='{{image_url}}'/></div><div id='shot-info'><p>{{title}}</p><p>By {{player.name}}</p><p id='heart'>{{likes_count}}</p></div>";
    var shotTemplate = "{{#shots}}<article class='shotWrap' data-shot-id='{{id}}'><div class='shot' style='background-image: url({{image_teaser_url}})'></div></article>{{/shots}}<div class='load-more'>Load more</div>",

    // Main functions

    function loadShots(loadingMore) {
        $("#mainWrap").append("<p class='main-message'>Loading shots...</p>");
        $.ajax({
            dataType: 'jsonp',
            url: getURL(),
            success: function(result) {
                showShots(result);
            },
            error: function() {
                $('.main-message').text("Oops! Couldn't load shots. :(");
                $("#mainWrap").append("<div class='load-more'>Try reloading</div>");
            }
        });
    }

    function showShots(data) {
        $(".main-message").remove();
        var html = Mustache.to_html(shotTemplate, data);
        $("#mainWrap").append(html);

        var loadedShots = data.shots;
        for(var i = 0; i < loadedShots.length; i++) {
            if(shots[loadedShots.id]) continue;
            shots[loadedShots[i].id] = loadedShots[i];
        }

        page++;
    }

    // Misc functions

    function getURL() {
        return "//api.dribbble.com/shots/" + channel + "?page=" + page + "&per_page=" + perPage + "&callback=?";
    }

    function getWidth() {
        ancho = doc.body.offsetWidth;
    }

    // Taps
    tappable(".shotWrap", {
        onTap: function(e, target) {
            var id = $(target).attr("data-shot-id");
            var det = $('#detailWrap');
            var html = Mustache.to_html(detailTemplate, shots[id]);
            det.html(html);
            $("#title").text(shots[id].title);
            slideFromRight();
            var button = $("#navBack");
            button.removeClass('hide');
            setTimeout(function() {
                button.removeClass('invisible');
            }, 10);
        }
    });

    tappable(".load-more", {
        onTap: function(e, target) {
            $(target).remove();
            loadShots();
        },
        activeClass: 'load-more-active'
    });

    tappable("#navBack", {
        onTap: function(e, target) {
            var button = $(target);
            button.addClass("invisible");
            $('#title').text('Poppp');
            setTimeout(function() {
                button.addClass("hide");
            }, 351);
            slideFromLeft();
        }
    });

    // Animaciones
    var slideFromLeft = function() { // >>>
            var main = $("#mainView");
            var det = $("#detailView");
            getWidth();
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
                }, 351);
            }, 50);
            activeView = 1;
        };

    var slideFromRight = function() { // <<<
            var main = $("#mainView");
            var det = $("#detailView");
            getWidth();
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

    // Metodos de vistas
    var sacar = function(element) {
            var el = $(element);
            el.addClass("fuera");
        };

    var ingresar = function(element) {
            var el = $(element);
            el.removeClass("fuera");
            return el;
        };

    var ensenar = function(element) {
            var el = $(element);
            el.removeClass("invisible");
        };

    var supportOrientation = typeof window.orientation !== 'undefined',
        getScrollTop = function() {
            return window.pageYOffset || doc.compatMode === 'CSS1Compat' && doc.documentElement.scrollTop || body.scrollTop || 0;
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

    // Launch
    loadShots();
    scrollTop();

    $("header").on('touchmove', function(e) {
        e.preventDefault();
    }, false);

    window.applicationCache.addEventListener("updateready", function(e) {
        var update = window.confirm("Update descargado. Recargar para actualizar?");
        if(update) {
            window.location.reload();
        }
    });

})(window);