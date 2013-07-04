(function(){var M,Msgs,Poppp,T,V,activeView,body,columns,currentPage,currentShotURL,deskLink,doc,getScrollTop,imgHeight,imgWidth,isDesktop,lastData,openURL,scrollTop,shots,shotsPerPage,showingMenu,store,supportOrientation,transSpeed,width,win;win=window;doc=win.document;body=doc.body;store=win.localStorage;currentPage=1;shotsPerPage=30;activeView=1;showingMenu=false;width=320;shots={};imgWidth=0;imgHeight=0;lastData={};currentShotURL="";columns=["one","two","three"];transSpeed={btn:201,view:351};
Msgs={enterUsername:"Enter your Dribbble username",shotSaved:"Shot saved to Local Bucket",loadingError:"Oops! Couldn't load shots. :("};V={Action:{goToMainView:function(){var btnBack,btnMenu,btnOpen,btnRefresh;V.HeaderTitle.text("Poppp").removeClass("title-shot").addClass("title-main");btnBack=V.Button.Back;btnMenu=V.Button.Menu;btnOpen=V.Button.Open;btnRefresh=V.Button.Refresh;btnBack.addClass("invisible");btnOpen.addClass("invisible");btnMenu.removeClass("hide");btnRefresh.removeClass("hide");setTimeout(function(){btnBack.addClass("hide");
btnOpen.addClass("hide");btnMenu.removeClass("invisible");return btnRefresh.removeClass("invisible")},transSpeed.btn);return V.Anims.slideFromLeft()},goToDetailView:function(){var btnBack,btnMenu,btnOpen,btnRightCorner;V.Anims.slideFromRight();btnBack=V.Button.Back;btnMenu=V.Button.Menu;btnOpen=V.Button.Open;btnRightCorner=showingMenu?V.Button.Settings:V.Button.Refresh;btnBack.removeClass("hide");btnOpen.removeClass("hide");btnMenu.addClass("invisible");btnRightCorner.addClass("invisible");V.Misc.setMinImgSize();
return setTimeout(function(){btnBack.removeClass("invisible");btnOpen.removeClass("invisible");btnMenu.addClass("hide");return btnRightCorner.addClass("hide")},transSpeed.btn)},setHeaderShotTitle:function(shotID){return V.HeaderTitle.text(shots[shotID].title).addClass("title-shot").removeClass("title-main")},toggleMenu:function(show,toDetail){showingMenu=show?0:1;V.Menu.css("-webkit-transform",show?"translate3d(0, 0, 0)":"translate3d(0, 344px, 0)");if(show){V.Button.Settings.addClass("invisible");
V.Button.Refresh.removeClass("hide");return setTimeout(function(){V.Button.Settings.addClass("hide");return V.Button.Refresh.removeClass("invisible")},transSpeed.btn)}else{V.Button.Refresh.addClass("invisible");V.Button.Settings.removeClass("hide");return setTimeout(function(){V.Button.Refresh.addClass("hide");return V.Button.Settings.removeClass("invisible")},transSpeed.btn)}},changeStreamSelection:function(channel){if(!channel)channel=M.Channel.get();V.MainWrap.data("channel",channel==="following"?
M.Player.get()+"'s following":channel);$("#menu p.menu-active").removeClass("menu-active");return $("#menu p[data-choice='"+channel+"']").addClass("menu-active")},switch3ColumnWrapper:function(){if(columns[M.Column.get()]==="three")return V.MainWrap.addClass("three-column-wrapper");else return V.MainWrap.removeClass("three-column-wrapper")}},MainView:$("#mainView"),DetailView:$("#detailView"),MainWrap:$("#mainWrap"),DetailWrap:$("#detailWrap"),HeaderTitle:$(".title"),Header:$("header"),Menu:$("#menu"),
Button:{Back:$("#nav-back"),Open:$("#open-shot"),Menu:$("#show-menu"),Refresh:$("#refresh"),Settings:$("#settings")},Anims:{slideFromRight:function(){var detail,main;V.Misc.getWidth();main=V.MainView;detail=V.DetailView;detail.css("left",width);return setTimeout(function(){var cssTransform,translate;translate="translate3d(-"+width+"px, 0px, 0px)";cssTransform={"-webkit-transform":translate,"transform":translate};main.addClass("slideTransition").css(cssTransform);detail.addClass("slideTransition").css(cssTransform);
return setTimeout(function(){var cssTransformBack;cssTransformBack={"-webkit-transform":"","transform":""};detail.css("left",0).removeClass("slideTransition").removeClass("fuera").css(cssTransformBack);main.removeClass("slideTransition").addClass("fuera").css(cssTransformBack);return activeView=2},transSpeed.view)},100)},slideFromLeft:function(){var detail,main;V.Misc.getWidth();main=V.MainView;detail=V.DetailView;main.css("left",-width);setTimeout(function(){main.addClass("slideTransition").css("-webkit-transform",
"translate3d("+width+"px, 0px, 0px)");detail.addClass("slideTransition").css("-webkit-transform","translate3d("+width+"px, 0px, 0px)");return setTimeout(function(){main.removeClass("slideTransition").css({"-webkit-transform":"","left":""}).removeClass("fuera");detail.css({"-webkit-transform":"","left":""}).removeClass("slideTransition");return detail.addClass("fuera")},transSpeed.view)},50);return activeView=1}},Misc:{setMinImgSize:function(){var imgHeigth,totalWidth;totalWidth=V.Misc.getWidth();
imgWidth=totalWidth-10;imgHeigth=imgWidth*0.75;return $("#detail-image > img").css({"min-height":imgHeigth,"min-width":imgWidth})},getWidth:function(){width=body.offsetWidth;return width}}};M={localBucket:{shots:[],load:function(){var lb;lb=store.getItem("localBucket");if(lb)M.localBucket.shots=JSON.parse(lb);return M.localBucket.shots},save:function(){return store.setItem("localBucket",JSON.stringify(M.localBucket.shots))},add:function(shotToSave){var alreadySaved,shot,_i,_len,_ref;alreadySaved=
false;_ref=M.localBucket.shots;for(_i=0,_len=_ref.length;_i<_len;_i++){shot=_ref[_i];if(shot.id===shotToSave.id){alreadySaved=true;break}}if(!alreadySaved){M.localBucket.shots.push(shotToSave);M.localBucket.save()}return!alreadySaved}},Comments:{loaded:{}},Config:{load:function(){var config;config=store.getItem("Poppp:Config");if(config){config=JSON.parse(config);M.Channel.self=config.Channel;M.Player.self=config.Player;return M.Column.current=config.Column}else{M.Channel.self="popular";M.Player.self=
"";return M.Column.current=0}},save:function(){var config;config={Channel:M.Channel.self,Player:M.Player.self,Column:M.Column.current};return store.setItem("Poppp:Config",JSON.stringify(config))}},Channel:{self:"",get:function(){return M.Channel.self},set:function(channel){M.Channel.self=channel;return M.Config.save()}},Player:{self:"",get:function(){return M.Player.self},set:function(player){M.Player.self=player;return M.Config.save()}},Column:{current:0,get:function(){return M.Column.current},set:function(column){M.Column.current=
column;return M.Config.save()}}};T={getMainViewTemplate:function(columnNumber){if(columnNumber==="one")return"{{#shots}}<article class='one-column'><div class='shot-player'><div style='background-image: url({{player.avatar_url}})'></div></div><div class='shot-image'><img class='shot' data-shot-id='{{id}}' src='{{image_teaser_url}}' onLoad='this.classList.add(\"done\")'/></div><div class='shot-data'><p class='shot-data-likes'>{{likes_count}}</p><p class='shot-data-comments'>{{comments_count}}</p></div></article>{{/shots}}";
else{columnNumber+="-column";return"{{#shots}}<article class='"+columnNumber+"'><img class='shot' data-shot-id='{{id}}' src='{{image_teaser_url}}' onLoad='this.classList.add(\"done\")'/></article>{{/shots}}"}},detailView:"<div id='detail-image'><img src='{{image_url}}'/></div><div id='shot-info'><p>{{title}}</p><p>by {{player.name}}</p><p>{{likes_count}}</p><div class='btn-save' data-shot-id='{{id}}'></div></div><div id='force-overflow'></div>",btnLoadMore:"<div class='load-more'>Load more</div>",
comments:"<div id='shot-comments'>{{#comments}}<article class='shot-comment'><div class='player-avatar' style='background-image: url({{player.avatar_url}})'></div><div class='comment-data'><p class='comment-player-name'>{{player.name}}</p><p class='comment-body'>{{{body}}}</p></div></article>{{/comments}}</div>"};Poppp={loadShots:function(channel){if(!channel)channel=M.Channel.get();switch(channel){case "following":case "popular":case "debuts":case "everyone":V.MainWrap.append("<p class='main-message'>Loading shots...</p>");
return $.ajax({dataType:"jsonp",url:Poppp.getURL(channel),success:function(data){Poppp.showShots(data);return lastData=data},error:function(){$(".main-message").text(Msgs.loadingError);return V.MainWrap.append("<div class='load-more'>Try reloading</div>")}});case "local bucket":if(M.localBucket.shots.length===0)M.localBucket.load();Poppp.showShots(M.localBucket);return lastData.shots=M.localBucket.shots}},showShots:function(data){var html,loadedShots,main,shot,_i,_len;if(!data)data=lastData;$(".main-message").remove();
html=Mustache.to_html(T.getMainViewTemplate(columns[M.Column.get()]),data);main=V.MainWrap;main.append(html);setTimeout(function(){return main.css("opacity",1)},100);loadedShots=data.shots;for(_i=0,_len=loadedShots.length;_i<_len;_i++){shot=loadedShots[_i];if(shots[shot.id])continue;shots[shot.id]=shot}return currentPage++},refresh:function(){currentPage=1;V.MainWrap.empty();if(showingMenu)V.Action.toggleMenu(showingMenu);return Poppp.loadShots()},changeLayout:function(){var currentColumn;currentColumn=
M.Column.get();currentColumn++;if(currentColumn===columns.length)currentColumn=0;M.Column.set(currentColumn);V.MainWrap.empty();V.Action.switch3ColumnWrapper();return Poppp.showShots(lastData)},getURL:function(channel){if(!channel)channel=M.Channel.get();if(channel==="following")return"//api.dribbble.com/players/"+M.Player.get()+"/shots/following"+"?per_page="+shotsPerPage+"&callback=?";else return"//api.dribbble.com/shots/"+channel+"?page="+currentPage+"&per_page="+shotsPerPage+"&callback=?"},getShotById:function(shotID){var foundShot,
shot,_i,_len,_ref;_ref=lastData.shots;for(_i=0,_len=_ref.length;_i<_len;_i++){shot=_ref[_i];if(shot.id===shotID){foundShot=shot;break}}return foundShot},loadComments:function(shotID){if(M.Comments.loaded[shotID])return V.DetailWrap.append(M.Comments.loaded[shotID]);else return $.ajax({dataType:"jsonp",url:"//api.dribbble.com/shots/"+shotID+"/comments",success:function(data){var commentsHTML;commentsHTML=Mustache.to_html(T.comments,data);M.Comments.loaded[shotID]=commentsHTML;return V.DetailWrap.append(commentsHTML)}})}};
tappable(".shot",{onTap:function(e,target){var detail,html,id;if(showingMenu)V.Action.toggleMenu(showingMenu);id=$(target).data("shot-id");detail=V.DetailWrap;html=Mustache.to_html(T.detailView,shots[id]);detail.html(html);currentShotURL=shots[id].url;V.Action.setHeaderShotTitle(id);V.Action.goToDetailView();return Poppp.loadComments(id)}});tappable("#settings",{onTap:function(){var newPlayer;newPlayer=win.prompt(Msgs.enterUsername,M.Player.get());if(newPlayer){M.Player.set(newPlayer);if(M.Channel.get()===
"following"){Poppp.refresh();return V.Action.changeStreamSelection()}}},activeClass:"btn-active"});tappable("#nav-back",{onTap:function(){currentShotURL="";return V.Action.goToMainView()},activeClass:"btn-active"});tappable("#refresh",{onTap:function(){return Poppp.refresh()},activeClass:"btn-active"});tappable("#show-menu",{onTap:function(){if(activeView===1)return V.Action.toggleMenu(showingMenu)},activeClass:"btn-active"});tappable("#menu p",{onTap:function(e,target){var choice,choiceText,newPlayer;
choice=$(target);choiceText=choice.text().toLowerCase();V.Action.toggleMenu(showingMenu);if(choiceText==="layout")return Poppp.changeLayout();else{if(choiceText===M.Channel.get())return;if(choiceText==="following"&&!M.Player.get()){newPlayer=win.prompt(Msgs.enterUsername);if(newPlayer)M.Player.set(newPlayer);else return}currentPage=1;setTimeout(function(){V.MainWrap.empty();return Poppp.loadShots(choiceText)},transSpeed.view);V.Action.changeStreamSelection(choiceText);return M.Channel.set(choiceText)}},
activeClass:"options-active"});tappable("#open-shot",{onTap:function(){var open;open=win.confirm("View this shot in Dribbble.com?");if(open)return openURL(currentShotURL)},activeClass:"btn-active"});tappable(".btn-save",{onTap:function(e,target){var saved,shotID,shotToSave;shotID=$(target).data("shot-id");shotToSave=Poppp.getShotById(parseInt(shotID,10));saved=M.localBucket.add(shotToSave);if(saved)return win.alert(Msgs.shotSaved)},activeClass:"btn-save-active"});supportOrientation=typeof window.orientation!==
"undefined";getScrollTop=function(){return window.pageYOffset||doc.compatMode==="CSS1Compat"&&doc.documentElement.scrollTop||body.scrollTop||0};scrollTop=function(){if(!supportOrientation)return;body.style.height=screen.height+"px";return setTimeout(function(){var top;win.scrollTo(0,1);top=getScrollTop();win.scrollTo(0,top===1?0:1);return body.style.height=win.innerHeight+"px"},1)};openURL=function(URL){var a,dispatch;if(!URL)return;a=doc.createElement("a");a.setAttribute("href",URL);a.setAttribute("target",
"_blank");dispatch=doc.createEvent("HTMLEvents");dispatch.initEvent("click",true,true);return a.dispatchEvent(dispatch)};M.Config.load();V.Action.switch3ColumnWrapper();Poppp.loadShots();scrollTop();V.Action.changeStreamSelection();if(win.navigator.standalone)V.Header.on("touchmove",function(e){return e.preventDefault()},false);win.applicationCache.addEventListener("updateready",function(e){var update;update=window.confirm("Update ready. Refresh to update?");if(update)return window.location.reload()});
isDesktop=!/iPhone|iPod|iPad|Android/.test(navigator.userAgent);if(isDesktop){deskLink=doc.createElement("link");deskLink.rel="stylesheet";deskLink.href="css/desk.css";doc.head.appendChild(deskLink)}}).call(this);