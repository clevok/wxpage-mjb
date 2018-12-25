Component.C({
    options: {
        multipleSlots: true
    },
    properties: {
        src: {
            type: String,
            value: ''
        },
        title: {
            type: String,
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
            this.triggerEvent('tap', this.properties.list[target.dataset.id]);
        }
    }
})
