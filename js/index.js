var currentIndex = 0
var audioObj = new Audio()
var musicList = []

function $(select){
    return document.querySelector(select)
}

//  向服务器获取歌曲信息，为了让代码更有规律，抽象成函数来调用

function getmusicList(callback){
    var xhr = new XMLHttpRequest()
    xhr.open('GET', '/music.json', true)
    xhr.onload = function(){
        if((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304){
            callback(JSON.parse(xhr.responseText))
        }else{
            console.log('获取数据失败')
        }
    }
    xhr.onerror = function(){
        console.log('网络异常')
    }
    xhr.send()
}

// 调用函数来向服务器获取信息，获取信息后的操作也封装成函数

getmusicList(function(list){
    musicList = list
    loadMusic(list[currentIndex])
 })

 function loadMusic(musicObj){
    audioObj.src = musicObj.src         // 好奇这里作用域和闭包的范围
    $('.song .name').innerText = musicObj.title
    $('.song .author').innerText = musicObj.author
    $('.picture').style.backgroundImage = 'url(' + musicObj.img + ')'  // 变背景图片
    audioObj.autoplay = true
} 

/*实现暂停和播放 由于没办法设置一开始就自动播放的关系，所以一开始图标是播放图标
如果这时不点播放直接点下一首，就会导致$('.star').onclick不走
导致播放时图标为播放图标而不是暂停图标
所以为了图标显示正确，把播放时候的图标变化放到下面的audioObj.onplay
通过识别播放状态来换图标*/

$('.star').onclick = function(){
    if(audioObj.paused){
        audioObj.play()
    }else{
        audioObj.pause()
        $('.star .iconfont').classList.remove('icon-stop')
        $('.star .iconfont').classList.add('icon-star')
    }
}
// 实现上一首下一首

$('.up').onclick = function(){
    currentIndex = (musicList.length + --currentIndex) % musicList.length
    loadMusic(musicList[currentIndex])
}
$('.next').onclick = function(){
    currentIndex = (++currentIndex) % musicList.length
    loadMusic(musicList[currentIndex])
}

// 识别播放状态，通过setInterval设置时间走动

audioObj.onplay =  function(){

    //很奇怪，如果定义clock变量在最上面的话，暂定就会出现时间显示不对的bug

    var clock = setInterval(function(){    
        var min = Math.floor(audioObj.currentTime / 60)
        var sec = Math.floor(audioObj.currentTime) % 60 + ''
        sec = sec.length === 2? sec : '0' + sec
        $('.timeshow').innerText = min + ':' + sec
    }, 1000)

    // 识别播放状态来更改图标

    $('.star .iconfont').classList.remove('icon-star')
    $('.star .iconfont').classList.add('icon-stop')
}

// 若是暂定，就清除定时器

audioObj.onpause = function(){

    //很奇怪，不定义clock变量在最上面的话，暂定就会出现时间显示不对的bug

    clearTimeout(clock)
}

// 触发timeupdate事件，让进度条动起来

audioObj.ontimeupdate = function(){

    /* 两种办法，一种是用百分比，那么就要去css里面设置父元素的长度和默认定位，不然就会以layout为参考变成450px
    一种是直接设置runbar的长度，如下
    */
    // $('.runbar').style.width = (audioObj.currentTime/audioObj.duration) * 100 + '%'

    $('.runbar').style.width = parseInt(getComputedStyle($('.stopbar')).width) * (audioObj.currentTime/audioObj.duration)+ 'px'
    
}

// 点击进度条获取歌曲进度

$('.bar').onclick = function(e){
    var percent = e.offsetX / parseInt(getComputedStyle(this).width)
    audioObj.currentTime = audioObj.duration * percent
}

// 播放完下一曲

audioObj.onended = function(){
    currentIndex = (++currentIndex) % musicList.length
    loadMusic(musicList[currentIndex])
}

