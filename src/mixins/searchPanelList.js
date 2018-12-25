/**
 * 搜索相关 基于SearchPanel再次封装
 * 包含 列表自动清除
 */

module.exports = {
    data: {
        list: []
    },
    // methods: {
        /**
         * 数据刷新 中间控制器 (重置数据+状态，用于下拉刷新)
         * @param {Boolean} isForce 是否强制刷新 忽略loading
         * @param {Boolean} clear 是否清空数组
         */
        Refresh(isForce=false, clear=true) {
            this.searchRefresh(isForce).then(()=> {
                if(clear) {
                    this.setData({
                        list: []
                    });
                }
                this.getList();
            })
        },
        Reset() {
            this.searchReset().then(()=> {
                this.getList();
            })
        }
    // }
    
}