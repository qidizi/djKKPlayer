+function () {
	var source = 'vvvdj.com';
    if (!location.hostname || location.hostname.toLowerCase().indexOf(source) < 0) {
        var delay = 5;
        quit('页面完成后，请<strong style="color: red;" >再次点击标签</strong>，注入播放器<br>' +
            delay + '秒后自动打开<a href="' + source + '">' + source + '</a>');
        setTimeout(function () {
            location.href = "http://www."+source + '/?r=' + +new Date;
        }, delay * 1000);
        return;
    }
    makePlayer();
}();

function makePlayer(){
    var html ='\
<!DOCTYPE html> \
<html> \
<head> \
<title>DJ Player</title> \
<meta charset="UTF-8"> \
<meta id="scale" content="width=device-width,initial-scale=1.0,maximum-scale=1.0, user-scalable=0" name="viewport"> \
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js" type="text/javascript"></script> \
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/3.3.7/css/bootstrap.min.css" /> \
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/3.3.7/css/bootstrap-theme.min.css" /> \
<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/3.3.7/js/bootstrap.min.js"></script> \
<style> \
.container{max-width:768px;} \
audio{display: block;width:100%;} \
.listBody{padding-top:70px;padding-bottom:300px;} \
</style> \
</head> \
<body> \
<nav class="navbar navbar-default navbar-fixed-top"> \
 <div class="container"> \
  <ul class="nav nav-tabs  " role="tablist"> \
    <li role="presentation" class="active"> \
     <a href="#playListBox" aria-controls="playListBox" role="tab" data-toggle="tab"> \
     <button class="btn btn-link btn-sm"> \
     <b class="glyphicon glyphicon-list-alt"></b> \
     </button> \
        </a> \
 </li> \
 <li role="presentation"> \
   <a href="#resultBox" aria-controls="resultBox" data-toggle="tab"> \
    <form onsubmit="return false;" class="form-inline" style="width: 180px;"> \
    <span class="input-group input-group-sm"> \
    <span class="input-group-addon" role="tab"> \
    <span class="glyphicon glyphicon-music"></span> \
    </span> \
    <input class="form-control" placeholder="客官要点啥？" id="keyWord"> \
   <span class="input-group-btn"> \
    <button class="btn btn-default" type="submit" id="search"> \
    <span class="glyphicon glyphicon-search"></span> \
    </button> \
   </span> \
   </span> \
 </form> \
 </a> \
</li> \
 </ul> \
 </div> \
</nav> \
<div class="tab-content listBody"> \
 <div role="tabpanel" class="tab-pane active" id="playListBox"> \
 <ul class="list-group" id="playList"></ul> \
 </div> \
<div role="tabpanel" class="tab-pane" id="resultBox"> \
 <ul class="list-group" id="result"></ul> \
</div> \
</div> \
<nav class="navbar navbar-default navbar-fixed-bottom"> \
 <div class="container"> \
 <div class="row"> \
 <div class="col-xs-12"> \
 <div class="btn-group btn-group-justified" role="group"> \
 <div class="btn-group" role="group"> \
 <button class="btn btn-default navbar-btn navbar-left jsVolumeChange isDown" type="button"> \
<span class="glyphicon glyphicon-volume-down" aria-hidden="true"></span> \
</button> \
</div> \
<div class="btn-group" role="group"> \
<button class="btn btn-default  navbar-btn navbar-left  jsVolumeChange isUp" type="button"> \
<span class="glyphicon glyphicon-volume-up" aria-hidden="true"></span> \
</button> \
 </div> \
<div class="btn-group" role="group"> \
<button class="btn btn-danger  navbar-btn navbar-left" type="button" id="deletePlay"> \
<span class="glyphicon glyphicon-trash"></span> \
</button> \
 </div> \
<div class="btn-group" role="group"> \
<button class="btn btn-default   navbar-btn navbar-left" type="button" id="playNext"> \
<span class="glyphicon glyphicon-step-forward"></span> \
 </button> \
</div> \
</div> \
</div> \
</div> \
<small id="song" class="text-center center-block">播放已停止</small> \
<audio controls="controls" autoplay="autoplay" id="audio"></audio> \
</div> \
</nav> \
';
}

function javascript() {
	// 可能子域是www或是m
	var source = location.href.replace(/^([^:]+:\/+[^\/]+).*/,"$1");
	try {
        localStorage.setItem("TEST", 1);
    } catch (e) {
        quit("浏览器版本过低，或您使用了隐私模式：无法使用自动保存播放列表功能");
        return;
    }

    window.audio = document.getElementById('audio');
	var plaform = {
    // ios volume readonly
    isIos: 'iPhone/iPad'.indexOf(navigator.platform) > -1,
    isMac: 'MacIntel' === navigator.platform,
    isAndroid: navigator.userAgent.indexOf('Android')
};
    if (!window.jQuery) {
        setTimeout(init, 500);
        return;
    }

    if (plaform.isIos) {
        // ios volume readonly
        $('.jsVolumeChange').addClass('disabled');
        mAlert("因ios家族血脉奇特，客官您可能会遇到浏览器切换到后台后无法自动播放下曲；"
            + "某些版本第一次点击歌曲的播放后只是加载歌曲却不会自动开始播放，需要点击播放器上的才会播放的问题。");
        $('body').once('touchstart', function () {
            audio.play();
        });
    }

    // ios background 浏览器时，无法自动开始播放下首，但是chrome 锁屏时却可以；
    audio.onended = playNext;

    try {
        var list = new Function('', 'return ' + localStorage.getItem('qidiziDjPlayer'))();

        if ('object' === typeof list) {
            var html = '';
            for (var i = 0; i < list.length; i++) {
                var li = list[i];
                html += listLi(li.s, li.t, li.p ? 'list-group-item-success' : "");
            }
            $('#playList').html(html);
        }
    } catch (e) {

    }


    $(document)
        .delegate('.jsVolumeChange', 'click', function () {
            var isUp = $(this).hasClass('isUp');
            try {
                var vol = audio.volume + (isUp ? +1 : -1) * 0.05;

                if (vol > 1) vol = 1;
                else if (vol < 0) vol = 0;

                audio.volume = vol;
            } catch (e) {

            }
            $(this).stop().html(String(audio.volume).replace(/(\.\d{2})\d+$/, '$1')).show().delay(1000).show(function () {
                $(this).html('<span class="glyphicon glyphicon-volume-' + (isUp ? 'up' : 'down') + '" aria-hidden="true"></span>');
            });
        })
        .delegate('.jsPlayResultItem', 'click', function () {
            $(this).addClass("active");
            var li = $(this).parents('li');
            var href = li.attr('data-href');
            getMusic(href, li);
        })
        .delegate('.jsRemoveMe', 'click', function () {
            var li = $(this).parents('li');
            var src = li.attr('data-href');
            if (audio.src === src) playNext();
            li.remove();
            saveList();
        })
        .delegate('#deletePlay', 'click', function () {
            var li = $('#playList li[data-href="' + audio.src + '"]');

            if (li.length) {
                playNext();
            } else {
                audio.pause();
            }

            li.remove();
            saveList();
        })
        .delegate('.jsPlayMe', 'click', function () {
            var li = $(this).parents('li');
            var src = li.attr('data-href');
            playMe(src, li.text(), li);
        })
        .delegate('#playNext', 'click', function () {
            playNext();
        })
        .delegate('#search', 'click', function () {
            $('#result').html('');
            var word = $.trim($('#keyWord').val());

            if (!word) {
                $('#result').html('<li class="list-group-item text-danger">' +
                    '客官，请问您要点？' +
                    '</li>');
                return;
            }
            
            qidizi.word = word;
            getSearch(1);
        })
        .delegate('.jsNextPage', 'click', function () {
            getSearch(this.value);
        })
    ;

}

function listLi(src, title, cls) {
    return '<li class="list-group-item ' + (cls || '') + '"  data-href="' + src + '">' +
        ' <button class="btn btn-danger jsRemoveMe"  type="button" >' +
        '<i class="glyphicon glyphicon-trash" aria-hidden="true"></i> ' +
        '</button> ' +
        '<a class="jsPlayMe" href="javascript:void(0);">' +
        '<span class="glyphicon glyphicon-play" aria-hidden="true"></span> ' +
        title +
        '</a> ' +
        '</li>';
}

function saveList() {
    var json = [];
    $('#playList li').each(function () {
        var obj = {
            t: $(this).text(),
            s: $(this).data('href')
        };

        if ($(this).hasClass('isPlaying')) {
            obj.p = 1;
        }

        json.push(obj);
    });
    json = JSON.stringify(json);
    try {
        // 隐身模式会出错
        localStorage.setItem('qidiziDjPlayer', json);
    } catch (e) {
    }
}

function getMusic(href, dom) {
    $.ajax({
        url: href,
        type: 'POST',
        cache: false,
        dataType: 'text',
        success: function (body) {
            var code = body;
            try {
                // 对方不清楚基于什么实现，主要是ajax请求就会返回json
                code = new Function('', 'return ' + code)();
            } catch (e) {
                code = body;
            }

            code = code.replace(/^[\S\s]+var\s+PLAYINGID\s*=/gi, 'var PLAYINGID = ')
                .replace(/<\/script>[\s\S]+$/gi, '')
                .replace(/^\s*LoveHover/m, '//')
            //.replace(/mp.create[\s\S]+$/gi, '')
            ;
            code = $.trim(code);

            if ('' === code) {
                mAlert('找不到播放地址，请联系作者修复');
                return;
            }

            // 模仿对方逻辑获取url
            var src;
            code = 'var fwqrp = "dj";\n' +
                'var fwqhp = "th";\n' +
                'var fwq3g = "tm";\n' +
                'var x4 = "";' +
                'var playurl = "";' +
                'var mp={create:function(a,apsvr,file){' +
                'playurl = "http://" + apsvr + ".vvvdj.com/mp4/" + file + ".mp4";' +
                '}};' +
                '' +
                'try{' +
                code + ';' +
                '}catch(e){};' +
                'return playurl;';
            try {
                src = new Function('', code)();
            } catch (e) {
            }

            if (!src) {
                mAlert('获取播放地址异常，请联系作者修复');
                return;
            }

            var is = $(dom).attr('data-is');
            var title = $.trim(dom.text());
            var li = $('li[data-href="' + src + '"]');

            if ('test' !== is && !li.length) {
                li = $(listLi(src, title));
                li.appendTo('#playList');
                saveList();
            }

            'append' !== is && playMe(src, title, li);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            mAlert('获取播放地址异常，请联系作者修复[' + textStatus + ']');
        }
    });
}

function getSearch(page) {
    $('#result').html('<li class="list-group-item text-info">' +
        '<span class="glyphicon glyphicon-hourglass" aria-hidden="true"></span> 处理中...' +
        '</li>');
    $('#keyWord').attr('readonly', 'readonly');
    var url = source + "/search/so?key=" + encodeURIComponent(word) + "&page=" + (page||1);
    $.ajax({
        url: url,
        type: 'POST',
        cache: false,
        success: function (body) {
            var code = body;
            try {
                // 对方不清楚基于什么实现，主要是ajax请求就会返回json
                code = new Function('', 'return ' + code)();
            } catch (e) {
                code = body;
            }

            var links = '';
            var nameHash = {};
            code = code.replace(/^[\s\S]+?<table[^>]+list_musiclist|左侧结束[\s\S]+?$|<a[^>]+href\s*=\s*['"]*javascript:[\s\S]+?<\/a[^>]*>/ig, '');
            var pages = '';
            code.replace(/<a\s[^>]*?href\s*=\s*['"]([^"']+)['"][^>]*>([\s\S]+?)<\/a[>\s]/ig, function (m0, href, text) {
                // only text,remove html tag
                text = $.trim(text.replace(/<[^>]+>/, ''));

                if (/\/play\/\d+\.html/i.test(href)) {
                    // get the song url
                    // 只需要有标题的
                    if (!text || nameHash[text]) return '';
                    nameHash[text] = 1;
                    href = source + href.replace(/^\.+\//, '');
                    links += '<li class="list-group-item"  data-href="' + href + '">' +
                        ' <button type="button" class="btn btn-default jsPlayResultItem" data-is="test">' +
                        '<span class="glyphicon glyphicon-headphones" aria-hidden="true"></span> ' +
                        '</button> ' +

                        ' <button type="button" class="btn btn-default jsPlayResultItem" data-is="append">' +
                        '<span class="glyphicon glyphicon-list-alt" aria-hidden="true"></span> ' +
                        '</button> ' +
                        '<button type="button" class="btn btn-default jsPlayResultItem" data-is="play">' +
                        '<span class="glyphicon glyphicon-play" aria-hidden="true"></span> ' +
                        '</button> &nbsp;' +
                        text +
                        '</li>';
                } else if (/so\?key=[^&]+/i.test(href) && /^\d+$/.test(text)) {
                    pages += '<button class="btn btn-default jsNextPage" value="' + text + '">' +
                        text +
                        '</button>'
                    ;
                }
                return '';
            });

            if (!links) {
                links += '<li class="list-group-item text-danger">' +
                    '<span class="glyphicon glyphicon-alert" aria-hidden="true"></span> 客官久等了，很抱歉，您要的...已向警方报失。要不试试...' +
                    '</li>';
            } else {
                pages = '<button class="btn btn-default jsNextPage" value="1">' +
                '<span class="glyphicon glyphicon-step-backward"></span>' +
                 '</button>' +
                 pages +
                 '<button class="btn btn-default jsNextPage" value="1">' +
                '<span class="glyphicon glyphicon-option-horizontal"></span>';
                links += '<li class="list-group-item text-center  list-group-item-success">' +
                    pages +
                    '</li>';
            }

            $('#result').html(links);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            $('#result').html('<li class="list-group-item text-success">' +
                'ooops!好像出了点意外哦！什么都没有...[' + textStatus + ']' +
                '</li>');
        },
        complete: function () {
            $('#keyWord').removeAttr('readonly');
        },
        dataType: 'text'
    });
}

function playNext() {
    // empty list
    if (!$('#playList li').length) return;

    var li = $('#playList li.isPlaying');

    if (li.length) {
        // has playing
        li = li.next();
    }

    if (!li.length) {
        // stop ? first item
        li = $('#playList li:first');
    }

    var src = li.attr('data-href');
    playMe(src, li.text(), li);
}

function playMe(src, title, li) {
    if (!src) return;
    var playCls = 'list-group-item-success isPlaying';
    $('#playList li').removeClass(playCls);
    $(li).addClass(playCls);
    $('#song').text(document.title = title);
    var audio = $('audio').get(0);
    audio.src = src;
    audio.play();
    saveList();
}


function mAlert(msg, title) {
    $('#modal .modal-body').html(msg);
    $('#modal .modal-title').text(title || 'notice');
    $('#modal').modal();
}

function createDom(tag, attr, parentTag) {
    var dom = document.createElement(tag);
    if (attr)
        for (var name in attr) dom.setAttribute(name, attr[name]);
    (parentTag ? document.getElementsByTagName(parentTag)[0] : document.documentElement).appendChild(dom);
    return dom;
}

function quit(tip) {
    document.open();
    document.write(
        '<!DOCTYPE html><html><head>' +
        '<meta charset="utf-8">' +
        '<title>提示</title></head><body>' +
        tip + '</body></html>'
    );
    document.close();
}
