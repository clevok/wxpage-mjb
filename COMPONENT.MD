## 自定义组件的坑

### fixed布局的影响
首页有很多item, 每个item里面又有一个从下而上出来的fixed布局的弹窗组件
体验上会有一点不舒服,就是弹出弹出过程中下面的item会盖住我的弹窗，等弹窗完全谈好了，才能遮盖住

|--------|
|  item  |
|--------|
|  item  |
|--------|
|  item  |
|--------|
|  item  |
|--------|


### 自定义组件 slot 嵌套导致fixed布局变化

例如,有一个pop组件,有个插槽, 这个插槽被限制了高度
那么，被插入该插槽的内容的fixed布局，也只能依据这个插槽来


### props和data
其实在自定义组件内 data === props, 也就是指针指向一个地方
且 在 自定义组件内 setData() `props`的属性也是可以的!!!,
注意了, 要做这样的操作, 需要注意两点
1. 不会更改外部的数据. 如果props是个对象, 只要对象中某一个属性变化了, 对应对象属性全部覆盖, 你组件内部更改的就没有用了
2. 容易误解. 组件 observer 监听的变化会不一致, 如果你内部更改了属性, 以搜索框为例, 你设置value为13, 组件内部私自更改为243, 外部以为你是213,重新设置成 13, 不会触发内部的observer, 也就是 触发 组件内部的 observer, 是组件外部的数据变化 去触发 组件内部的方法
3. 内部直接setData props的属性, 也会触发 props 的observer 方法

### observer 是用来监听某个props的变化的,有一点可能会对你开发照成影响
```js
Components({
    properties: {
        item: Object,
        observer (value) {
            console.log(value) // 第一次为对象, 第二次为 setData触发的值, true

            // 下面的方法会再次触发 observer, value值为true
            // value = true
            this.setData({
                'item.name': true
            });

            // 下面会触发2次 observer, 每次的 value 就是改变的值, 所以要小心
            // value = 45
            // value = food

            this.setData({
                'item.age': 45,
                'item.like': 'food'
            });
        }
    },

})

```
