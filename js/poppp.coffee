win = window
doc = win.document
body = doc.body
# Pseudo-Globals
currentPage = 1
shotsPerPage = 30
activeView = 1
showingMenu = false
channel = "popular"
width = 320
shots = {}
imgWidth = 0
imgHeight = 0
lastData = {}
currentColumn = "two"
currentShotURL = ""

V = #View
  Action:
    goToMainView: ->
      V.HeaderTitle.text("Poppp").removeClass("title-shot").addClass("title-main")
      btnBack = V.Button.Back
      btnMenu = V.Button.Menu
      btnOpen = V.Button.Open
      btnRefresh = V.Button.Refresh
      btnBack.addClass("invisible")
      btnOpen.addClass("invisible")
      btnMenu.removeClass("hide")
      btnRefresh.removeClass("hide")
      setTimeout ->
        btnBack.addClass("hide")
        btnOpen.addClass("hide")
        btnMenu.removeClass("invisible")
        btnRefresh.removeClass("invisible")
      , 351
      V.Anims.slideFromLeft()
      
    goToDetailView: ->
      V.Anims.slideFromRight()
      btnBack = V.Button.Back
      btnMenu = V.Button.Menu
      btnOpen = V.Button.Open
      btnRefresh = V.Button.Refresh
      btnBack.removeClass("hide")
      btnOpen.removeClass("hide")
      btnMenu.addClass("invisible")
      btnRefresh.addClass("invisible")
      V.Misc.setMinImgSize()
      setTimeout ->
        btnBack.removeClass("invisible")
        btnOpen.removeClass("invisible")
        btnMenu.addClass("hide")
        btnRefresh.addClass("hide")
      , 351
      
    setHeaderShotTitle: (shotID) ->
      V.HeaderTitle.text(shots[shotID].title).addClass("title-shot").removeClass("title-main")
    
    toggleMenu: (show) ->
      showingMenu = if show then 0 else 1
      V.Menu.css "-webkit-transform", if show then "translate3d(0, 0, 0)" else "translate3d(0, 344px, 0)"
    
  MainView: $ "#mainView"
  DetailView: $ "#detailView"
  MainWrap: $ "#mainWrap"
  DetailWrap: $ "#detailWrap"
  HeaderTitle: $ ".title"
  Header: $ "header"
  Menu: $ "#menu"
    
  Button:
    Back: $ "#nav-back"
    Open: $ "#open-shot"
    Menu: $ "#show-menu"
    Refresh: $ "#refresh"
    
  Anims:
    slideFromRight: -> # <<<
      V.Misc.getWidth()
      main = V.MainView
      detail = V.DetailView
      detail.css "left", width

      setTimeout ->
        translate = "translate3d(-" + width + "px, 0px, 0px)"
        cssTransform =
          "-webkit-transform": translate
          "transform": translate
        main.addClass("slideTransition").css(cssTransform)
        detail.addClass("slideTransition").css(cssTransform)
        setTimeout ->
          cssTransformBack =
            "-webkit-transform": ""
            "transform": ""
          detail.css("left", 0).removeClass("slideTransition").removeClass("fuera").css(cssTransformBack)
          main.removeClass("slideTransition").addClass("fuera").css(cssTransformBack)
          activeView = 2
        , 351
      , 100

    slideFromLeft: -> # >>>
      V.Misc.getWidth()
      main = V.MainView
      detail = V.DetailView
      main.css "left", -width
      setTimeout ->
        main.addClass("slideTransition").css("-webkit-transform", "translate3d(" + width + "px, 0px, 0px)")
        detail.addClass("slideTransition").css("-webkit-transform", "translate3d(" + width + "px, 0px, 0px)")
        setTimeout ->
          main.removeClass("slideTransition").css(
            "-webkit-transform": ""
            "left": ""
          ).removeClass("fuera")
          detail.css(
            "-webkit-transform": ""
            "left": ""
          ).removeClass("slideTransition")
          detail.addClass "fuera"
        , 351
      , 50
      activeView = 1

  Misc:
    setMinImgSize: ->
      totalWidth = V.Misc.getWidth()
      imgWidth = totalWidth - 10 # 10 pixels of side padding - this should be dinamically obtained (todo).
      imgHeigth = imgWidth * 0.75
      $("#detail-image > img").css
          "min-height": imgHeigth
          "min-width": imgWidth
      
    getWidth: ->
      width = body.offsetWidth
      width

T = # Templates
  getMainViewTemplate: (columnNumber) ->
    unless columnNumber
      columnNumber = ""
    else
      columnNumber += "-column"
    "{{#shots}}<article class='shot-wrap " + columnNumber + "'><img class='shot' data-shot-id='{{id}}' src='{{image_teaser_url}}'/></article>{{/shots}}<div class='load-more'>Load more</div>"

  detailView: "<div id='detail-image'><img src='{{image_url}}'/></div><div id='shot-info'><p>{{title}}</p><p>by {{player.name}}</p><p>{{likes_count}}</p></div><div id='force-overflow'></div>"


# Main functions
Poppp =
  loadShots: (loadingMore) ->
    V.MainWrap.append("<p class='main-message'>Loading shots...</p>")
    $.ajax(
      dataType: "jsonp"
      url: Poppp.getURL()
      success: (data) ->
        Poppp.showShots(data)
        # If it's loading more shots, add the new shots into the old array
        if loadingMore
            newShots = lastData.shots.concat(data.shots)
            lastData.shots = newShots
        else lastData = data
      error: ->
        $(".main-message").text("Oops! Couldn't load shots. :(")
        V.MainWrap.append("<div class='load-more'>Try reloading</div>")
    )

  showShots: (data) ->
    data = lastData unless data
    $(".main-message").remove()
    html = Mustache.to_html T.getMainViewTemplate(currentColumn), data
    main = V.MainWrap
    main.append html
    setTimeout ->
      main.css "opacity", 1
    , 100

    loadedShots = data.shots
    for shot in loadedShots
      continue if shots[shot.id]
      shots[shot.id] = shot

    currentPage++

  getURL: ->
    "//api.dribbble.com/shots/" + channel + "?page=" + currentPage + "&per_page=" + shotsPerPage + "&callback=?"

# Taps
tappable(".shot",
  onTap: (e, target) ->
    V.Action.toggleMenu(showingMenu) if showingMenu
    id = $(target).data("shot-id")
    detail = V.DetailWrap

    html = Mustache.to_html T.detailView, shots[id]
    detail.html(html);
    currentShotURL = shots[id].url

    V.Action.setHeaderShotTitle id
    V.Action.goToDetailView()
)

tappable(".load-more",
  onTap: (e, target) ->
    V.Action.toggleMenu(showingMenu) if showingMenu
    $(target).remove()
    Poppp.loadShots true # loadingMore = true

  activeClass: "load-more-active"
)

tappable("#nav-back",
  onTap: ->
    currentShotURL = ""
    V.Action.goToMainView()

  activeClass: "btn-active"
)

tappable("#refresh",
  onTap: ->
    currentPage = 1
    V.MainWrap.empty()
    V.Action.toggleMenu(showingMenu) if showingMenu
    Poppp.loadShots()

  activeClass: "btn-active"
)

tappable("#show-menu",
  onTap: ->
    V.Action.toggleMenu(showingMenu) if activeView is 1

  activeClass: "btn-active"
)

tappable("#menu > p",
  onTap: (e, target) ->
    choice = $ target
    choiceText =  choice.text().toLowerCase()
    V.Action.toggleMenu(showingMenu)
    return if choiceText is channel
    channel = choiceText
    currentPage = 1
    $("#menu > p.menu-active").removeClass "menu-active"
    choice.addClass "menu-active"
    setTimeout ->
      V.MainWrap.empty()
      Poppp.loadShots()
    , 351

  activeClass: "options-active"
)

tappable("#layout-option p",
  onTap: (e, target) ->
    choice = $ target
    V.Action.toggleMenu(showingMenu)
    choice.toggleClass "two-icon"
    choice.toggleClass "three-icon"
    main = V.MainWrap
    currentColumn = if currentColumn is "two" then "three" else "two"
    shotsWraps = $(".shot-wrap")
    shotsWraps.toggleClass "two-column"
    shotsWraps.toggleClass "three-column"

  activeClass: "options-active"
)

tappable("#open-shot",
  onTap: ->
    open = win.confirm "View this shot in Dribbble.com?"
    openURL currentShotURL if open

  activeClass: "btn-active"
)

supportOrientation = typeof window.orientation isnt "undefined"
getScrollTop = ->
  window.pageYOffset or doc.compatMode is "CSS1Compat" and doc.documentElement.scrollTop or body.scrollTop or 0
scrollTop = ->
  return unless supportOrientation
  body.style.height = screen.height + "px"
  setTimeout ->
    win.scrollTo 0, 1
    top = getScrollTop()
    win.scrollTo 0, if top is 1 then 0 else 1
    body.style.height = win.innerHeight + "px"
  , 1

openURL = (URL) ->
  return unless URL
  a = doc.createElement "a"
  a.setAttribute "href", URL
  a.setAttribute "target", "_blank"

  dispatch = doc.createEvent "HTMLEvents"
  dispatch.initEvent "click", true, true
  a.dispatchEvent(dispatch)

# App Launch
Poppp.loadShots()
scrollTop()

V.Header.on "touchmove", (e) ->
  e.preventDefault()
, false

V.DetailWrap.on "touchmove", (e) ->
  e.preventDefault()
, false

win.applicationCache.addEventListener "updateready", (e) ->
  update = window.confirm "Update ready. Refresh to update?"
  window.location.reload() if update

isDesktop = !/iPhone|iPod|iPad|Android/.test navigator.userAgent
if isDesktop
  deskLink = doc.createElement "link"
  deskLink.rel = "stylesheet"
  deskLink.href = "css/desk.css"
  doc.head.appendChild deskLink