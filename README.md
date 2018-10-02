# djPlayer

因为自己比较喜欢听旋律比较好的dj音乐，为了方便使用，自己弄了个播放器，音源来自网络。
根据自己使用感受改变音源，优化功能。

原理：

1. 利用收藏夹特性，编辑可以注入播放器js到音源网站书签；
1. 以后点击书签即可自动打开音源网站，再次点击书签即可注入播放器；
1. 使用注入的js，查找歌曲；

功能：

1. 搜索
1. 播放列表
1. 记忆播放列表（大小与受浏览器有关）
1. 播放控制相关功能

已知无法修复的bug:

1. android的html5 audio可以改变音量；但ios的audio volume是只读的，无法修改；
1. android 使用chrome试用，锁屏可以自动下首；其它浏览器未知。
1. ios在浏览器处于background时，js会被系统挂起，无法自动播放下首；但是锁屏时，chrome可以自动下首；其它浏览器未知。


编辑书签，[点此打开制作标签操作页](https://qidizi.github.io/djPlayer/index.html)，截图
![屏幕截图](https://github.com/qidizi/djKKPlayer/raw/master/index.png)

注入的播放器截图

![屏幕截图](https://github.com/qidizi/djKKPlayer/raw/master/screenShot.png)


