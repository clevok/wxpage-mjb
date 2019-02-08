const regeneratorRuntime = require("../core/regeneratorRuntime.js")
const searchList = require('../mixins/searchPanel');
const searchPanelList = require('../mixins/searchPanelList');
const { placeTyps } = require('../core/config');
const { router } = require('../router');

Page.P(router.pages.index, {
    data: {
        placeTyps: placeTyps
    },
    mixins: [searchList, searchPanelList],
    onPageLaunch: function () {
    },
    onAppLaunch: function () {
    },
    async onLoad() {
        this.getList();
    },
    async getList() {
        let param = {
            page_index: this.data.page
        };

        let { page_index, page_size, total_count, result } = await this.searchList(wx.$api.place.getList, param)
        this.setData({
            list: this.data.list.concat(result)
        });
        this.afterSearch(page_index, Math.ceil(total_count / page_size), total_count);
    },
    methods: {

    },
    tapPlace() {
    },
    onAwake: function () {
    },
    onReachBottom() {
        this.Reset();
    },
    onPullDownRefresh() {
        this.Refresh();
    }
})
