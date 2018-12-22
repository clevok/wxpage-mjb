/**
 * 搜索相关 例如 page, pageSize
 */

module.exports = {
    data: {
        page: 1,
        pageSize: 10,
        total: 0,

        loadStatus: {
            isLoading: false,
            isEnd: false,
            isError: false,
            isEmpty: false
        }
    },
    // 因为改状态是页面唯一，但是全局调用，为了预防还在加载中跳转页面导致动销一直在
    onShow() {
        if(!this.data.loadStatus.isLoading) {
            wx.stopPullDownRefresh();
            wx.hideNavigationBarLoading();
        }
    },
    // methods: {
        /**
         * 封装请求过程
         * @param {*} api 请求对象函数
         * @param {*} param 请求参数
         * @param {*} options 请求额外参数
         * @param {*} options.dropRequest 是否开启抛弃过期请求
         * 
         */
        searchList(api, param={}, options={}) {
            if(typeof api !== 'function') {
                console.warn('请传入请求对象');
                return;
            }
            this.beginSearch();

            return new Promise( (resolve, rejected) => {
                api(param, options).then(res=> {

                    wx.stopPullDownRefresh();
                    wx.hideNavigationBarLoading();
                    resolve(res);
                }).catch(res=> {
                    this.errorSearch();
                    
                    wx.stopPullDownRefresh();
                    wx.hideNavigationBarLoading();
                    rejected(res);
                })
            });
        },

        /**
         * 请求前
         */
        beginSearch() {
            wx.showNavigationBarLoading();
            this.setPageStatus(true, false, false, false);
        },

        /**
         * 请求后
         * @param {Number} page 当前页数
         * @param {Number} pages 总页数
         * @param {Number} total 总数
         */
        afterSearch(page, pages, total) {

            if(typeof page =='undefined' || typeof pages =='undefined' || 
                typeof total =='undefined') {
                console.error('请求列表参数不全 searchPanel.js')
                return;
            }

            if(this.data.page != page) {
                this.data.page = page;
            }
            if(this.data.total != total) {
                this.data.total = total;
            }
            if(page >= pages && total!= 0) {
                this.data.loadStatus.isEnd = true;
            }
            if(total == 0 && page == 1) {
                this.data.loadStatus.isEmpty = true;
            }
            this.data.page += 1;
            this.data.loadStatus.isLoading = false;

            this.setData({
                loadStatus: this.data.loadStatus,
                page: this.data.page,
                total: this.data.total
            });
        },

        /**
         * 请求失败
         */
        errorSearch() {
            this.setPageStatus(false, false, true, false);
        },

        /**
         * 数据刷新 中间控制器 (重置数据+状态，用于下拉刷新)
         * @param {Boolean} isForce 是否强制刷新 忽略loading
         */
        searchRefresh(isForce=false) {
            return new Promise( ( res, rej) => {
                if(this.data.loadStatus.isLoading&&!isForce) {
                    return rej(false);
                };

                this.data.page = 1;
                this.setPageStatus(true, false, false, false, {
                    page: this.data.page
                });
                return res(true);
            })
        },

        /**
         * 数据继加载 中间控制器 (重置状态，用于上拉加载)
         */
        searchReset() {
            return new Promise( ( res, rej) => {
                if(this.data.loadStatus.isLoading || 
                        this.data.loadStatus.isEnd || 
                        this.data.loadStatus.isEmpty) {
                    return rej(false);
                };
                this.setPageStatus(true, false, false, false);
                
                return res(true);
            })
        },

        /**
         * 设置加载状态
         * @param {Boolean} isLoading
         * @param {Boolean} isEnd
         * @param {Boolean} isError
         * @param {Boolean} isEmpty
         * @param {object} obj 额外扩展
         * 
         */
        setPageStatus (isLoading=false, isEnd=null, isError=null, isEmpty=null, obj=null) {
            let loadStatus = this.data.loadStatus;
            loadStatus.isLoading = isLoading;
            if(isEnd !== null) {
                loadStatus.isEnd = isEnd;
            }
            if(isError !== null) {
                loadStatus.isError = isError;
            }
            if(isEmpty !== null) {
                loadStatus.isEmpty = isEmpty;
            }

            let _obj = {
                loadStatus: loadStatus
            };
            if(obj) {
                _obj = Object.assign(_obj, obj);
            }
            this.setData(_obj);
        }
    // }
}


