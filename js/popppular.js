$(document).ready(function() {

	var shotTemplate1 = "{{#shots}}<article class='shotWrap'><img class='shot' src='{{image_url}}'></div></article>{{/shots}}";

	var shotTemplate = "{{#shots}}<article class='shotWrap'><div class='shot' style='background-image: url({{image_teaser_url}})'></div></article>{{/shots}}";

	var sliderTemplate = "<div id='slider'><div>{{#shots}}<div><div><img class='shotImage' src='{{image_url}}' /><p>{{title}}</p></div></div>{{/shots}}</div></div>";
	
	var page = 1, perPage = 20, ancho = 320, activeView = 1, slider;

	var loadShots = function() {
		var main = $("#wrapper");
		main.append("<p class='loading'>Loading shots...</p>");
		$.getJSON("http://api.dribbble.com/shots/popular?page=" + page + "&per_page=" + perPage + "&callback=?", function(data) {
			$(".loading").remove();
			var html = Mustache.to_html(shotTemplate, data);
			main.append(html);
			var sliderHtml = Mustache.to_html(sliderTemplate, data);
			$("#detailView").append(sliderHtml);
			slider = new Swipe(document.getElementById('slider'));			
			page++;
			var lista = $(".shotWrap");
			$.each(lista, function(i, s) {
				$(s).attr("data-shot", i);
			});
		});
	}

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

    var scrollable = document.getElementById('container');
    new ScrollFix(scrollable);

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
	}

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
	}

	var mostrar = function (element) {
	    var el = $(element);
	    el.removeClass("oculto");
	}

	var sacar = function (element) {
	    var el = $(element);
	    el.addClass("fuera");
	}

	var ingresar = function(element) {
	    var el = $(element);
	    el.removeClass("fuera");
	}

	var ocultar = function(element) {
	    var el = $(element);
	    el.addClass("oculto");
	}

	var ensenar = function(element) {
	    var el = $(element);
	    el.removeClass("invisible");
	}

    loadShots();

});