# djPlayer


因为自己比较喜欢听旋律比较好的dj音乐，为了方便使用，自己弄了个播放器，音源来自网络。
不定时根据自己使用感受改变音源，优化功能。

## v2版本，代理方式，打开网址即用
### 原理
使用服务器做跨域代理，获取音源内容

### 功能

1. 从音源站搜索歌曲
1. 播放列表（自动保存）
1. 播放控制相关功能

### 不足

1. ios的audio volume受系统限制无法通过JS调整大小，不提供音量调节功能 ***[无法修复]*** ；
1. 自已使用android 的 chrome平常使用，锁屏可以自动下首；其它浏览器未测试。 ***[暂不考虑做其它浏览器兼容处理]***
1. ios 使用chrome测试，在浏览器处于后台或是锁屏时，js会被系统挂起，无法自动播放下首 ***[正在寻找解决方案]***

### 使用方式
[点此链接即用](https://qidizi.github.io/djPlayer/v2.html)

### 截屏

![android手机截图](https://github.com/qidizi/djKKPlayer/raw/master/v2.png)
*****


## v1版本，注入方式

### 原理：

1. 利用收藏夹 [bookmarklet](https://en.wikipedia.org/wiki/Bookmarklet) 特性，编辑可以注入播放器js到音源网站书签；
1. 以后点击书签若不是音源网页即提示并转向音源网站，再次点击书签即可注入播放器；
1. 使用注入的js，查找歌曲；

### 用法
编辑书签，[点此打开制作标签操作引导页](https://qidizi.github.io/djPlayer/index.html)

### 截屏
![屏幕截图](https://github.com/qidizi/djKKPlayer/raw/master/index.png)

注入的播放器截图

![屏幕截图](https://github.com/qidizi/djKKPlayer/raw/master/screenShot.png)


