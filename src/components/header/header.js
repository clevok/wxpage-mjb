const app = getApp();
Component.C({
    properties: {
        fixed: {
            type: Boolean,
            value: false
        }
    },
    data: {
        model: 'android'
    },
    created: function() {
    },
    attached: function() {
        this.setHeight();
    },
    methods: {
        setHeight() {
            
            try {
                let res = app.getSystemInfo();
                let model = res.model.toUpperCase();
                if (model.indexOf('IPHONE') != -1) {
                    let str = 'ios';
                    if (model.indexOf('X') != -1) {
                        str = 'iosX';
                    }
                    this.setData({
                        model: str
                    })
                    return;
                }
                this.setData({
                    model: 'android'
                })
            } catch (e) {
                this.setData({
                    model: 'android'
                })
            }
        }
    }
})
