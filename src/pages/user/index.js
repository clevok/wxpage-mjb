let event = require('../../core/event');
const {router} = require('../../router');

Page.P(router.pages.user.index, {
    data: {
        tabs: [
            {value: 0, text: '我的场所'}, 
            {value: 1, text: '我的攻略'}, 
            {value: 2, text: '消息'}
        ]
    },
    onAppLaunch: function (opts) {
        console.log('[pages/index]  程序启动：', opts)
    },
    onLoad: function() {
        this.$preload('user?cid=123');
    },
    onReady: function () {

    },
    onPlay: function () {
        event.emit('change');
    },
    redirect () {
        this.$redirect('/pages/user/user')
    },
    route () {
        wx.navigateTo({
            url: '../place/place'
        })
    },
    navigate() {
        this.$navigate('user?cid=abcd')
    },
    onNavigate (taget) {
        console.log('监听页面跳转 onNavigate: taget', taget)
    },
    onShow: function () {
        console.log('[pages/index] 页面展示')
    }
})
