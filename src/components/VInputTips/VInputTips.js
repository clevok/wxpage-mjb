
Component({
    properties: {
        value: {
            type: String,
            value: '',
            observer: (function () {
                return function (newValue) {
                    this._static.value = newValue.trim();
                    if (this.timer) clearTimeout(this.timer);

                    this.timer = setTimeout(() => {
                        if (newValue && !this.data.toFixed) {
                            return this.setData({
                                toFixed: true
                            });
                        }
                        if (!newValue && this.data.toFixed) {
                            return this.setData({
                                toFixed: false
                            });
                        }
                    }, 400);
                };
            })()
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
        },
        sync: {
            type: String
        }
    },
    data: {
        toFixed: false,
        timer: null
    },
    static: {
        value: ''
    },
    created () {
        this._static = {value: ''};
    },
    attached () {
        this._static.value = this.properties.value;
        if (this._static.value) {
            this.bindfocus();
        }
    },
    methods: {
        bindfocus() {
            if (this.data.toFixed || !this._static.value) return;
            this.setData({
                toFixed: true
            });
        },
        toClose() {
            if (this._static.value) {
                return this.bindfocus();
            }
            if (!this._static.value && this.data.toFixed) {
                return this.setData({
                    toFixed: false
                });
            }
        },
        bindinput({detail}) {
            this._static.value = detail.value.trim();
            this.triggerEvent('change', {value: this._static.value, sync: this.properties.sync});
        },
        bindblur({detail}) {
            this._static.value = detail.value.trim();
            this.triggerEvent('change', {value: this._static.value, sync: this.properties.sync});
            this.triggerEvent('submit', {value: this._static.value, sync: this.properties.sync});
            this.toClose();
        },
        bindconfirm({detail}) {
            this._static.value = detail.value.trim();
            this.triggerEvent('change', {value: this._static.value, sync: this.properties.sync});
            this.triggerEvent('submit', {value: this._static.value, sync: this.properties.sync});
            this.toClose();
        }
    }
});
