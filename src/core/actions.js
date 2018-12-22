export const model = {
    select: (content='',  confirmText='确定', title='提示' )=> {
        return new Promise((res, rej)=> {
            wx.showModal({
                title,
                content,
                confirmText,
                showCancel: true,
                confirmColor: '#008489',
                success: (data) => {
                    if (data.confirm) {
                        res();
                    } else {
                        rej();
                    }
                },
                fail: () => {
                    rej();
                }
            });
        });
    },
    error: (content='', title='提示') => {
        return new Promise((res, rej)=> {
            wx.showModal({
                title,
                content,
                showCancel: false,
                confirmColor: '#008489',
                success: (data) => {
                    res();
                },
                fail: () => {
                    rej();
                }
            });
        });
    }
};
exports.model = model;

export const load = {
    show(title='加载中...', mask=true) {
        wx.showLoading({
            title,
            mask
        })
    },
    hide() {
        wx.hideLoading();
    }
}
exports.load = load;

export const toast = {
    success(title='成功', duration=900) {
        wx.showToast({
            title,
            icon: 'success',
            duration
        })
    },
    error(title='失败', duration=700) {
        wx.showToast({
            title,
            icon: 'none',
            duration
        })
    }
}
exports.toast = toast;
