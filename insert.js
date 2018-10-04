+function () {
    try {
        localStorage.setItem("qidizi", 1);
    } catch (e) {
        quit("浏览器版本过低，或您使用了隐私模式：自动保存播放列表功能无法正常工作");
        return;
    }

    var source = 'vvvdj.com';
    if (!location.hostname || location.hostname.toLowerCase().indexOf(source) < 0) {
        var delay = 3;
        quit('页面完成后，请<strong style="color: red;" >再次点击标签</strong>，注入播放器<br>' +
            delay + '秒后自动打开<a href="' + source + '">' + source + '</a>');
        setTimeout(function () {
            location.href = "http://www." + source + '/?r=' + +new Date;
        }, delay * 1000);
        return;
    }

    makePlayer();
}();

function quit(tip) {
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
    if ('loading' === document.readyState) return setTimeout(makePlayer, 100);
    var html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <title>DJ Player</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
          integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.3.1.min.js"
            integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo"
            crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js"
            integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49"
            crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js"
            integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy"
            crossorigin="anonymous"></script>
    <style>
        html,body{min-width:100%;min-height:100%;display: block;}
        .listBody {
            margin: 0 auto;
            padding: 70px 0 200px 0;
            max-width: 700px;
            min-height: 100%;
        }
    </style>
</head>
<body>
<nav class="navbar fixed-top navbar-light bg-light">
    <form onsubmit="return false;" class="needs-validation form-inline mx-auto" novalidate="novalidate" id="searchForm">
        <div class="input-group"><input class="form-control text-center" value="remix" placeholder="找啥？" id="keyWord"
                                        required="required">
            <div class="input-group-append">
                <button class="btn btn-outline-secondary" type="submit" id="search">找歌</button>
                <button class="btn btn-outline-success active" type="button" id="togglePlayList">我的</button>
            </div>
        </div>
    </form>
</nav>
<ul class="list-group listBody d-none jsListBody" id="result"></ul>
<ul class="list-group listBody jsListBody" id="playList"></ul>
<nav class="navbar fixed-bottom navbar-light bg-light px-0">
    <div class="text-center w-100">
        <a class="btn btn-outline-dark jsVolumeChange isDown">减小</a>
        <a class="btn btn-outline-dark jsVolumeChange isUp">加大</a>
        <a class="btn btn-outline-danger" id="deletePlay">删了</a>
        <a class="btn btn-outline-primary" id="playNext">下首</a>
    </div>
    <div id="song" class="text-center navbar-text w-100 text-truncate" role="alert">播放已停止</div>
    <audio controls="controls" autoplay="autoplay" id="audio" class="b-block w-100"></audio>
</nav>
<script type="text/javascript" charset="UTF-8"><!--/*js*///--></script>
</body>
</html>
    `;
    // 发现放到html后面，不会解析js
    html = html.replace('<!--/*js*///-->', '+' + javascript + '();');
    document.open();
    document.write(html);
    document.close();
}

function javascript() {
    /* 可能子域是www或是m*/
    var qidizi = {};
    var source = location.href.replace(/^([^:]+:\/+[^\/]+).*/, "$1");
    window.audio = document.getElementById('audio');
    var plaform = {
        /* ios volume readonly */
        isIos: 'iPhone/iPad'.indexOf(navigator.platform) > -1,
        isMac: 'MacIntel' === navigator.platform,
        isAndroid: navigator.userAgent.indexOf('Android')
    };

        /* 禁用并绑定调整音量按钮提示
         ios 限制，需要用户操作触发首次播放，下次才能自动播放,firefox 有选项启用
         */
        $('body').one('click', function () {
            audio.play();
        });

    /* ios background 浏览器时，无法自动开始播放下首，但是chrome 锁屏时却可以；*/
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
            if (plaform.isIos) {
                /* ios volume readonly */
                $('.jsVolumeChange').addClass('disabled');
                return;
            }

            var isUp = $(this).hasClass('isUp');
            try {
                var vol = audio.volume + (isUp ? +1 : -1) * 0.05;

                if (vol > 1) vol = 1;
                else if (vol < 0) vol = 0;

                audio.volume = vol;
            } catch (e) {

            }
            $(this).stop().html(String(audio.volume).replace(/(\.\d{2})\d+$/, '$1')).show().delay(1000).show(function () {
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
            switchList($(this).hasClass('active') ? false : true);
        })
    ;

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

    function listLi(src, title, cls) {
        return '<li class="list-group-item ' + (cls || '') + ' text-right"  data-href="' + src + '">' +
            '<a class="btn btn-link jsPlayMe jsSongTitle mw-100 text-truncate" href="javascript:void(0);">' +
            title +
            '</a>' +
            '<br><a class="btn btn-outline-danger jsRemoveMe" href="javascript:void(0);">删除</a> ' +
            '</li>';
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

    function myAlert(html, dom) {
        alert(html);
    }

    function getMusic(href, dom) {
        var clk = this;
        $.ajax({
            url: href,
            type: 'POST',
            cache: false,
            dataType: 'text',
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

                var is = $(clk).attr('data-is');
                var title = $.trim(dom.find('.jsSongTitle').text());
                var li = $('li[data-href="' + src + '"]');

                if ('test' !== is && !li.length) {
                    li = $(listLi(src, title));
                    li.appendTo('#playList');
                    saveList();
                }

                'append' !== is && playMe(src, title, li);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                myAlert('获取播放地址异常，请联系作者修复[' + textStatus + ']',dom);
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

    function resultLi(id, title) {
        return '<li class="list-group-item text-right"  data-href="' + source + '/play/' + id + '.html">' +
            '<a href="javascript:void(0)" class="btn btn-link jsPlayResultItem mw-100 text-truncate jsSongTitle" data-is="play">' + title + '</a>' +
            '<br><a href="javascript:void(0)" class="btn btn-outline-primary jsPlayResultItem" data-is="test">试听</a>' +
            ' <a href="javascript:void(0)" class="btn btn-outline-success jsPlayResultItem" data-is="append">加入</a>' +
            '</li>';
    }

    function getSearch(page) {
        switchList();
        resultInfo('搜索中...');
        $('#keyWord').attr('readonly', 'readonly');
        page = +page || 1;

        // cid 0全部，1串烧，2单曲；list 1 a-z，2 z-a，3 热播，4 下载最多
        function getUrl(page) {
            return source + "/search/so??cid=0&list=1&page=1&key=" + encodeURIComponent(qidizi.word) + "&page=" + page;
        }

        $.ajax({
            url: getUrl(page),
            type: 'POST',
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

                if (source.indexOf('://www.') > 0) {
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
                            song.push(resultLi(id, title));
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
                            song.push(resultLi(id, title));
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
                        songHtml += '<a href="javascript:void(1)" class="btn btn-default jsNextPage" data-page="1">首页</a>' +
                            '<a href="javascript:void(' + (page - 1) + ')" class="btn btn-default jsNextPage" data-page="' + (page - 1) + '">上页</a>'
                        ;
                    }

                    if (page + 1 <= pages) {
                        songHtml += '<a href="javascript:void(' + (page + 1) + ')" class="btn btn-default jsNextPage" data-page="' + (page + 1) + '">下页</a>' +
                            '<a href="javascript:void(' + pages + ')" class="btn btn-default jsNextPage" data-page="' + pages + '">尾页</a>'
                        ;
                    }

                    for (var i = 1; i <= pages; i++) {
                        if (page === i) continue;

                        songHtml += '<a href="javascript:void(' + i + ')" class="btn btn-default jsNextPage" data-page="' + i + '">' +
                            i +
                            '</a>'
                        ;
                    }

                    songHtml += '</li>';
                }

                resultHtml(songHtml);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                resultInfo('oops!好像出了点意外哦！什么都没有...[' + textStatus + ']');
            },
            complete: function () {
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
}
