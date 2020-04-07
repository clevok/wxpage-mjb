

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
