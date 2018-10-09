+function () {
    try {
        localStorage.setItem("null", 1);
    } catch (e) {
        quit("不支持自动保存播放列表功能！若您使用了隐私模式，请切换为普通模式再试用！若是您浏览器不支持，建议升级最新的chrome浏览器");
        return;
    }

    if (window.useProxy) {
        makePlayer();
        return;
    }

    // 注入模式
    var source = 'vvvdj.com';
    if (!location.hostname || location.hostname.toLowerCase().indexOf(source) < 0) {
        alert('提示：进入DJ网后，还需再次点击书签');
        location.href = 'http://' + source;
        return;
    }

    makePlayer();
}();

function quit(tip) {
    if (document.body) {
        document.body.innerHTML = tip;
        return;
    }

    document.open();
    document.write(
        '<!DOCTYPE html><html><head>' +
        '<meta charset="UTF-8">' +
        '<title>提示</title></head><body>' +
        tip + '</body></html>'
    );
    document.close();
}

function makePlayer() {
    if ('complete' !== document.readyState) {
        if ('number' !== typeof window.charIndex) window.charIndex = 1;
        else
            window.charIndex++;

        if (window.charIndex >= 100) window.charIndex = 1;

        document.documentElement.innerHTML = '*'.repeat(window.charIndex);
        setTimeout(makePlayer, 500);
        return;
    }

    var html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <title>DJ音乐播放器 -- by qidizi</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.1/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.1/js/bootstrap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Base64/1.0.1/base64.min.js"></script>
    <script src="./base64.js"></script>
    <style>
        html, body {
            min-width: 100%;
            min-height: 100%;
            display: block;
        }

        .listBody {
            margin: 0 auto;
            padding: 70px 0 200px 0;
            max-width: 700px;
            min-height: 100%;
        }
        #progress{height:5px;padding-top:2px;}
    </style>
</head>
<body>
<nav class="navbar fixed-top navbar-light bg-light text-center">
    <form onsubmit="return false;" class="needs-validation form-inline mx-auto" novalidate="novalidate" id="searchForm">
        <div class="input-group"><input class="form-control text-center" placeholder="找啥？" id="keyWord"
                                        required="required">
            <div class="input-group-append">
                <button class="btn btn-outline-secondary" type="submit" id="search">找歌</button>
                <button class="btn btn-outline-success active" type="button" id="togglePlayList">我的</button>
            </div>
        </div>
    </form>
    <div class="progress d-none w-100" id="progress">
        <div class="progress-bar progress-bar-striped progress-bar-animated bg-info" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>
    </div>
</nav>
<ul class="list-group listBody d-none jsListBody" id="result"></ul>
<ul class="list-group listBody jsListBody" id="playList"></ul>
<nav class="navbar fixed-bottom navbar-light bg-light px-0">
    <div class="text-center w-100">
        <a class="btn btn-outline-secondary jsVolumeChange isDown text-secondary">减小</a>
        <a class="btn btn-outline-dark text-dark jsVolumeChange isUp">加大</a>
        <a class="btn btn-outline-danger text-danger" id="deletePlay">删了</a>
        <a class="btn btn-outline-success text-success" id="playNext">下首</a>
    </div>
    <div id="song" class="text-center navbar-text w-100 text-truncate" role="alert">播放已停止</div>
    <audio controls="controls" autoplay="autoplay" id="audio" class="d-block w-100"></audio>
</nav>
<!--js-->
</body>
</html>
    `;
    // 发现放到html后面，不会解析js
    html = html.replace('<!--js-->', '<script type="text/javascript" charset="UTF-8">+' + javascript + '();</script>');
    document.open();
    document.write(html);
    document.close();
}

function javascript() {
    try {
        var qidizi = {
            useProxy: location.host.indexOf('github') > -1,
            isIos: 'iPhone/iPad'.indexOf(navigator.platform) > -1,
            isMac: 'MacIntel' === navigator.platform,
            isAndroid: navigator.userAgent.indexOf('Android'),
            source: 'https://m.vvvdj.com',
            // 代理php实现：https://github.com/qidizi/code-snippets/blob/master/php/proxy-auth-by-white-list.php
            proxy: location.host.indexOf('github') > 0 || 1 ? 'https://proxy.d.iguoyi.cn/' : 'http://php.local.qidizi.com/proxy.php'
        };
        /* 可能子域是www或是m*/
        if (!qidizi.useProxy) qidizi.source = location.href.replace(/^([^:]+:\/+[^\/]+).*/, "$1");

        if (qidizi.isIos) {
            // ios系统的音量是只读的
            $('.jsVolumeChange').hide();
        }

        /*
        ios限制，需要用户操作触发首次播放，下次才能自动播放,firefox 有选项启用限制功能
        统一触发
        */
        $('body').one('click', function () {
            getAudio().play();
        });
        /* ios background 浏览器时，无法自动开始播放下首，但是chrome 锁屏时却可以；*/
        getAudio().onended = playNext;
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
                    var vol = getAudio().volume + (isUp ? +1 : -1) * 0.05;

                    if (vol > 1) vol = 1;
                    else if (vol < 0) vol = 0;

                    getAudio().volume = vol;
                } catch (e) {

                }
                $(this).stop().html(String(getAudio().volume).replace(/(\.\d{2})\d+$/, '$1')).show().delay(1000).show(function () {
                    $(this).html(isUp ? '加大' : '减小');
                });
            })
            .delegate('.jsPlayResultItem', 'click', function () {
                $(this).addClass("active");
                var li = $(this).parents('li');
                var href = li.attr('data-href');
                getMusic.call(this, href, li);
            })
            .delegate('.jsRemoveMe', 'click', function () {
                var li = $(this).parents('li');
                var src = li.attr('data-href');
                if (getAudio().src === src) playNext();
                li.remove();
                saveList();
            })
            .delegate('#deletePlay', 'click', function () {
                var li = $('#playList li[data-href="' + getAudio().src + '"]');

                if (li.length) {
                    playNext();
                } else {
                    getAudio().pause();
                }

                li.remove();
                saveList();
            })
            .delegate('.jsPlayMe', 'click', function () {
                var li = $(this).parents('li');
                var src = li.attr('data-href');
                playMe(src, li.find('.jsSongTitle').text(), li);
            })
            .delegate('#playNext', 'click', function () {
                playNext();
            })
            .delegate('#searchForm', 'submit', function () {
                switchList();
                resultHtml('');
                var word = $.trim($('#keyWord').val());

                if (!word) {
                    resultWarning('您要找啥呢？');
                    return;
                }

                qidizi.word = word;
                getSearch(1);
            })
            .delegate('.jsNextPage', 'click', function () {
                getSearch($(this).attr('data-page'));
            })
            .delegate('#togglePlayList', 'click', function () {
                switchList(!$(this).hasClass('active'));
            })
        ;

        function getAudio() {
            return document.getElementById('audio');
        }

        function switchList(isPlayList) {
            $('.jsListBody').addClass('d-none');

            if (isPlayList) {
                /*显示播放列表*/
                $('#playList').removeClass('d-none');
                $('#togglePlayList').addClass('active');
                $('#search').removeClass('active');
            } else {
                $('#result').removeClass('d-none');
                $('#togglePlayList').removeClass('active');
                $('#search').addClass('active');
            }
        }

        function saveList() {
            var json = [];
            $('#playList li').each(function () {
                var obj = {
                    t: $(this).find(".jsSongTitle").text(),
                    s: $(this).data('href')
                };

                if ($(this).hasClass('isPlaying')) {
                    obj.p = 1;
                }

                json.push(obj);
            });
            json = JSON.stringify(json);
            try {
                /* 隐身模式会出错 */
                localStorage.setItem('qidiziDjPlayer', json);
            } catch (e) {
            }
        }

        function getMusic(href, dom) {
            var clk = this;

            if (dom.attr('data-audio')) {
                doSrc(dom.attr('data-audio'));
                return;
            }

            function doSrc(src) {
                var is = $(clk).attr('data-is');
                var title = $.trim(dom.find('.jsSongTitle').text());
                var li = $('li[data-href="' + src + '"]');

                if ('test' !== is && !li.length) {
                    li = $(listLi(src, title));
                    li.appendTo('#playList');
                    saveList();
                }

                'append' !== is && playMe(src, title, li);
            }

            // 防止因为响应慢，并发，总是取消前面的
            if (qidizi.ajax) {
                try {
                    qidizi.ajax.abort();
                } catch (e) {

                }
            }

            progress(1);
            qidizi.ajax = $.ajax({
                url: qidizi.useProxy ? qidizi.proxy : href,
                type: qidizi.useProxy ? 'POST' : 'GET',
                cache: false,
                dataType: 'text',
                data: qidizi.useProxy ? {
                    base64EncodeUrl: Base64.encode(href)
                } : null,
                success: function (body) {
                    var code = body;
                    try {
                        /* 对方不清楚基于什么实现，主要是ajax请求就会返回json */
                        code = new Function('', 'return ' + code)();
                    } catch (e) {
                        code = body;
                    }

                    var src = 0;
// 目前不分pc或wap
                    code.replace(/function\s+DeCode[\s\S]+?playurl\s*=[^;]+\.[^;]+/, function (js) {
                        try {
                            src = new Function('', js + ';return "http://tm.vvvdj.com/mp4/" +playurl+".mp4";')();
                        } catch (e) {
                        }
                        return '';
                    });

                    if (!src) {
                        myAlert('获取歌曲文件异常[WAP无法解析歌曲url]', dom);
                        return;
                    }

                    dom.attr('data-audio', src);
                    doSrc(src);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    myAlert('获取播放地址异常，请联系作者修复[' + textStatus + ']', dom);
                },
                complete: function () {
                    progress(0);
                }
            });
        }

        function resultWarning(html) {
            resultHtml('<li class="list-group-item-danger list-group-item text-center">' + html + '</li>');
        }

        function resultInfo(html) {
            resultHtml('<li class="list-group-item-info list-group-item text-center">' + html + '</li>');
        }

        function resultHtml(html) {
            $('#result').html(html);
        }

        function getSearch(page) {
            switchList();
            resultInfo('<a onclick="return false;" href="' + getUrl(page) + '">搜索中...</a>');
            $('#keyWord').attr('readonly', 'readonly');
            page = +page || 1;

// cid 0全部，1串烧，2单曲；list 1 a-z，2 z-a，3 热播，4 下载最多
            function getUrl(page) {
                return qidizi.source + "/search/so?cid=0&list=1&page=1&key=" + encodeURIComponent(qidizi.word) + "&page=" + page;
            }

            // 防止因为响应慢，并发，总是取消前面的
            if (qidizi.ajax) {
                try {
                    qidizi.ajax.abort();
                } catch (e) {

                }
            }

            progress(1);
            qidizi.ajax = $.ajax({
                url: qidizi.useProxy ? qidizi.proxy : getUrl(page),
                data: qidizi.useProxy ? null : {
                    base64EncodeUrl: Base64.encode(getUrl(page))
                },
                type: qidizi.useProxy ? 'POST' : 'GET',
                cache: false,
                success: function (body) {
                    var code = body;
                    try {
                        /* 对方不清楚基于什么实现，主要是ajax请求就会返回json */
                        code = new Function('', 'return ' + code)();
                    } catch (e) {
                        code = body;
                    }

                    var song = [];
                    var songHtml = code;
                    var count = 0;
                    var pages = 1;

                    if (qidizi.source.indexOf('://www.') > 0) {
// pc
                        songHtml = songHtml.match(/共搜索到[^<]*<[^>]+>(\d+)([\S\s]+?)左侧结束/);

                        if (!songHtml) {
                            resultWarning('解析搜索结果异常，请跟开发者反馈[按PC截取失败]');
                            return;
                        }

                        count = +songHtml[1];
                        songHtml = songHtml[2];

                        if (!count) {
                            resultInfo('查无此歌');
                            return;
                        }

                        songHtml = songHtml.replace(
                            /href\s*=\s*"\/play\/(\d+)\.html"[^>]*title\s*=\s*"([^"]+)/ig,
                            function ($1, id, title) {
                                song.push(searchLi(id, title));
                                return '';
                            }
                        );

                        if (!song.length) {
                            resultWarning('解析搜索结果异常，请跟开发者反馈[按PC解析歌曲失败]');
                            return;
                        }

                        songHtml = songHtml.match(/个记录\s*\d+\/(\d+)页/);

                        if (songHtml) {
                            pages = +songHtml[1];
                        }
                    } else {
// 手机

                        if (songHtml.indexOf('无记录...') > 0) {
                            resultInfo('查无此歌');
                            return;
                        }

                        pages = songHtml.match(/<[^>]+pagetext[^>]+>\d+\/(\d+)/);
                        pages = pages ? +pages[1] : 1;
                        songHtml
                            .replace(/<\/?em>/g, '')
                            .replace(/<a\s*href="\/play\/(\d+)\.html"[^>]*>\s*<p>([^<]+)/ig, function ($0, id, title) {
                                song.push(searchLi(id, title));
                                return '';
                            });


                        if (!song.length) {
                            resultWarning('解析搜索结果异常，请跟开发者反馈[按WAP解析歌曲失败]');
                            return;
                        }
                    }

                    songHtml = song.join('');

                    if (pages > 1) {
                        songHtml += '<li class="list-group-item text-center list-group-item-success">' +
                            '<i>' + page + '/' + pages + '</i>';

                        if (page > 1) {
                            songHtml += '<a href="javascript:void(1)" class="btn btn-link jsNextPage" data-page="1">首页</a>' +
                                '<a href="javascript:void(' + (page - 1) + ')" class="btn btn-link jsNextPage" data-page="' + (page - 1) + '">上页</a>'
                            ;
                        }

                        if (page + 1 <= pages) {
                            songHtml += '<a href="javascript:void(' + (page + 1) + ')" class="btn btn-link jsNextPage" data-page="' + (page + 1) + '">下页</a>' +
                                '<a href="javascript:void(' + pages + ')" class="btn btn-link jsNextPage" data-page="' + pages + '">尾页</a>'
                            ;
                        }

                        for (var i = 1; i <= pages; i++) {
                            if (page === i) continue;

                            songHtml += '<a href="javascript:void(' + i + ')" class="btn btn-link jsNextPage" data-page="' + i + '">' +
                                i +
                                '</a>'
                            ;
                        }

                        songHtml += '</li>';
                    }

                    resultHtml(songHtml);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    resultInfo('oops!好像出了点意外哦...[' + textStatus + ']，' +
                        '<a href="javascript:void(' + page + ')" class="btn btn-link jsNextPage" data-page="' + page + '">点此重试</a>');
                },
                complete: function () {
                    progress(0);
                    $('#keyWord').removeAttr('readonly');
                },
                dataType: 'text'
            });
        }

        function playNext() {
            if (!$('#playList li').length) return;

            var li = $('#playList li.isPlaying');

            if (li.length) {
                /* has playing */
                li = li.next();
            }

            if (!li.length) {
                /* stop ? first item */
                li = $('#playList li:first');
            }

            var src = li.attr('data-href');
            playMe(src, li.find('.jsSongTitle').text(), li);
        }

        function playMe(src, title, li) {
            if (!src) return;
            var playCls = 'list-group-item-success isPlaying';
            $('#playList li').removeClass(playCls);
            $(li).addClass(playCls);
            $('#song').text(document.title = title);
            getAudio().src = src;
            getAudio().play();
            saveList();
        }

        function myAlert(html) {
            $('#alertContent').html(html);
            $('#alert').addClass('show').removeClass('hide');
        }

        function searchLi(id, title) {
            return '<li class="list-group-item text-right"  data-href="' + qidizi.source + '/play/' + id + '.html">' +
                '<p class="mw-100 text-truncate jsSongTitle">' + title + '</p>' +
                '<a href="javascript:void(0)" class="btn btn-outline-primary jsPlayResultItem" data-is="test">试听</a>' +
                ' <a href="javascript:void(0)" class="btn btn-outline-success jsPlayResultItem" data-is="play">播放</a>' +
                ' <a href="javascript:void(0)" class="btn btn-outline-success jsPlayResultItem" data-is="append">加入</a>' +
                '</li>';
        }

        function progress(show) {
            $('#progress')[show ? 'removeClass' : 'addClass']('d-none');
        }

        function listLi(src, title, cls) {
            return '<li class="list-group-item ' + (cls || '') + ' text-right"  data-href="' + src + '">' +
                '<p class="jsSongTitle mw-100 text-truncate">' +
                title +
                '</p>' +
                '<a class="btn btn-outline-danger jsRemoveMe" href="javascript:void(0);">删了</a> ' +
                '<a class="btn btn-outline-success jsPlayMe" href="javascript:void(0);">播放</a> ' +
                '</li>';
        }
    } catch (e) {
        alert('播放器异常：\n' + JSON.stringify(e));
    }
}
