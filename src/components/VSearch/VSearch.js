Component({
    
    data: {
        words: ''
    },
    created: function() {
        
    },
    methods: {
        setValue({detail}) {
            this.data.words = detail;
        },
        submit({detail}) {
            console.log(detail);
        }
    }
})
