# djKKPlayer
因为该网站播放器比较差，手机上无法自定义歌曲自动播放，用php+js弄了一个方便自己播放

已知bug:
虽然android可以修改，但是ios 的audio volume是只读的，无法修改，所以放弃了，实现调整音量功能；
ios 无法在浏览器处于background时，断续播放下首，但是锁屏时，却可以自动下首；chrome试过；目前暂不清楚是否有其它浏览器使用服务方式提供audio播放功能。


![屏幕截图](https://github.com/qidizi/djKKPlayer/raw/master/screenShot.png)


