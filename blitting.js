/**
 * Created by Sergey on 26.09.16.
 */
(function blittingCreative(global, event) {
    // global.onResize = onResize();
    var context = global.blittingContext;
    
    if(!context){
        setTimeout(blittingCreative, 150);
        return;
    }

    var sound = {
        player : null,
        ready : false,
        button : null,
        on : function () {
            console.log("sound on");
            sound.button.style.visibility = "hidden";
            preloader.show();
            sound.seek(viewport.second);
            viewport.pause();
            firstClick = true;
        },
        init : function (url) {
            sound.player = document.createElement("audio");
            sound.player.src = url;
            sound.player.load();
            sound.player.addEventListener("loadstart", sound.onAudioEvent);
            sound.player.addEventListener("progress", sound.onAudioEvent);
            sound.player.addEventListener("suspend", sound.onAudioEvent);
            sound.player.addEventListener("abort", sound.onAudioEvent);
            sound.player.addEventListener("error", sound.onAudioEvent);
            sound.player.addEventListener("emptied", sound.onAudioEvent);
            sound.player.addEventListener("stalled", sound.onAudioEvent);
            sound.player.addEventListener("loadedmetadata", sound.onAudioEvent);
            sound.player.addEventListener("loadeddata", sound.onAudioEvent);
            sound.player.addEventListener("canplay", sound.onAudioEvent);
            sound.player.addEventListener("canplaythrough", sound.onAudioEvent);
            sound.player.addEventListener("playing", sound.onAudioEvent);
            sound.player.addEventListener("waiting", sound.onAudioEvent);
            sound.player.addEventListener("seeking", sound.onAudioEvent);
            sound.player.addEventListener("seeked", sound.onAudioEvent);
            sound.player.addEventListener("ended", sound.onAudioEvent);
            sound.player.addEventListener("durationchange", sound.onAudioEvent);
            sound.player.addEventListener("timeupdate", sound.onAudioEvent);
            sound.player.addEventListener("play", sound.onAudioEvent);
            sound.player.addEventListener("pause", sound.onAudioEvent);
            sound.player.addEventListener("ratechange", sound.onAudioEvent);
            sound.player.addEventListener("resize", sound.onAudioEvent);
            sound.player.addEventListener("volumechange", sound.onAudioEvent);

            sound.button = document.createElement("img");
            sound.button.src = "http://85.10.248.71/blitting/speaker.png";
            sound.button.addEventListener("touchend", sound.on);
            sound.button.style.position = "absolute";
            sound.button.style.top = "0px";
            sound.button.style.left = "0px";
            sound.button.style.visibility = "hidden";
            document.body.appendChild(sound.button);

//        preloader.image = document.body.appendChild(image);
//        sound.button.onclick = sound.on();
//        sound.button.style.position = "absolute";
//        sound.button.style.top = "1px";
//        sound.button.style.left = "1px";

//        document.appendChild(sound.button());
        },
        onAudioEvent : function (e) {

//        if (e.type == "loadedmetadata"){
//            console.log("on meta duration:", sound.player.duration);
//        }

            if(e.type == "loadedmetadata"){
                sound.ready = true;
            }

            if(e.type == "canplaythrough" && viewport && viewport.paused){
                sound.ready = true;
                viewport.play();
            }

            if(e.type == "timeupdate"){
                preloader.hide();
                if(viewport.paused){
                    viewport.play();
                }
                viewport.frame = Math.floor(sound.player.currentTime*context.fps);
            }
        },
        seek : function (time) {
            sound.player.currentTime = time;
            sound.player.play();
        },
        pause : function () {
            sound.player.pause();
        },
    };

    var preloader = {
        init : function (url) {
            var image = document.createElement("img");
            image.src = url;
            image.style.visibility = "hidden";
            preloader.image = document.body.appendChild(image);
        },
        image : null,
        resize : function () {
            preloader.image.style.position = "absolute";
            preloader.image.style.top = (window.innerHeight - preloader.image.height >> 1) + "px";
            preloader.image.style.left = (window.innerWidth - preloader.image.width >> 1) + "px";
        },
        show : function () {
            preloader.resize();
            preloader.image.style.visibility = "visible";
        },
        hide : function () {
            preloader.image.style.visibility = "hidden";
        }
    };

    var tracking = {
        impression : function () {
            tracking.track(context.impressions);
            // for(var i = 0; i < context.impressions.length; i++){
            //     console.log("track impression:", context.impressions[i]);
            //     tracking.track(context.impressions[i]);
            // }
        },
        start : false,
        first : false,
        middle : false,
        third : false,
        complete : false,

        reset : function () {
            tracking.start = tracking.first = tracking.middle = tracking.third = tracking.complete = false;
        },

        progress : function (time) {
            if(context.progress){

                if(!tracking.start){
                    tracking.start = !tracking.start;
                    tracking.track(context.progress.start);
                }

                var quarty = context.duration >> 2;

                if (!tracking.first && time > quarty) {
                    tracking.first = !tracking.first;
                    tracking.track(context.progress.firstQuart)
                }

                if (!tracking.middle && time > (quarty << 1)) {
                    tracking.middle = !tracking.middle;
                    tracking.track(context.progress.middle);
                }
                if (!tracking.third && time > quarty + (quarty << 1)) {
                    tracking.third = !tracking.third;
                    tracking.track(context.progress.thirdQuart);
                }
                if(!tracking.complete && time >= (context.duration - 1)){
                    tracking.complete = !tracking.complete;
                    tracking.track(context.progress.complete);
                }
            }
        },

        track : function (value) {
            if(Array.isArray(value)){
                console.log("is array:" + value);
                for(var i = 0; i < value.length; i++){
                    tracking.track(value[i]);
                }
            }else{
                (new Image()).src = value;
            }
        },

    };

    tracking.impression();

    var loader = {
        ready : false,
        images : [],
        length : function () {
            return loader.images.length;
        },
        path : "",
        count : 0,
        maxCount : 100500,
        init : function (ctx) {
            loader.path = ctx.path;
            loader.maxCount = ctx.imagesLength;
            loader.load(this.path + "image_" + this.count + ".png");
        },
        load : function (url) {
            var image = new Image();
            this.images.push(image);
            image.onload = function () {

                if(loader.length() > (loader.maxCount >> 2)){
                    loader.ready = true;
                }
                if(image.isValid() && loader.count < loader.maxCount){
                    loader.count++;
                    loader.load(loader.path + "image_" + loader.count + ".png");
                }
            };
            image.src = url;
            image.onerror = this.onError;
        },
        onError : function (e) {
            console.error("loading error:", e.toString());
        }
    };

    Image.prototype.isValid = function () {
        return (typeof this.naturalWidth !== "undefined" && this.naturalWidth !== 0);
    };

    var viewport = {
        canvas : null,
        scale : 1,
        frame : 0,
        second : 0,
        width : 0,
        height : 0,
        paused : false,
        init : function (ctx) {
            viewport.canvas = document.getElementById("banner_canvas").getContext("2d");
//            document.getElementById("banner_canvas").addEventListener("mouseup", onCanvas);
            document.getElementById("banner_canvas").addEventListener("touchend", onCanvas);
        },
        play : function () {
            viewport.paused = false;
            viewport.drawInterval = setInterval(viewport.draw, 1000/context.fps);
        },
        drawInterval : 0,
        draw : function () {
            viewport.resize();

            var spriteCount = Math.floor(viewport.frame / context.chunks);

            if(spriteCount >= context.imagesLength){
                viewport.oncomplete();
                return;
            }

            var sprite = loader.images[spriteCount];

            if(sprite && sprite instanceof Image && sprite.isValid()){

                viewport.canvas.clearRect(0, 0, viewport.canvas.width, viewport.canvas.height);

                viewport.second = loader.images.indexOf(sprite)*context.chunks/context.fps;
                tracking.progress(viewport.second);
                // TODO здесь должен быть трекинг прогресса

                var posX = viewport.width - context.imageWidth*viewport.scale >> 1;
                var posY = viewport.height - context.imageHeight*viewport.scale >> 1;

                sound.button.style.top = posY + 20 + "px";
                sound.button.style.left = posX + 20 + "px";

                viewport.canvas.drawImage(
                    sprite,
                    context.imageWidth * (viewport.frame%context.columns),
                    context.imageHeight * Math.floor((viewport.frame%context.chunks)/context.columns),
                    context.imageWidth,
                    context.imageHeight,
                    posX,
                    posY,
                    context.imageWidth*viewport.scale,
                    context.imageHeight*viewport.scale
                );

                viewport.frame++;
            }else{
//                        TODO показывать индикатор загрузки
            }

        },
        pause : function () {
            clearInterval(viewport.drawInterval);
            viewport.paused = true;
        },
        currentTime : function () {
            return viewport.second;
        },
        reset : function () {
            clearInterval(viewport.drawInterval);
            viewport.frame = viewport.second = viewport.width = viewport.height = 0;
            viewport.paused = false;
        },
        resize : function () {
            document.getElementById("banner_canvas").width = viewport.width = window.innerWidth;
            document.getElementById("banner_canvas").height = viewport.height = window.innerHeight;
            viewport.scale = Math.min(viewport.width/context.imageWidth, viewport.height/context.imageHeight);
            sound.button.style.width = "5%";
            preloader.image.style.width = "5%";
        },
        oncomplete : function () {
            viewport.reset();
            firstClick = false;
            sound.pause();
            // TODO для продолжения открутки включить
            // viewport.play();
            tracking.reset();
            // tracking.impression();
        }
    };

    sound.init(context.path + "/" + "sound.aac");
    preloader.init("http://85.10.248.71/blitting/preloader.gif");
    preloader.show();
    loader.init(context);
    viewport.init(context);

    var waitingInterval = setInterval(function () {
        if(sound.ready && loader.ready){
            preloader.hide();
            clearInterval(waitingInterval);
            sound.button.style.visibility = "visible";
            viewport.play();
        }
    }, 100);

    var quarty;
    var firstQuart = false,middle = false,thirdQuart = false;

    var firstClick = false, scale;

    window.onresize = function (event){
        if(viewport){
            viewport.resize();
        }
    }

    function onCanvas(e) {
//        if(!firstClick){
//            preloader.show();
//            sound.seek(viewport.second);
//            viewport.pause();
//            firstClick = true;
//        } else {
        preloader.hide();
        sound.pause();
        window.open(context.target);
        viewport.oncomplete();
//        }
    }
})(window);
