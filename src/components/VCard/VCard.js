Component.C({
    options: {
        multipleSlots: true
    },
    properties: {
        src: {
            type: String,
            value: ''
        },
        num: {
            type: Number,
            value: null
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
            this.triggerEvent('tap', this.properties.list[target.dataset.id]);
        }
    }
})
