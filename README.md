### 前言
一直在找原生基础上扩展属性的框架, 主要想干净点, 自己容易扩展, 后来找到了 wxpage(腾讯视频出品), 在它基础上对 router 改了一下 [github 地址](https://github.com/clevok/wxpage)

参考大佬的[文章](https://wetest.qq.com/lab/view/294.html?from=content_csdnblog)

## 目录

* [刚入门时,我的错误理解](#刚入门时,我的错误理解)

* [预加载](#预加载)
  - [preload的实现方案](#preload的实现方案)
  - [为什么要将请求保存在一个对象中而不是在onPreLoad直接更改data内容](#为什么要将请求保存在一个对象中而不是在onPreLoad直接更改data内容)
  - [预加载的研究性的方案:废弃](#预加载的研究性的方案)
  - [预加载的另一个小方案:适合长期不变的数据](#预加载的另一个小方案适合长期不变的数据)
  - [wxpage的preload原理同wepy](#wxpage的preload原理同wepy)

* [跨页面通讯方案](#跨页面通讯方案)
  - [全局状态管理](#全局状态管理)
  - [事件发布订阅](#事件发布订阅)
  - [onShow配合其他数据](#onShow配合其他数据)
  - [hack模式:不推荐](#hack模式)


* [页面的设计模式](#页面的设计模式)
    - [自定义组件模式](#自定义组件模式)
    - [import模式](#import模式)


* [视图层显示优化](#视图层显示优化)
  - [按钮加载成功后显示](#按钮加载成功后显示)

* [wxpage解析未完](#wxpage解析未完)


------------

## 刚入门时, 我的错误理解
小程序加载类似于 单页面, 主包的内容在加载小程序的时候, 相关页面都直接加载(所有的Page,Component(不管有没有引用都会加载)),其他的js,除非被引入,才会加载

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

一开始我以为 从A页面 加载B页面的时候， B.js会整个 重新加载

    // B.js 初始化
    // B.onLoad

事实上, 每次跳到B页面, 仅仅 B页面Page对象会进行`深拷贝`, 进入 页面的生命周期, js文件不会重复引用


且主包的所有的内容在一开始就会加载, 就像 vue webpack加载方式, 而分包的内容就像 webpack配置单独的模块, 只有加载到该模块后才会加载该模块下的所有的内容

    // App 加载的时候， 所有的js 都会记载

    // A.js 初始化
    // B.js 初始化
    // 等等其他的页面

    // 然后加载首页A页面, 进入A页面的生命周期， 触发钩子 onLoad方法
    // A.onLoad

> 不知道咋形容, 其实就是单页面的加载方式, 每次仅仅切换 Page({}) 对象而已.
*还有就是, 你可以写个js, 存储一个对象, 这个对象的数据, 一个A页面改动了, B页面读取的也是改动之后的* 

> 在小程序启动时，会把所有调用Page()方法的object存在一个队列里（如下图）。每次页面访问的时候，微信会重新创建一个新的对象实例（实际上就是深拷贝）。

[](https://f.wetest.qq.com/gqop/10000/20000/LabImage_77ebebbdda7eb0340c5f1939ba93c1e1.png)


------------


## 预加载

预加载 的 实现方案 就是在小程序页面加载机制上 ，A页面通过事件监听的等方式, 先调用 对应页面B 的 原型（即将要被深拷贝的页面对象） 的特殊的方法。来达到 分离业务逻辑，提前请求的目的

### preload的实现方案

其实就是给每一个Page页面注册了个事件, 在调用跳转方法`this.$router`的时候, emit了个方法,唤起对应 响应页面 并 执行对象的方法比如 `onPreLoad` , 比如, 提起请求, 将请求保存在一个 对象中, 在那个页面加载onLoad后, 再从对象中取出这个请求, 做处理


### 为什么要将请求保存在一个对象中而不是在onPreLoad直接更改data内容
为什么要将请求保存在一个对象中,onLoad后再取出,而不是在onPreLoad直接更改data内容

这是小程序一个特殊点
小程序主包所有的页面都加载, 在进入一个页面的时候, 会 `深拷贝` 对应页面的Page内的对象, 并扩展一些属性, 存入 [页面栈中](https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/route.html) getCurrentPages(我猜的)


因为 请求是 需要时间的, 你在A页面调用了B页面的 `onPreLoad`, 这个方法，更改 `this.data.name`, 但是, 如果 该页面已经深拷贝了, 请求还没回来, 后来 更改 `this.data.name` 实际更改了 `js文件` 内的data, 深拷贝后的 `this`, 不是原先那个, 两个`this`没有关系, 毕竟, 拷贝后的 `page对象` 没有执行`onPreLoad`方法


### 预加载的研究性的方案

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

**`只有在`2.4.0及以下`的版本上面的方法能起作用，但是不要用这个了，了解下就好, 新版本不支持`**

--- 

组件的加载：不管用不用，都先加载, 组件的生命周期, 且只有在页面中wxml中引用才会触发, 仅仅json中配置引用没用, 多个页面引用相同的组件, 这个组件的this是不同的,不必担心监听事件的问题

---

### 预加载的另一个小方案适合长期不变的数据
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

### wxpage的preload原理同wepy

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

### setData不影响对象深拷贝特性

        let a = {name: 2};
        this.setData({
            redis: a,
            [`redis2[0]`]: a
        });
        console.log(this.data.redis);
        console.log(this.data.redis2);
        a.name = 7;
        console.log(this.data.redis);
        console.log(this.data.redis2);
        this.setData({
            [`redis.name`]: 9
        })
        console.log(this.data.redis);
        console.log(this.data.redis2);

------------

## 跨页面通讯方案
我们经常会碰到 比如在用户中心页面跳转到设置中心页面, 设置后 要求 用户中心页面 数据 也能跟着一起改变
(参考)[https://segmentfault.com/a/1190000008895441#articleHeader6];

 1. 全局状态管理
 2. 事件发布订阅
 3. onShow/onHide + localStorage 或 globalData 或 单独写个js存储对象
 4. hack模式(不建议)

### 全局状态管理
其实就是类似 vuex, redux, mobx, 好的方案我还在看

### 事件发布订阅
原理：我比较喜欢的方案, 就是事件发布订阅, 建议大家自己写一个, 通过this来绑定, 页面销毁的时候再移除掉
[event.js](https://github.com/clevok/wxpage-mjb/blob/master/src/core/event.js)

使用场景：后面的页面 对前面的页面做修改
缺点：要非常注意重复绑定的问题, 页面加载得注意移除, 目前我有用这个

### onShow配合其他数据
原理：这种就是 onShow/onHide的时候读取本地存储, 或者 app.globalData 或者 保存在 其他js中的数据, 显示出来

使用场景：用在在一些跳转到页面后 再执行
优点：实现简单，容易理解
缺点：如果完成通信后，没有即时清除通信数据，可能会出现问题。另外因为依赖localStorage，而localStorage可能出现读写失败，从面造成通信失败
注意点：页面初始化时也会触发onShow

### hack模式
这个不建议使用, 比较容易出现， 不知道这个页面在哪里被改的情况
原理： 就是把每个页面的this维护起来, *(其实也可以通过 `getCurrentPages()`)* 可以直接访问到这个页面的方法，属性等，直接更改

优点：一针见血，功能强大，可以向要通信页面做你想做的任何事。无需要绑定，订阅，所以也就不存在重复的情况
缺点：有风险，谁知道会不会突然无效了呢，且页面业务逻辑大了，不知道在哪里做的更改影响到了

---

## 组件
关于组件我有新发现了,组件由3部分组成, `component.js`,`component.wxml`,`component.wxss` 其中 `component.js`只会初始化一次，就是在页面加载的时候 (加载app的时候就初始化,而不是进入到页面), 对了,这里有所有的组件公用一个属性的风险

### 公用一个属性的风险
我们常常用闭包来实现一些特效, 比如函数防抖

```js
function debounce(callback, time) {
    let timer = null;
    return function () {
        if (timer) clearTimeout(timer);
        timer = setTimeout(function() {
            callback();
        }, time);
    };
}

Component({
    properties: {
        value: {
            type: String,
            value: '',
            observer: debounce(function(){
                // do something
            }, 200)
        }
    }
})
```
比如实现一个输入框 箭头输入, 200不变后才返回结果，！！！！但是, 这个有问题, `就是多个组件同时存在的情况下`
一般你可以以为,一个组件的时候,会初始化一次, 两个组件的存在的时候,他会初始化二次,实际上呢！
他只会初始化一次,且是在app加载的时候初始化(这个不能忘)

这样会照成什么样的结果呢,
一个页面的两个组件的value一起变化,实际上他们是公用一个 `timer` 的！！！, 又因为节流会导致只响应最后一次刚刚的那个组件

#### 解决方案
把timeer放到 `this.data` 下, 不要被公用掉, 通过this来区分唯一

```js
observer: (function () {
    return function (newvalue, oldvalue) {
        if (this.timer) clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                // do something
            }
        }, 400);
    };
})()
```

------------

## 页面的设计模式
设计页面的结构有很多种, 小程序页面类似于vue,可以参考vue开发模式,小程序也有自己特殊的组件, import模式


### 自定义组件模式
此模式 与 vue 相似, 可以自定义组件内做自己的事情, 数据改变通知外部方式, 不应该主动调用外部方法
就是页面可以拆分成多块, 把按钮,选择器之类的基本 组件拆分, 当然, 也可以把页面作为组件(该组件可以直接作为页面,也可以作为组件)

参考 (使用 Component 构造器构造页面)[https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/component.html]


### import模式
这个模式有点意思, 利用 小程序模板(template)[https://developers.weixin.qq.com/miniprogram/dev/reference/wxml/template.html]和mixins(需自己实现)来混合实现
这个方式有点意思, 在形式上实现了页面拆分, 数据又统一, 并不是自定义组件通过通知改变上层数据, 而是在分层中直接改变数据
也就是,所有的业务逻辑都集合在了主页面上, 但是开发体验上却又是分散在不同的层, 
对了, 模板也能够点击事件, 触发的点击事情是在引用的那个主页面上

```js

// index.wxml
<template>
    <include src="./action.wxml"></include>
    
    // 也可以采用 include 方式
    <import src="./action.wxml"></import>
    <template is="action" data="{{}}"></template>

    <view>主页面</view>
</template>

// action.wxml
模板action.wxml里的点击事件, 实际上会触发引入改页面的的js事件

<script>

    // 引用action的页面组件
    import action from 'action.js'

    Page({
        mixins: [action]
    });
</script>

```

------------

## 视图层显示优化
### 按钮加载成功后显示
很多时候,我们会有这种需求,那便是一个按钮本来是隐藏的,后来再出现
```js
    <view class="{{isCheckFinshed?'hide':''}}"></view>

    Page({
        data: {
            isCheckFinshed: 'hide'
        }
    })
``` 
以上实际出现的效果会是, 实际上一开始view还没有附上 hide, 在稍微卡一点的手机上很明显,
所以, 应该是这样的, 对于这类 {{  }} 不管是wxml文本还是class, 一开始渲染视图的时候,都只是会空的, 在后面某个步骤再渲染出来
在卡一点的手机上很明显

2.
```js
    <view class="fd--column flex-1" wx:if="{{haveSenderAddress}}">
        1
    </view>

    <view wx:else>
        2
    </view>

    Page({
        data: {
            haveSenderAddress: true
        }
    })
```
在比如说一些场景, true显示1, false显示2,
尽管默认 haveSenderAddress 一开始是true, 有的时候也会先显示2, 尤其在卡一点的手机上

**`猜测`** data内的属性在第一次加载的时候，对于视图层，相当于null

**`实践`** 所以我们用了两个属性, 来区分, 在卡一点的安卓手机上,成功实验出来

```js
    <view class="fd--column flex-1" wx:if="{{!isEmpty}}">
        1
    </view>

    <view wx:else>
        2
    </view>
    Page({
        data: {
            isEmpty: false
        }
    })

```
基本不会出现2的情况了
结论： 猜测, 默认视图层的变量都是空

---

在查看[`生命周期`](https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/page-life-cycle.html)的时候
![生命周期](https://res.wx.qq.com/wxdoc/dist/assets/img/page-lifecycle.2e646c86.png)

在视图层(`view thread`)初始化`inited`完成后会通知给 `appservice thread`,然后`appservice thread`开始第一次的`send initial data`

`view thread`初始化的时候, 没有变量？
发现生命周期上写着, 是在 onLoad, onShow之后才发送初始数据!!!!
也就是说, 如果我在onLoad中这样写, 和 直接配置data默认值 其实是差不多的???
我们再来尝试一下
暂时想不到其他好的对比方式
只能想的就是 haveSenderAddress: false, onLoad的时候设置true, 看看对比直接设置默认true
```js
    <view wx:if="{{haveConsigneeAddress}}"></view>

    data = {
        haveConsigneeAddress: false
    }

    onLoad () {
        this.$wxpage.setData({
            haveConsigneeAddress: true
        })
    }

```

结论 发现似乎, emmm onLoad配置的似乎出现次数多一点

不行, 我们去WAService中打断点看看

```js
     // 大约在 65271行
    // 注解, 到这一步骤, 没想到, 试图层已经出来了, 而且是默认的配置对象, 也就是说, 并不是我刚刚理解的那样
    // 第一次渲染 是在 onLoad和onShow之前的, 
    Mt(Qe, n, bt.newPageTime, void 0, !1),
    
    R() && (__wxAppData[e] = l.data,
        
    __wxAppData[e].__webviewId__ = n,
    __appServiceSDK__.publishUpdateAppData());
    var _ = __appServiceSDK__._getOpenerEventChannel();
    _ && (Qe.eventChannel = _),
    debugger
    l.__callPageLifeTime__("onLoad", r), // 注解 响应 onLoad
    l.__callPageLifeTime__("onShow"), // 注解 响应 onShow

```
> 也就是说视图层在第一次渲染（`send initial data`）读取了data内的数据, 而后再调用onLoad和onShow
所以onLoad赋值和data默认的值是有先后顺序区别的

（此次是猜测）猜测 在 `send initial data` 完成之前, 视图层已经有了, 但是里面的数据都是null, 那个时候只能按都是null的结果来显示, 部分安卓手机比较慢, 放大了中间 (试图层出现 到 `send initial data`结束这一过程 ).

那么最好的处理方式是,试图层默认变量是false去处理


------------


## wxpage解析未完

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