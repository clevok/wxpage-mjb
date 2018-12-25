# wxpage-mjb
mjb-wxpag

## 分析

## 前言

关于小程序加载问题, 看过很多文章

1. 加载小程序
    
    除了下载, 环境等等,`小程序所有的页面都一开始就会被加载!!!` 注意了,这个地方可以入手, wxpage就抓住了这一点

2. 页面加载完后,`Page()` 对象会被 `深拷贝` 维护在一个 页面对象中, 在加载的时候读取出来, 存入 [页面栈中](https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/route.html) getCurrentPages(我猜的)


## 研究小程序Page页面 data属性初始化

    // config.js
    exports.demo1 = 'demo1'
    exports.demo2 = {
        name: 'demo2'
    }

    // A页面
    methods: {
        router: () {
            config.demo1 = '更改'
            config.demo2.name = '更改'
            router('B');
        }
    }

    // B页面
    let config = require('../config');

    Page({
        data: {
            name: wx.getStorageSync('page'),
            demo1: config.demo1,
            demo2: config.demo2,
            demo2.name: config.demo2.name
        }
    })

通过A页面更改config的属性,跳转到B页面,得出结论

    Page({
        data: {
            name: '',
            demo1: 'demo1',
            demo2: config.demo2,
            demo2.name: 'demo2'
        }
    })
--- 



大致就是这样的,你注册的所有的页面（Page）会被`深拷贝`维护在一个列表中



每当加载到那个页面, 把页面给取出来, 这里的页面, 我仅仅指的 是 Page()内的对象

### 注册页面
在 page.js 中 定义了 WXPage 的方法, 这个是 注册页面的主要的方法


    /**
     * @params {string} name 页面名
     * @params {object} options 扩展对象
     * /
    function WXPage(name, option) {}

注册页面的时候
options会被加入一些特殊的属性

- name 页面名（用来通知的路径）
- onNavigate({url, query}) 监听 navigateTo:${name}, redirectTo:${name}, switchTab:${name}, reLaunch:${name} 事件
- onPreload({url, query}) 监听 preload:${name} 事件
- $state (不管他)
- $emitter 一个通知

- 然后 是 bridge.methods 下一大属性,$cache, $session, $preload 等等

- $on
- $emit
- $off
