(function(win) {
    // "Globals"
    var doc = win.document,
        body = doc.body,
        page = 1,
        perPage = 30,
        activeView = 1,
        showingMenu = 0,
        channel = 'popular',
        ancho, shots = {},
        imgWidth, imgHeigth, lastData, currentColumn = 'two';

    // Templates
    var detailTemplate = "<div id='detail-image'><img src='{{image_url}}'/></div><div id='shot-info'><p>{{title}}</p><p>by {{player.name}}</p><p>{{likes_count}}</p></div><div id='force-overflow'></div>";

    function getMainTemplate(columnNum) {
        if(!columnNum) columnNum = '';
        else columnNum += '-column';
        return "{{#shots}}<article class='shot-wrap " + columnNum + "' data-shot-id='{{id}}'><div class='shot' style='background-image: url({{image_teaser_url}})'></div></article>{{/shots}}<div class='load-more'>Load more</div>";
    }

    // Main functions

    function loadShots(loadingMore) {
        $("#mainWrap").append("<p class='main-message'>Loading shots...</p>");
        $.ajax({
            dataType: 'jsonp',
            url: getURL(),
            success: function(result) {
                showShots(result);
                // If it's loading more shots, add the new shots into the old array
                if(loadingMore) {
                    var newShots = lastData.shots.concat(result.shots);
                    lastData.shots = newShots;
                } else {
                    lastData = result;
                }
            },
            error: function() {
                $('.main-message').text("Oops! Couldn't load shots. :(");
                $("#mainWrap").append("<div class='load-more'>Try reloading</div>");
            }
        });
    }

    function showShots(data) {
        if(!data) data = lastData;
        $(".main-message").remove();
        var html = Mustache.to_html(getMainTemplate(currentColumn), data);
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
        return ancho;
    }

    function scrollFixDetail() {
        var detWrap = doc.querySelector('#detailWrap');
        var detailWrapHeight = detWrap.offsetHeight;
        var shotInfoHeight = detWrap.querySelector('#shot-info').offsetHeight;
        var minHeight = detailWrapHeight - imgHeigth - shotInfoHeight;
        $('#force-overflow').css('min-height', minHeight + 1);
    }

    function toggleMenu(show) {
        showingMenu = show ? 0 : 1;
        $('#menu').css('-webkit-transform', show ? 'translate3d(0, 0, 0)' : 'translate3d(0, 344px, 0)');
    }

    function setMinImgSize() {
        var totalWidth = getWidth();
        imgWidth = totalWidth - 10; // 10 pixels of side padding - this should be dinamically obtained (todo).
        imgHeigth = imgWidth * 0.75;
        $('#detail-image > img').css({
            'min-height': imgHeigth,
            'min-width': imgWidth
        });
    }

    // Taps
    tappable(".shot-wrap", {
        onTap: function(e, target) {
            if(showingMenu) toggleMenu(showingMenu);
            var id = $(target).attr("data-shot-id");
            var det = $('#detailWrap');
            var html = Mustache.to_html(detailTemplate, shots[id]);
            det.html(html);
            $(".title").text(shots[id].title).addClass('title-shot').removeClass('title-main');
            slideFromRight();
            var backButton = $("#nav-back");
            backButton.removeClass('hide');
            var menuButton = $('#show-menu'),
                refreshButton = $('#refresh');
            menuButton.addClass('invisible'), refreshButton.addClass('invisible');
            setMinImgSize();
            setTimeout(function() {
                backButton.removeClass('invisible'), menuButton.addClass('hide'), refreshButton.addClass('hide');
                if(!isDesktop) scrollFixDetail();
            }, 200);
        }
    });

    tappable(".load-more", {
        onTap: function(e, target) {
            if(showingMenu) toggleMenu(showingMenu);
            $(target).remove();
            loadShots(true); // loadingMore = true
        },
        activeClass: 'load-more-active'
    });

    tappable("#nav-back", {
        onTap: function(e, target) {
            var backButton = $(target);
            backButton.addClass("invisible");
            var menuButton = $('#show-menu'),
                refreshButton = $('#refresh');
            menuButton.removeClass('hide'), refreshButton.removeClass('hide');
            $('.title').text('Poppp').removeClass('title-shot').addClass('title-main');
            setTimeout(function() {
                backButton.addClass("hide"), menuButton.removeClass('invisible'), refreshButton.removeClass('invisible');
            }, 351);
            slideFromLeft();
        },
        activeClass: 'btn-active'
    });

    tappable("#refresh", {
        onTap: function() {
            page = 1;
            $('#mainWrap').empty();
            if(showingMenu) toggleMenu(showingMenu);
            loadShots();
        },
        activeClass: 'btn-active'
    });

    tappable("#show-menu", {
        onTap: function() {
            if(activeView !== 1) return;
            toggleMenu(showingMenu);
        },
        activeClass: 'btn-active'
    });

    tappable('#menu > p', {
        onTap: function(e, target) {
            var choice = $(target),
                choiceText = choice.text().toLowerCase();
            toggleMenu(showingMenu);
            if(choiceText === channel) return;
            channel = choiceText;
            page = 1;
            $('.menu-active').removeClass('menu-active');
            choice.addClass('menu-active');
            setTimeout(function() {
                $('#mainWrap').empty();
                loadShots();
            }, 351);
        },
        activeClass: 'options-active'
    });

    tappable('#layout-options span', {
        onTap: function(e, target) {
            var choice = $(target),
                column = choice.data('column');
            toggleMenu(showingMenu);
            if(column === currentColumn) return;
            currentColumn = column;
            $('#layout-options span.menu-active').removeClass('menu-active');
            choice.addClass('menu-active');
            $('#mainWrap').empty();
            showShots();
        },
        activeClass: 'options-active'
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

    var isDesktop = !/iPhone|iPod|iPad|Android/.test(navigator.userAgent);
    if(isDesktop) {
        var deskLink = document.createElement('link');
        deskLink.rel = 'stylesheet';
        deskLink.href = 'css/desk.css';
        document.head.appendChild(deskLink);
    }

})(window);