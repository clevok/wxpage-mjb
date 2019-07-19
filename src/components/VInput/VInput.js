Component({
    properties: {
        value: {
            type: String,
            value: '' // 初始化内容
        },
        focus: {
            type: Boolean,
            value: false
        },
        placeholder: {
            type: String,
            value: '搜索'
        },
        type: {
            type: String,
            value: 'text'
        }
    },
    data: {
    },
    _static: {
        value: ''
    },
    created () {
        this._static = {value: ''};
    },
    attached () {
        this._static.value = this.properties.value;
    },
    methods: {
        bindinput({detail}) {
            this._static.value = detail.value.trim();
            this.triggerEvent('change', this._static.value);
        },
        bindblur({detail}) {
            this._static.value = detail.value.trim();
            this.triggerEvent('change', this._static.value);
        },
        bindconfirm({detail}) {
            this._static.value = detail.value.trim();
            this.triggerEvent('submit', this._static.value);
        }
    }
});
