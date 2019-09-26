import Vue from 'vue'
export default new Vue({
    methods: {
        newNote(directory) {
            this.$emit('addNewNote', directory)
        },
        addNewNoteEvent(callback) {
            this.$on('addNewNote', callback)
        },
        saveNote(note) {
            this.$emit('saveNewNote', note)
        },
        saveNewNoteEvent(callback) {
            this.$on('saveNewNote', callback)
        },
        editNote(note) {
            this.$emit('editANote', note)
        },
        editNoteEvent(callback){
            this.$on('editANote', callback)
        },
        updateNote(note){
            this.$emit('updateANote', note)
        },
        updateNoteEvent(callback){
            this.$on('updateANote', callback)
        }
    }
})