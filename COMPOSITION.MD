## 小程序版Composition

[方案解决大全](https://github.com/clevok/wxpage-mjb);

[具体代码](https://github.com/clevok/miniprogram-hooks);

1. 解决混入问题: 一开始是为了解决mixins带来的问题,如果页面不复杂,那么混入带来的负面影响很小,如果很大的话,那带来的影响就很大了,你常常看到某个方法里调用另一个方法,却找不到在哪,代码也确实提示,当然,自己维护自己的代码还好,一单别人维护起来,那就蛋疼了

2. 解决全局状态管理问题: 目前市场上已经有方案里, 百度 小程序全局状态就有了, 大致实现思路一致

大致实现的思路其实很简单
其实也是面向生命周期编程, 又来了一个 Hooks这样的方法,名字先这样取,他只有js,没有是同

```js
export const hName = new Hooks({

  data: {
    name: 1
  },

  update () {
    this.setData({
      name: 2
    })
  }
});

```

页面或者自定义组件使用的时候,调用这个hooks的$mount方法
```js
import { hName } from './hooks';
const useName = new hName();

Component({

  attached () {
    useName.$mount(this)
  },

  methods: {
    useName.update()
  },

  destory () {
    // 移除绑定
    useName.$unmount(this)
  }
})

```
原理是, $mount会将hook的data属性包裹后塞入自定义组件的, 当调用 useName.update(), 这个页面的data也会变换, 原理是 hook下的this.setData其实是遍历所有绑定的this,让页面或者组件实现 具体的setData方法,于是, 多个页面或者组件绑定一个实例, 就可以实现全局状态了!

