exports.getSystemInfo = function() {
    if(this.globalData.getSystemInfo) {
        return this.globalData.getSystemInfo;
    }

    wx.getSystemInfo({
        success: (res)=> {
            this.globalData.getSystemInfo = res;
            return res;
        }
    });
}