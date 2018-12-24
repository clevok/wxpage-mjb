
const searchList = require('../mixins/searchPanel');
const searchPanelList = require('../mixins/searchPanelList');
const {placeTyps} = require('../core/config');

Page.P('index', Page.P.mixins(searchList, searchPanelList , {
	data: {
		placeTyps: placeTyps,
		lname: null
	},
	onPageLaunch: function () {
		console.log('[pages/index] 页面启动：')
	},
	onAppLaunch: function (opts) {
		console.log('[pages/index]  程序启动：')
	},
	onLoad: function() {
console.log(wx.getStorageSync('pname'));
        
        wx.login({
            success:(res) => {
                console.log(res);
            }
        })
        this.getList();
    },
    getList() {
        let param = {
            page_index: this.data.page
        };

        this.searchList(wx.$api.place.getList, param)
        .then(({page_index, page_size, total_count, result})=> {
            this.setData({
                list: this.data.list.concat(result)
            });
            this.afterSearch(page_index, Math.ceil(total_count/page_size), total_count);
        });
    },
    methods: {

    },
    tapPlace() {
        console.log('555')
        this.$route('place/place?cid=123')
        this.$preload('place?cid=456')
        // this.$preload('place/place?vid=xxx&cid=xxx');
    },
	onAwake: function (t) {
    },
    onReachBottom() {
        this.Reset();
    },
    onPullDownRefresh() {
        this.Refresh();
    }
}))
