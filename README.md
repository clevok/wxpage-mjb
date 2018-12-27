# wxpage-mjb
笔记

## 分析

## 前言

关于小程序加载问题, 看过很多文章

1. 加载小程序
    
    除了下载, 环境等等,`小程序所有的页面都一开始就会被加载!!!` 注意了,这个地方可以入手, wxpage,wepy, 预加载抓住了这一点
    我们可以在任意一个js中, 执行打印, 或者建立事件监听, 都是可以执行到的, 需要注意的是, page对象的this,是不同的,因为此this非彼this


        index.js event.on('load', ()=>{ console.log('我是index') });
        user.js event.on('load', ()=>{ console.log('我是user') });
        setting.js event.on('load', ()=>{ console.log('我是setting') });

        onLoad() {
            event.emit('load');
            // 我是index;
            // 我是user;
            // 我是setting;
        }

>小程序的加载类似 webpack+vue, 除却 Page({})上的 引用都存在包里, Page({})内的,每次加载页面都会重新加载页面,深拷贝一个对象

2. 页面加载完后,`Page()` 对象会被 `深拷贝` 维护在一个 页面对象中, 在加载的时候读取出来, 存入 [页面栈中](https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/route.html) getCurrentPages(我猜的)


## 研究小程序Page页面 data属性初始化

    // config.js
    exports.demo1 = 'demo1'
    exports.demo2 = {
        name: 'demo2'
    }

---

    // A页面
    methods: {
        router: () {
            config.demo1 = '更改'
            config.demo2.name = '更改'
            event.emit('router:B'); // 我用事件监听来跳转
        }
    }

---

### 验证 Page 加载后 Page.this与原页面对象item对象是否还有联系

    // B页面
    let config = require('../config');
    event.on('router:B', ()=> {
        // item一直是正常引用状态
        router('B'); // 跳转到B
    });

    let item = {
        data: {
            name: wx.getStorageSync('page'),
            demo1: config.demo1, // 不收config影响, 因为是按值类型
            demo2: config.demo2, // 影响 按引用
            demo2.name: config.demo2.name
        },
        onLoad () {
            
            this === item; // false 以及经过深拷贝了
            this.data.demo2 === item.data.demo2 // false 深拷贝

            item.data.demo2 === config.demo2 // ture item对象依然存在的
            this.data.demo2 === config.demo2 // false 深拷贝
        }
    };
    Page(item);

经测试,我们发现, item是依然存在的, 然后 Page对象与 item已经断开了联系, 包括 Page.data.demo2 也和config.demo2断开了联系
推断, 在进入B页面的时候,此时B页面的 Page(pageObject) 经过类似 `深拷贝` 复制 item 对象, 然后开始渲染

> 因此, 我们在跳转 router 前, config.demo2.name = '更改', 对page是有影响的, 因为那时候小程序页面还没有加载, 更改config, 同步影响到item.data, 然后跳转, 小程序深拷贝item一个页面, 此时的 demo2以及更改了。
这里可以来个快捷加载咯,要注意了,` 要先改, 在引用的页面加载之前才有效果,` 比如我A页面直接把list保存在config中，B页面data直接是引用config.list, 之后B页面加载时候, 请求更新 B.page.data.list更新, config.list也记得更新一下.


### 那么 wxpage,wepy的preload是怎么用呢
上面的那个方式,必须保证页面跳转前 `数据`已经加载完了,再跳转，才能读取深拷贝改变后的data, 这样就很不好了
所以, 该框架采用, 跳转的时候, 就请求加载数据, 把请求体保存在内存（变量），等B页面加载完后，onLoad() 再读取这个变量，赋值到data
,说白了，就是提前请求。

然后，为了分离代码，框架又 监听了事件

[官方示例: 参考代码](https://github.com/tvfe/wxpage/issues/25)

    // 页面index
    Page.P('index', {
        clickToDetail() {
            this.$preload('detail')
        }
    })


    // 页面detail
    Page.P('detail', {
        onPreload() {
            this.$put('detail_preload_fetch', this.fetch())
        },
        onLoad() {
            ;(this.$take('detail_preload_fetch')||this.fetch()).then(data=>{
                console.log(data)
                // do somthing
            })
        },
        fetch() {
            return fetch('xxx')
        }
    })

`this.$preload` 是emit事件, detail监听到执行 `onPreload` 方法，`$put` 将 `this.fetch()`保存到一个名为 `channel(brideg.js)` 的对象中
然后调转到detail页面，再通过`this.$take`取出`channel`对应的`key` 这样就实现啦

--- 



### wxpage 注册页面
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
