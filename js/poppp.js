(function(win) {
    // "Globals"
    var doc = win.document,
        body = doc.body,
        currentPage = 1,
        shotsPerPage = 30,
        activeView = 1,
        showingMenu = 0,
        channel = 'popular',
        ancho, shots = {},
        imgWidth, imgHeigth, lastData, currentColumn = 'two',
        currentShotURL;

    var V = { // View
        Action: {
            gotToMainSection: function() {
                V.Section.headerTitle.text('Poppp').removeClass('title-shot').addClass('title-main');
                var btnBack = V.Button.back, btnMenu = V.Button.menu, btnOpen = V.Button.open, btnRefresh = V.Button.refresh;
                btnBack.addClass("invisible"), btnOpen.addClass("invisible");
                btnMenu.removeClass('hide'), btnRefresh.removeClass('hide');
                setTimeout(function() {
                    btnBack.addClass("hide"), btnOpen.addClass('hide');
                    btnMenu.removeClass('invisible'), btnRefresh.removeClass('invisible');
                }, 351);
                V.Anims.slideFromLeft();
            },
            goToShotDetailSection: function() {
                V.Anims.slideFromRight();
                var btnBack = V.Button.back, btnMenu = V.Button.menu, btnOpen = V.Button.open, btnRefresh = V.Button.refresh;
                btnBack.removeClass('hide'), btnOpen.removeClass('hide');
                btnMenu.addClass('invisible'), btnRefresh.addClass('invisible');
                V.Misc.setMinImgSize();
                setTimeout(function() {
                    btnBack.removeClass('invisible'), btnOpen.removeClass('invisible');
                    btnMenu.addClass('hide'), btnRefresh.addClass('hide');
                    if(!isDesktop) V.Misc.scrollFixDetail();
                }, 200);
            },
            setHeaderShotTitle: function(shotID) {
                V.Section.headerTitle.text(shots[shotID].title).addClass('title-shot').removeClass('title-main');
            },
            toggleMenu: function(show) {
                showingMenu = show ? 0 : 1;
                $('#menu').css('-webkit-transform', show ? 'translate3d(0, 0, 0)' : 'translate3d(0, 344px, 0)');
            }
        },
        Section: {
            mainView: $("#mainView"),
            detailView: $("#detailView"),
            mainWrap: $("#mainWrap"),
            detailWrap: $("#detailWrap"),
            headerTitle: $(".title"),
            header: $("header")
        },
        Button: {
            back: $('#nav-back'),
            open: $("#open-shot"),
            menu: $('#show-menu'),
            refresh: $('#refresh')
        },
        Anims: {
            slideFromRight: function() { // <<<
                V.Misc.getWidth();
                var main = V.Section.mainView,
                    detail = V.Section.detailView;
                detail.css("left", ancho);
                setTimeout(function() {
                    var translate = 'translate3d(-' + ancho + 'px, 0px, 0px)';
                    var cssTransform = {
                        '-webkit-transform': translate,
                        'transform': translate
                    };
                    main.addClass("slideTransition").css(cssTransform);
                    detail.addClass("slideTransition").css(cssTransform);
                    setTimeout(function() { // Quita las propiedades de transition
                        var cssTransformBack = {
                            '-webkit-transform': '',
                            'transform': ''
                        };
                        detail.css("left", 0).removeClass("slideTransition").removeClass("fuera").css(cssTransformBack);
                        main.removeClass("slideTransition").addClass("fuera").css(cssTransformBack);
                        activeView = 2;
                    }, 351);
                }, 100);
            },
            slideFromLeft: function() { // >>>
                V.Misc.getWidth();
                var main = V.Section.mainView,
                    detail = V.Section.detailView;
                main.css("left", -ancho);
                setTimeout(function() {
                    main.addClass("slideTransition").css('-webkit-transform', 'translate3d(' + ancho + 'px, 0px, 0px)');
                    detail.addClass("slideTransition").css('-webkit-transform', 'translate3d(' + ancho + 'px, 0px, 0px)');
                    setTimeout(function() {
                        main.removeClass("slideTransition").css({
                            "-webkit-transform": "",
                            "left": ""
                        }).removeClass("fuera");
                        detail.css({
                            "-webkit-transform": "",
                            "left": ""
                        }).removeClass("slideTransition");
                        detail.addClass("fuera");
                    }, 351);
                }, 50);
                activeView = 1;
            }
        },
        Template: {
            detail: "<div id='detail-image'><img src='{{image_url}}'/></div><div id='shot-info'><p>{{title}}</p><p>by {{player.name}}</p><p>{{likes_count}}</p></div><div id='force-overflow'></div>",
            getMainTemplate: function(columnNum) {
                if(!columnNum) columnNum = '';
                else columnNum += '-column';
                return "<ul>{{#shots}}<li class='shot-wrap " + columnNum + "'><article class='shot' data-shot-id='{{id}}' style='background-image: url({{image_teaser_url}})'></article></li>{{/shots}}</ul><div class='load-more'>Load more</div>";
            }
        },
        Misc: {
            setMinImgSize: function() {
                var totalWidth = V.Misc.getWidth();
                imgWidth = totalWidth - 10; // 10 pixels of side padding - this should be dinamically obtained (todo).
                imgHeigth = imgWidth * 0.75;
                $('#detail-image > img').css({
                    'min-height': imgHeigth,
                    'min-width': imgWidth
                });
            },
            getWidth: function() {
                ancho = doc.body.offsetWidth;
                return ancho;
            },
            scrollFixDetail: function() {
                var detWrap = doc.querySelector('#detailWrap');
                var detailWrapHeight = detWrap.offsetHeight;
                var shotInfoHeight = detWrap.querySelector('#shot-info').offsetHeight;
                var minHeight = detailWrapHeight - imgHeigth - shotInfoHeight;
                $('#force-overflow').css('min-height', minHeight + 1);
            }
        }
    };

    // Main functions
    var Poppp = {
        loadShots: function(loadingMore) {
            $("#mainWrap").append("<p class='main-message'>Loading shots...</p>");
            $.ajax({
                dataType: 'jsonp',
                url: Poppp.getURL(),
                success: function(result) {
                    Poppp.showShots(result);
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
        },
        showShots: function(data) {
            if(!data) data = lastData;
            $(".main-message").remove();
            var html = Mustache.to_html(V.Template.getMainTemplate(currentColumn), data);
            $("#mainWrap").append(html);

            var loadedShots = data.shots;
            for(var i = 0; i < loadedShots.length; i++) {
                if(shots[loadedShots.id]) continue;
                shots[loadedShots[i].id] = loadedShots[i];
            }

            currentPage++;
        },
        getURL: function() {
            return "//api.dribbble.com/shots/" + channel + "?page=" + currentPage + "&per_page=" + shotsPerPage + "&callback=?";
        }
    };

    // Taps
    tappable(".shot", {
        onTap: function(e, target) {
            if(showingMenu) V.Action.toggleMenu(showingMenu);
            var id = $(target).data("shot-id"),
                det = V.Section.detailWrap;

            var html = Mustache.to_html(V.Template.detail, shots[id]);
            det.html(html);

            currentShotURL = shots[id].url;

            V.Action.setHeaderShotTitle(id);
            V.Action.goToShotDetailSection();
        }
    });

    tappable(".load-more", {
        onTap: function(e, target) {
            if(showingMenu) V.Action.toggleMenu(showingMenu);
            $(target).remove();
            Poppp.loadShots(true); // loadingMore = true
        },
        activeClass: 'load-more-active'
    });

    tappable("#nav-back", {
        onTap: function(e, target) {
            currentShotURL = '';
            V.Action.gotToMainSection();
        },
        activeClass: 'btn-active'
    });

    tappable("#refresh", {
        onTap: function() {
            currentPage = 1;
            $('#mainWrap').empty();
            if(showingMenu) V.Action.toggleMenu(showingMenu);
            Poppp.loadShots();
        },
        activeClass: 'btn-active'
    });

    tappable("#show-menu", {
        onTap: function() {
            if(activeView === 1) V.Action.toggleMenu(showingMenu);
        },
        activeClass: 'btn-active'
    });

    tappable('#menu > p', {
        onTap: function(e, target) {
            var choice = $(target),
                choiceText = choice.text().toLowerCase();
            V.Action.toggleMenu(showingMenu);
            if(choiceText === channel) return;
            channel = choiceText;
            currentPage = 1;
            $('#menu > p.menu-active').removeClass('menu-active');
            choice.addClass('menu-active');
            setTimeout(function() {
                $('#mainWrap').empty();
                Poppp.loadShots();
            }, 351);
        },
        activeClass: 'options-active'
    });

    tappable('#layout-option p', {
        onTap: function(e, target) {
            var choice = $(target);
            V.Action.toggleMenu(showingMenu);
            choice.toggleClass('two-icon');
            choice.toggleClass('three-icon');
            $('#mainWrap').empty();
            currentColumn = currentColumn === 'two' ? 'three' : 'two';
            Poppp.showShots();
        },
        activeClass: 'options-active'
    });

    tappable('#open-shot', {
        onTap: function() {
            var open = window.confirm('View this shot in Dribbble.com?');
            if(open) openURL(currentShotURL);
        },
        activeClass: 'btn-active'
    });

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

    function openURL(URL) {
        if(!URL) return;
        var a = document.createElement('a');
        a.setAttribute("href", URL);
        a.setAttribute("target", "_blank");

        var dispatch = document.createEvent("HTMLEvents");
        dispatch.initEvent("click", true, true);
        a.dispatchEvent(dispatch);
    }

    // Launch
    Poppp.loadShots();
    scrollTop();

    V.Section.header.on('touchmove', function(e) {
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