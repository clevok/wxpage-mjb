### 前言
公司入坑了wepy, 我想想对小程序框架感兴趣了起来, 一直再找在原生基础上扩展属性的框架, 主要想干净点, 自己容易扩展, 后来找到了 wxpage(腾讯视频出品), 在它基础上对 router 改了一下 [github 地址](https://github.com/clevok/wxpage)

## 刚入门时, 我的错误理解
小程序加载类似于 单页面, 主包的内容在加载小程序的时候, 都直接加载

一开始, 我以为一个js文件内, 所有的js逻辑 都必须写在Page.onLoad内, 才能执行(事实上是错的)。
我曾经还以为, 小程序的加载方式 是 类似 传统 多个html页面（或者hubilder App 方案）, A页面更改config.js, B页面不受影响, `实际上`是 类似 vue的Spa 开发模式, 会 相互影响

    // 默认的小程序页面
    // index.js

    const config = require('./config');
    Page({
        onLoad() {}
    });


## 预加载

### 根本
wxpage, wepy 在 `小程序主包所有的页面都一开始就会被加载!!!` 这个地方入手

其实就是给每一个Page页面注册了个事件, 在调用跳转方法`this.$router`的时候, emit了个方法,唤起对应 响应页面 并 执行对象的方法比如 `onPreLoad` , 比如, 提起请求, 将请求保存在一个 对象中, 在那个页面加载onLoad后, 再从对象中取出这个请求, 做处理


### 为什么要将请求保存在一个对象中, onLoad后再取出, 而不是 在 onPreLoad 直接更改 data 内容
这是小程序一个特殊点
小程序主包所有的页面都加载, 在进入一个页面的时候, 会 `深拷贝` 对应页面的Page内的对象, 并扩展一些属性, 存入 [页面栈中](https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/route.html) getCurrentPages(我猜的)


因为 请求是 需要时间的, 你在A页面调用了B页面的 `onPreLoad`, 这个方法，更改 `this.data.name`, 但是, 如果 该页面已经深拷贝了, 请求还没回来, 后来 更改 `this.data.name` 实际更改了 `js文件` 内的data, 深拷贝后的 `this`, 不是原先那个, 两个`this`没有关系, 毕竟, 拷贝后的 `page对象` 没有执行`onPreLoad`方法


> 那么如果是直接更改 data的属性, 是立即执行, 不耗时, 且我延后跳转到该页面，深拷贝是否就是我想要的对象了呢
一开始, 我感觉似乎是这样, 蛮有道理的, 然而实际缺不太一样

    // A.js
    {
        preload () {
            event.emit('preload');
        }
    }

    // B.js
    event.on('preload', ()=> {
        item.onPreload();
        setTimeout(()=> {
            wx.navigateTo({
                url: 'B'
            })
        }, 200);
    });

    let item = {
        data: {
            demo1: 'demo1.name',
            demo2: {
                name: 'demo2.name'
            }
        },
        onPreload: function () {
            this.data.demo1 = 'change.demo1';
            this.data.demo2.name = 'change.demo2';
        }
    }
    Page.P(item);

一开始感觉, A.js 点击 , B.js 更改了item.data属性, 小程序加载B页面, 深拷贝页面对象, 此时的深拷贝对象应该是更改后的, 结果！！！ 没有变化。
> 慢慢的我又发了, 另一个方法会产生变化


因为, A页面响应B页面的请求的时候, B页面执行  `onPreLoad`, 如果说, 在 `onPreLoad` 直接更改 data某个属性, 其实, 如果你执行更改是立刻的, 直接更改了 data , 之后再 进入到该 `B页面`, 那么会深拷贝该页面, 一切都是按你所想的。
但是！！

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

redirector 是 路由的事件, dispatcher 是 所有的page

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