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

    var View = {
        Action: {
            gotToMainSection: function() {
                View.Section.headerTitle.text('Poppp').removeClass('title-shot').addClass('title-main');
                View.Button.back.addClass("invisible"), View.Button.open.addClass("invisible");
                View.Button.menu.removeClass('hide'), View.Button.refresh.removeClass('hide');
                setTimeout(function() {
                    View.Button.back.addClass("hide"), View.Button.open.addClass('hide');
                    View.Button.menu.removeClass('invisible'), View.Button.refresh.removeClass('invisible');
                }, 351);
                View.Animation.slideFromLeft();
            },
            goToShotDetailSection: function() {
                View.Animation.slideFromRight();
                View.Button.back.removeClass('hide'), View.Button.open.removeClass('hide');
                View.Button.menu.addClass('invisible'), View.Button.refresh.addClass('invisible');
                View.Misc.setMinImgSize();
                setTimeout(function() {
                    View.Button.back.removeClass('invisible'), View.Button.open.removeClass('invisible');
                    View.Button.menu.addClass('hide'), View.Button.refresh.addClass('hide');
                    if(!isDesktop) View.Misc.scrollFixDetail();
                }, 200);
            },
            setHeaderShotTitle: function(shotID) {
                View.Section.headerTitle.text(shots[shotID].title).addClass('title-shot').removeClass('title-main');
            },
            toggleMenu: function(show) {
                showingMenu = show ? 0 : 1;
                $('#menu').css('-webkit-transform', show ? 'translate3d(0, 0, 0)' : 'translate3d(0, 344px, 0)');
            }
        },
        Section: {
            main: $("#mainView"),
            detail: $("#detailView"),
            headerTitle: $(".title"),
            header: $("header")
        },
        Button: {
            back: $('#nav-back'),
            open: $("#open-shot"),
            menu: $('#show-menu'),
            refresh: $('#refresh')
        },
        Animation: {
            slideFromRight: function() { // <<<
                View.Misc.getWidth();
                View.Section.detail.css("left", ancho);
                setTimeout(function() {
                    var translate = 'translate3d(-' + ancho + 'px, 0px, 0px)';
                    var cssTransform = {
                        '-webkit-transform': translate,
                        'transform': translate
                    };
                    View.Section.main.addClass("slideTransition").css(cssTransform);
                    View.Section.detail.addClass("slideTransition").css(cssTransform);
                    setTimeout(function() { // Quita las propiedades de transition
                        var cssTransformBack = {
                            '-webkit-transform': '',
                            'transform': ''
                        };
                        View.Section.detail.css("left", 0).removeClass("slideTransition").removeClass("fuera").css(cssTransformBack);
                        View.Section.main.removeClass("slideTransition").addClass("fuera").css(cssTransformBack);
                        activeView = 2;
                    }, 351);
                }, 100);
            },
            slideFromLeft: function() { // >>>
                View.Misc.getWidth();
                View.Section.main.css("left", -ancho);
                setTimeout(function() {
                    View.Section.main.addClass("slideTransition").css('-webkit-transform', 'translate3d(' + ancho + 'px, 0px, 0px)');
                    View.Section.detail.addClass("slideTransition").css('-webkit-transform', 'translate3d(' + ancho + 'px, 0px, 0px)');
                    setTimeout(function() {
                        View.Section.main.removeClass("slideTransition").css({
                            "-webkit-transform": "",
                            "left": ""
                        }).removeClass("fuera");
                        View.Section.detail.css({
                            "-webkit-transform": "",
                            "left": ""
                        }).removeClass("slideTransition");
                        View.Section.detail.addClass("fuera");
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
                var totalWidth = View.Misc.getWidth();
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
            var html = Mustache.to_html(View.Template.getMainTemplate(currentColumn), data);
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
            if(showingMenu) View.Action.toggleMenu(showingMenu);
            var id = $(target).data("shot-id"),
                det = $('#detailWrap');

            var html = Mustache.to_html(View.Template.detail, shots[id]);
            det.html(html);

            currentShotURL = shots[id].url;

            View.Action.setHeaderShotTitle(id);
            View.Action.goToShotDetailSection();
        }
    });

    tappable(".load-more", {
        onTap: function(e, target) {
            if(showingMenu) View.Action.toggleMenu(showingMenu);
            $(target).remove();
            Poppp.loadShots(true); // loadingMore = true
        },
        activeClass: 'load-more-active'
    });

    tappable("#nav-back", {
        onTap: function(e, target) {
            currentShotURL = '';
            View.Action.gotToMainSection();
        },
        activeClass: 'btn-active'
    });

    tappable("#refresh", {
        onTap: function() {
            currentPage = 1;
            $('#mainWrap').empty();
            if(showingMenu) View.Action.toggleMenu(showingMenu);
            Poppp.loadShots();
        },
        activeClass: 'btn-active'
    });

    tappable("#show-menu", {
        onTap: function() {
            if(activeView === 1) View.Action.toggleMenu(showingMenu);
        },
        activeClass: 'btn-active'
    });

    tappable('#menu > p', {
        onTap: function(e, target) {
            var choice = $(target),
                choiceText = choice.text().toLowerCase();
            View.Action.toggleMenu(showingMenu);
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
            View.Action.toggleMenu(showingMenu);
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

    View.Section.header.on('touchmove', function(e) {
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