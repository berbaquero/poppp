win = window
doc = win.document
body = doc.body
store = win.localStorage
# Pseudo-Globals
currentPage = 1
shotsPerPage = 30
activeView = 1
showingMenu = false
width = 320
shots = {}
imgWidth = 0
imgHeight = 0
lastData = {}
currentShotURL = ""
columns = ["one", "two", "three"]
transSpeed =
  btn: 201
  view: 351
Msgs =
  enterUsername: "Enter your Dribbble username"
  shotSaved: "Shot saved to Local Bucket"
  loadingError: "Oops! Couldn't load shots. :("

V = #Views
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
      , transSpeed.btn
      V.Anims.slideFromLeft()
      
    goToDetailView: ->
      V.Anims.slideFromRight()
      btnBack = V.Button.Back
      btnMenu = V.Button.Menu
      btnOpen = V.Button.Open
      btnRightCorner= if showingMenu then V.Button.Settings else V.Button.Refresh
      btnBack.removeClass("hide")
      btnOpen.removeClass("hide")
      btnMenu.addClass("invisible")
      btnRightCorner.addClass("invisible")
      setTimeout ->
        btnBack.removeClass("invisible")
        btnOpen.removeClass("invisible")
        btnMenu.addClass("hide")
        btnRightCorner.addClass("hide")
      , transSpeed.btn
      
    setHeaderShotTitle: (shotID) ->
      V.HeaderTitle.text(shots[shotID].title).addClass("title-shot").removeClass("title-main")
    
    toggleMenu: (show, toDetail) -> # show: boolean - whether to show or hide the menu, toDetail: boolean - if it'll show the detail view
      showingMenu = if show then 0 else 1
      V.Menu.css "-webkit-transform", if show then "translate3d(0, 0, 0)" else "translate3d(0, 344px, 0)"

      if show
        V.Button.Settings.addClass("invisible")
        V.Button.Refresh.removeClass("hide")
        setTimeout ->
          V.Button.Settings.addClass("hide")
          V.Button.Refresh.removeClass("invisible")
        , transSpeed.btn
      else
        V.Button.Refresh.addClass("invisible")
        V.Button.Settings.removeClass("hide")
        setTimeout ->
          V.Button.Refresh.addClass("hide")
          V.Button.Settings.removeClass("invisible")
        , transSpeed.btn
  
    changeStreamSelection: (channel) ->
      channel = M.Channel.get() unless channel
      V.MainWrap.data("channel", if channel is "following" then M.Player.get() + "'s following" else channel)
      $("#menu p.menu-active").removeClass "menu-active"
      $("#menu p[data-choice='" + channel + "']").addClass "menu-active"

    switch3ColumnWrapper: ->
      if columns[M.Column.get()] is "three" then V.MainWrap.addClass "three-column-wrapper" else V.MainWrap.removeClass "three-column-wrapper"

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
    Settings: $ "#settings"
    
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
        , transSpeed.view
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
        , transSpeed.view
      , 50
      activeView = 1

  Misc:
    getWidth: ->
      body.offsetWidth

M = # Models
  localBucket:
    shots: []
    load: ->
      lb = store.getItem("localBucket")
      M.localBucket.shots = JSON.parse(lb) if lb
      M.localBucket.shots

    save: ->
      store.setItem("localBucket", JSON.stringify(M.localBucket.shots))

    add: (shotToSave) ->
      alreadySaved = false
      for shot in M.localBucket.shots
        if shot.id is shotToSave.id
          alreadySaved = true
          break
          
      unless alreadySaved
        M.localBucket.shots.push shotToSave
        M.localBucket.save()

      !alreadySaved # returns true if the shot was added

  Comments:
    loaded: {}

  Config:    
    load: ->
      config = store.getItem("Poppp:Config")
      if config
        config = JSON.parse(config)
        M.Channel.self = config.Channel
        M.Player.self = config.Player
        M.Column.current = config.Column
      else
        M.Channel.self = "popular"
        M.Player.self = ""
        M.Column.current = 0

    save: ->
      config =
        Channel: M.Channel.self
        Player: M.Player.self
        Column: M.Column.current
      store.setItem("Poppp:Config", JSON.stringify(config))

  Channel:
    self: ""

    get: ->
      M.Channel.self

    set: (channel) ->
      M.Channel.self = channel
      M.Config.save()

  Player:
    self: ""

    get: ->
      M.Player.self

    set: (player) ->
      M.Player.self = player
      M.Config.save()

  Column:
    current: 0

    get: ->
      M.Column.current
    
    set: (column) ->
      M.Column.current = column
      M.Config.save()

T = # Templates
  getMainViewTemplate: (columnNumber) ->
    if columnNumber is "one"
      "{{#shots}}<article class='one-column'><div class='shot-player'><div style='background-image: url({{player.avatar_url}})'></div></div><div class='shot-image'><img class='shot' data-shot-id='{{id}}' src='{{image_teaser_url}}' onLoad='this.classList.add(\"done\")'/></div><div class='shot-data'><p class='shot-data-likes'>{{likes_count}}</p><p class='shot-data-comments'>{{comments_count}}</p></div></article>{{/shots}}"
    else
      columnNumber += "-column"
      "{{#shots}}<article class='" + columnNumber + "'><img class='shot' data-shot-id='{{id}}' src='{{image_teaser_url}}' onLoad='this.classList.add(\"done\")'/></article>{{/shots}}"

  detailView: "<div id='detail-image'><img src='{{image_url}}'/></div><div id='shot-info'><p>{{title}}</p><p>by {{player.name}}</p><p>{{likes_count}}</p><div class='btn-save' data-shot-id='{{id}}'></div></div><div id='force-overflow'></div>"

  btnLoadMore:
    "<div class='load-more'>Load more</div>"

  comments:
    "<div id='shot-comments'>{{#comments}}<article class='shot-comment'><div class='player-avatar' style='background-image: url({{player.avatar_url}})'></div><div class='comment-data'><p class='comment-player-name'>{{player.name}}</p><p class='comment-body'>{{{body}}}</p></div></article>{{/comments}}</div>"

Poppp =
  loadShots: (channel) ->
    channel = M.Channel.get() unless channel
    switch channel
      when "following", "popular", "debuts", "everyone"

        V.MainWrap.append("<p class='main-message'>Loading shots...</p>")
        $.ajax(
          dataType: "jsonp"
          url: Poppp.getURL channel
          success: (data) ->
            Poppp.showShots(data)
            # If it's loading more shots, add the new shots into the old array
            # if loadMore
            #     newShots = lastData.shots.concat(data.shots)
            #     lastData.shots = newShots
            # else lastData = data
            lastData = data
          error: ->
            $(".main-message").text(Msgs.loadingError)
            V.MainWrap.append "<div class='load-more'>Try reloading</div>"
        )

      when "local bucket"
        M.localBucket.load() if M.localBucket.shots.length is 0
        Poppp.showShots(M.localBucket)
        lastData.shots = M.localBucket.shots

  showShots: (data) ->
    data = lastData unless data
    $(".main-message").remove()
    html = Mustache.to_html T.getMainViewTemplate(columns[M.Column.get()]), data
    V.MainWrap.append html

    loadedShots = data.shots
    for shot in loadedShots
      continue if shots[shot.id]
      shots[shot.id] = shot

    currentPage++

  refresh: ->
    currentPage = 1
    V.MainWrap.empty()
    V.Action.toggleMenu(showingMenu) if showingMenu
    Poppp.loadShots()

  changeLayout: ->
    currentColumn = M.Column.get()
    currentColumn++
    currentColumn = 0 if currentColumn is columns.length
    M.Column.set currentColumn
    V.MainWrap.empty()
    V.Action.switch3ColumnWrapper()
    Poppp.showShots lastData

  getURL: (channel) ->
    channel = M.Channel.get() unless channel
    if channel is "following"
      "//api.dribbble.com/players/" + M.Player.get() + "/shots/following" + "?per_page=" + shotsPerPage + "&callback=?"
    else
      "//api.dribbble.com/shots/" + channel + "?page=" + currentPage + "&per_page=" + shotsPerPage + "&callback=?"

  getShotById: (shotID) -> # shotID: int
    for shot in lastData.shots
      if shot.id is shotID
        foundShot = shot
        break
    foundShot

  loadComments: (shotID) ->
    if M.Comments.loaded[shotID]
      V.DetailWrap.append M.Comments.loaded[shotID]

    else
      $.ajax(
        dataType: "jsonp"
        url: "//api.dribbble.com/shots/" + shotID + "/comments"
        success: (data) ->
          commentsHTML = Mustache.to_html T.comments, data
          M.Comments.loaded[shotID] = commentsHTML
          V.DetailWrap.append commentsHTML
      )

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
    Poppp.loadComments id
)

# tappable(".load-more",
#   onTap: (e, target) ->
#     V.Action.toggleMenu(showingMenu) if showingMenu
#     $(target).remove()
#     Poppp.loadShots

#   activeClass: "load-more-active"
# )

tappable("#settings",
  onTap: ->
    newPlayer = win.prompt(Msgs.enterUsername, M.Player.get())
    if newPlayer
      M.Player.set(newPlayer)
      if M.Channel.get() is "following"
        Poppp.refresh()
        V.Action.changeStreamSelection()

  activeClass: "btn-active"
)

tappable("#nav-back",
  onTap: ->
    currentShotURL = ""
    V.Action.goToMainView()

  activeClass: "btn-active"
)

tappable("#refresh",
  onTap: ->    
    Poppp.refresh()

  activeClass: "btn-active"
)

tappable("#show-menu",
  onTap: ->
    V.Action.toggleMenu(showingMenu) if activeView is 1

  activeClass: "btn-active"
)

tappable("#menu p",
  onTap: (e, target) ->
    choice = $ target
    choiceText = choice.text().toLowerCase()
    V.Action.toggleMenu(showingMenu)

    if choiceText is "layout"
      Poppp.changeLayout()
    else
      return if choiceText is M.Channel.get()

      if choiceText is "following" and not M.Player.get()
        newPlayer = win.prompt(Msgs.enterUsername)
        if newPlayer then M.Player.set(newPlayer) else return

      currentPage = 1
      setTimeout ->
        V.MainWrap.empty()
        Poppp.loadShots choiceText
      , transSpeed.view

      V.Action.changeStreamSelection choiceText
      M.Channel.set choiceText

  activeClass: "options-active"
)

tappable("#open-shot",
  onTap: ->
    open = win.confirm "View this shot in Dribbble.com?"
    openURL currentShotURL if open

  activeClass: "btn-active"
)

tappable(".btn-save",
  onTap: (e, target) ->
    shotID = $(target).data("shot-id")
    shotToSave = Poppp.getShotById(parseInt(shotID, 10))
    saved = M.localBucket.add shotToSave
    win.alert(Msgs.shotSaved) if saved

  activeClass: "btn-save-active"
)

# Swipes
V.DetailView.swipeRight ->
  V.Action.goToMainView()

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
M.Config.load()
V.Action.switch3ColumnWrapper()
Poppp.loadShots()
scrollTop()
V.Action.changeStreamSelection()

if win.navigator.standalone # only on iOS in fullscreen
  V.Header.on "touchmove", (e) ->
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