# 微信小程序页面加载解析, wxpage预加载分析
[gitHub地址](https://github.com/clevok/wxpage-mjb)
## 前言

关于小程序加载问题, 看过很多文章

1. 加载小程序
    
    除了下载, 环境等等,`小程序所有的页面都一开始就会被加载!!!` 注意了,这个地方可以入手, wxpage,wepy, 预加载抓住了这一点
    我们可以在任意一个js中, 执行打印, 或者建立事件监听, 都是可以执行到的


        // index.js 
        event.on('load', ()=>{ console.log('我是index') });
        
        // user.js 
        event.on('load', ()=>{ console.log('我是user') });
        
        // setting.js 
        event.on('load', ()=>{ console.log('我是setting') });

        // index.js
        onLoad() {
            event.emit('load');
            // 我是index;
            // 我是user;
            // 我是setting;
        }

>小程序的加载类似 webpack+vue, 引用都存在包里, 除Page()方法传入的对象,每次加载页面都会重新深拷贝到App, 其他的引用一直存在内存中不变,event.js 就是个很好的例子


2. 页面加载完后,`Page()` 对象会被 `深拷贝` 维护在一个 页面对象中, 在加载的时候读取出来, 存入 [页面栈中](https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/route.html) getCurrentPages(我猜的)


## 研究小程序Page页面 data属性初始化

### 基础代码

    // config.js
    exports.demo1 = 'demo1'
    exports.demo2 = {
        name: 'demo2'
    }

<br/>

    // A页面
    methods: {
        router: () {
            config.demo1 = '更改'
            config.demo2.name = '更改'
            event.emit('router:B'); // 我用事件监听来跳转
        }
    }

<br/>

### 验证 Page是否深拷贝, 以及验证, Page内data直接引用 外包js, 每次加载Page，data是否会改变

    // B页面
    let config = require('../config');
    event.on('router:B', ()=> {
        router('B'); // 跳转到B
    });

    let item = {
        data: {
            name: wx.getStorageSync('page'),
            demo1: config.demo1, // 因为是按值类型, 哪怕后来刚刚了config.demo1, Page再加载的时候, 也不变了。
            demo2: config.demo2, // 影响 按引用
            demo2.name: config.demo2.name // 不会再变的值
        },
        onLoad () {
            this === item; // false 以及经过深拷贝了
            this.data.demo2 === item.data.demo2 // false 深拷贝

            item.data.demo2 === config.demo2 // ture item对象依然存在的
            this.data.demo2 === config.demo2 // false 深拷贝
        }
    };
    Page(item);

1. 经测试,我们发现, Page每次都深拷贝item对象, 且 item是依然存在的, 然而 Page对象与 item已经断开了联系, 包括 Page.data.demo2 也和config.demo2断开了联系, 因此证明页面每次加载都是`深拷贝`.

2. 经测试, 在小程序加载后, 所有的 按值引用的变量都定下来了（这是基本的，应该是存在js执行，解析的原理） , 只有按引用 类型的变量, 再深拷贝会 重新读取赋值, 所以可以抓住这一点.作预加载

> 因此, 我们在跳转 router 前, 可以提前保存一个 对象进 内存中, 在下一个页面 Page.data.list 直接 引用 包内的对象, 这样, 在跳转到 下一个页面深拷贝时, Page.data已经是新的了.

这里可以来个快捷加载咯,要注意了,` 要先改, 在引用的页面加载之前才有效果,`

---

### 那么 wxpage, wepy的 preload 是怎么用呢
上面的那个方式,必须保证页面跳转前 `数据`已经加载完了, 再跳转，才能读取深拷贝改变后的data, 这样就很不好了
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
如果你有疑问, 那就是 onLoad 内的this和 onPreload 内的this 不一样， 为什么可以取，因为 put,和take是框架扩展的两个方法而已，真正还是往包里（channel）拿里拿

--- 



## wxpage 解析 未完

### Page
在 page.js 中 定义了 WXPage 的方法, 这个是 注册页面的主要的方法


    /**
     * @params {string} name 页面名
     * @params {object} options 扩展对象
     * /
    function WXPage(name, option) {}

注册页面的时候
options会被加入一些特殊的属性

- **name** 页面名（用来通知的路径）
- **extendPageBefore**

- **onNavigate({url, query})** 监听 navigateTo:${name}, redirectTo:${name}, switchTab:${name}, reLaunch:${name} 事件
- **onPreload({url, query})** 监听 preload:${name} 事件
- **$state** (不管他)
- **$emitter** 一个通知

- 然后 是 **bridge.methods** 下一大属性,$cache, $session, $preload 等等

- **$on**
- **$emit**
- **$off**

- **$属性** 用于父子组件关联，引用的是brideg.mount
    我们先看component.js 组件注册的时候, attached的时候, 会给组件注册$id(自增id)属性, 并记录到 refs对象中, 并向上触发事件

        refs[id] = this

        this.triggerEvent('ing', {
			id: this.$id,
			type: 'attached'
		})

    再看定义组件的方法

        <custom-component ref="name" binding="$" />

    然后我们看看`$`方法写了什么
    就是监听了两种type,`attached`和 `event:call`, event:call是在组件实现 $call的时候调用(调用主页面方法)
    `attached`会调用`getRef`, 其实就是根据 id 获取组件对象, 然后把记录到 页面 this.refs[ 组件名(ref) ] , 再调用组件的 _$attached 保存 `$root` 和 `$parent`

        component.getRef = function (id) {
            return refs[id]
        }

- **$setData**
- **onAwake** app:sleep 事件
- **extendPageAfter**


### App
需要知道的是, app所有的属性都被额外保存在 conf中, 不过 `resolvePath` 和 `route` 会特殊保存
Page中的 extendPageAfter, extendPageBefore 也是在这里拿到的



### router
官方案例

    redirect(pagename[, config])

这个东西我好绕呀

执行 this.$router 调用到 bridge.route 执行到 redirector.route 的方法，这时候正式跳转, 还发出了一个事件

	exportee.emit('navigateTo', cfg.url)
    
上面事件，在 page.js 通过 执行 brideg.redirectDelegate 来监听 上面的事件

    // page.js
    bridge.redirectDelegate(redirector, dispatcher)
    
    // brideg.js
    redirectDelegate: function (emitter, dispatcher) {
		;['navigateTo', 'redirectTo', 'switchTab', 'reLaunch'].forEach(function (k) {
			emitter.on(k, function (url) {
				var name = getPageName(url)
				name && dispatcher.emit(k+':'+name, url, fns.queryParse(url.split('?')[1]))
			})
		})
	}

此时又发了个事件， 这个事件在 page.js option.onNavigate 中监听了所有

    dispatcher.on('navigateTo:'+name, onNavigateHandler)
	dispatcher.on('redirectTo:'+name, onNavigateHandler)
	dispatcher.on('switchTab:'+name, onNavigateHandler)
	dispatcher.on('reLaunch:'+name, onNavigateHandler)

这个地方存疑, 因为 `redirector.route` 只发出 `navigateTo` 这一个事件


---

看不下去了, 还有好多