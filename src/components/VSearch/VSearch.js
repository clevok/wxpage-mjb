Component.C({
    
    data: {
    },
    attached: function() {
    },
    methods: {
        // 组件 统一定义方法， 用于
        init(obj) {
            if(obj.words) {
                this.$refs.VInput.setData({
                    words: obj.words
                });
            }
        },
        clear() {
            console.log('点击');
            this.$refs.VInput.setData({
                words: ''
            });
        },
        demo(e) {
            console.log(e);
        },
        submit({detail}) {
            this.triggerEvent('submit', detail);
        }

    }
})
