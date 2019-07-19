const systemInfo = wx.getSystemInfoSync();
const model = ((info)=> {
    let model = info.model.toUpperCase();
    if (model.indexOf('IPHONE') != -1) {
        let str = 'ios';
        if (model.indexOf('X') != -1) {
            str = 'iosX';
        }
        return str;
    }
    return 'android';
})(systemInfo);

Component.C({
    properties: {
        fixed: {
            type: Boolean,
            value: false
        }
    },
    data: {
        model: model
    },
    created: function() {
    },
    attached: function() {
    },
    methods: {

    }
})
