Component.C({
    properties: {
        list: {
            type: [Array, Object],
            value: []
        },
        act: {
            type: [Boolean, String, Number],
            value: ''
        }
    },
    created: function() {
    },
    attached: function() {
    },
    ready: function() {
    },
    methods: {
        setIndex({target}) {
            this.setData({
                act: target.dataset.index
            });
            this.triggerEvent('submit', this.properties.list[target.dataset.index]);
        }
    }
})
