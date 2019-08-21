export default {
    methods: {
        '@valueChange' ({detail}) {
            if (!detail || !detail.sync) return;
            this[detail.sync] = detail.value;
        }
    }
};
