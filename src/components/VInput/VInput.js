Component({
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
                console.log('值', value);
            }
        }
    },
    data: {

    },
    methods: {
        bindinput({detail}) {
            this.words = detail.value.trim();
            this.triggerEvent('change', this.words);
        },
        bindblur({detail}) {
            this.words = detail.value.trim();
            this.triggerEvent('change', this.words);
        },
        bindconfirm({detail}) {
            this.words = detail.value.trim();
            this.triggerEvent('change', this.words);
            this.triggerEvent('submit', this.words);
        }
    }
})
