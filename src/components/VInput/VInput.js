Component.C({
    properties: {
        placeholder: {
            type: String,
            value: '搜索'
        },
        focus: {
            type: Boolean,
            value: false
        },
        words: {
            type: String,
            observer: (value) => {
                console.log('改变值', value);
            }
        }
    },
    data: {

    },
    methods: {
        init(obj) {
            if(obj.words) {
                this.setData({
                    words: this.words
                });
            }
        },
        bindinput({detail}) {
            let msg = detail.value.trim();
            if(msg != this.properties.words) {
                this.triggerEvent('change', msg);
            }
            this.properties.words = msg;
        },
        bindblur({detail}) {
            let msg = detail.value.trim();
            if(msg != this.properties.words) {
                this.triggerEvent('change', msg);
            }
            this.properties.words = msg;
        },
        bindconfirm({detail}) {
            this.properties.words = detail.value.trim();
            this.triggerEvent('submit', this.properties.words);
        }
    }
})
