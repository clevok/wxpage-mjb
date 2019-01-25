### 前言
一直在找原生基础上扩展属性的框架, 主要想干净点, 自己容易扩展, 后来找到了 wxpage(腾讯视频出品), 在它基础上对 router 改了一下 [github 地址](https://github.com/clevok/wxpage)

参考大佬的[文章](https://wetest.qq.com/lab/view/294.html?from=content_csdnblog)

## 目录

* [刚入门时,我的错误理解](#刚入门时,我的错误理解)

* [预加载](#预加载)
  - [preload的实现方案](#preload的实现方案)
  - [为什么要将请求保存在一个对象中,onLoad后再取出](#为什么要将请求保存在一个对象中,onLoad后再取出,而不是在onPreLoad直接更改data内容)
  - [预加载的实验性的方案](#预加载的实验性的方案)
  - [预加载的另一个小方案（适合长期不变的数据）](#预加载的另一个小方案（适合长期不变的数据）)
  - [wxpage的preload原理(wepy也一样)](#wxpage的preload原理(wepy也一样))

* [wxpage解析(未完)](#wxpage解析(未完))


## 刚入门时, 我的错误理解
小程序加载类似于 单页面, 主包的内容在加载小程序的时候, 都直接加载

一开始我曾经还以为, 小程序的加载方式 是 类似 传统 多个html页面（或者hubilder App 方案
    
    // A.js
    const config = require('./config');
    console.log('A.js 初始化');
    Page({
        onLoad() {
            console.log('A.onLoad');
        }
    });

    // B.js
    console.log('B.js 初始化');
    Page({
        onLoad() {
            console.log('B.onLoad');
        }
    });

一开始我以为 从A页面 加载B页面的时候， B.js会 重新加载

    // B.js 初始化
    // B.onLoad

事实上, 每次跳到B页面, 仅仅 B页面Page对象会进行`深拷贝`, 进入 页面的生命周期

    // B.onLoad

且主包的所有的内容在一开始就会加载, 就像 vue webpack加载方式, 而分包的内容就像 webpack配置单独的模块, 只有加载到该模块后才会加载该模块下的所有的内容

    // App 加载的时候， 所有的js 都会记载

    // A.js 初始化
    // B.js 初始化
    // 等等其他的页面

    // 然后加载首页A页面, 进入A页面的生命周期， 触发钩子 onLoad方法
    // A.onLoad


> 在小程序启动时，会把所有调用Page()方法的object存在一个队列里（如下图）。每次页面访问的时候，微信会重新创建一个新的对象实例（实际上就是深拷贝）。

[](https://f.wetest.qq.com/gqop/10000/20000/LabImage_77ebebbdda7eb0340c5f1939ba93c1e1.png)


## 预加载

预加载 的 实现方案 就是在小程序页面加载机制上 ，A页面通过事件监听的等方式, 先调用 对应页面B 的 原型（即将要被深拷贝的页面对象） 的特殊的方法。来达到 分离业务逻辑，提前请求的目的

### preload的实现方案

其实就是给每一个Page页面注册了个事件, 在调用跳转方法`this.$router`的时候, emit了个方法,唤起对应 响应页面 并 执行对象的方法比如 `onPreLoad` , 比如, 提起请求, 将请求保存在一个 对象中, 在那个页面加载onLoad后, 再从对象中取出这个请求, 做处理


### 为什么要将请求保存在一个对象中,onLoad后再取出,而不是在onPreLoad直接更改data内容
这是小程序一个特殊点
小程序主包所有的页面都加载, 在进入一个页面的时候, 会 `深拷贝` 对应页面的Page内的对象, 并扩展一些属性, 存入 [页面栈中](https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/route.html) getCurrentPages(我猜的)


因为 请求是 需要时间的, 你在A页面调用了B页面的 `onPreLoad`, 这个方法，更改 `this.data.name`, 但是, 如果 该页面已经深拷贝了, 请求还没回来, 后来 更改 `this.data.name` 实际更改了 `js文件` 内的data, 深拷贝后的 `this`, 不是原先那个, 两个`this`没有关系, 毕竟, 拷贝后的 `page对象` 没有执行`onPreLoad`方法


### 预加载的实验性的方案

> 那么如果是在前一个页面直接更改要跳转页面的 data的属性, 是立即执行, 不耗时, 且我延后跳转到该页面，深拷贝是否就是我想要的对象了呢

一开始, 我感觉似乎是这样, 蛮有道理的, 然而实际却不太一样

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
            // demo2: config.demo2 // 引入的方式也一样的
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
再后来发现

**`只有在2.4.0及以下的版本上面的方法能起作用，但是不要用这个了，了解下就好, 新版本不支持`**

--- 

组件的加载：不管用不用，都先加载, 组件的生命周期, 且只有在页面中wxml中引用才会触发, 仅仅json中配置引用没用, 多个页面引用相同的组件, 这个组件的this是不同的,不必担心监听事件的问题

---

### 预加载的另一个小方案（适合长期不变的数据）
那就是 stroage

    a.js
    Page({
        data: {
            name: wx.getStorageSync('name')
        }
    });

为什么说时候长期不变的数据呢, 回归小程序加载的特性, a.data.name的值在 小程序加载的时候 被赋值了, 在切换页面中, 哪怕你更改了 storage.name的值, 初始化的data.name 依然是 加载之初读到的数据, 因此, 适合保存用户头像, 姓名, 到本地, 等下一次 加载小程序的时候, data.name 初始值 自动是 上次的了, onLoad的时候再重新拉一遍 覆盖上去。 
说他适合长期不变，主要是 你要是请求太慢的话，先显示老的数据，如果你的项目对消息及时性要求高的话。还不如初始是null呢
毕竟默认初始数据 只有小程序 重新加载后才生效

### wxpage的preload原理(wepy也一样)

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




## wxpage解析(未完)

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