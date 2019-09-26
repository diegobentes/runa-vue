<template>
    <v-col>
        <v-card style="height: 100%">
            <v-card-title >
                <v-row>
                    <v-col>
                        <span class="display-1 mb-6">Note</span>
                    </v-col>
                    <v-col>
                        <span class="subtitle-1 location" v-if="breadcrumb != ''">In: ( {{ breadcrumb }} )</span>
                    </v-col>
                </v-row>
            </v-card-title>
            <v-card-text>
                <v-text-field
                    label="Title"
                    solo
                    v-model="title"
                ></v-text-field>
                <v-textarea
                    solo
                    label="What would you like to write down?"
                    v-model="description"
                ></v-textarea>
            </v-card-text>
            <v-card-actions class="ml-2">
                <v-btn v-if="noteId === null" outlined @click="saveNote">Save Note</v-btn>
                <v-btn v-else outlined @click="updateNote">Edit Note</v-btn>
            </v-card-actions>
        </v-card>
    </v-col>
</template>

<script>
import eventBus from '@/eventBus'

export default {
    data() {
        return {
            folderId: null,
            noteId: null,
            breadcrumb: "/",
            title: "",
            description: ""
        }
    },
    methods: {
        saveNote() {
            this.axios.post('/notes', {
                note: {
                    title: this.title,
                    description: this.description,
                    folder_id: this.folderId
                }
            }).
            then(res => {
                eventBus.saveNote(res.data)
                this.title = ""
                this.description = ""
                this.folderId = null
                this.noteId = null
                this.$router.push({ path: '/' })
            })
        },
        updateNote() {
            this.axios.put(`/notes/${this.noteId}`, {
                note: {
                    title: this.title,
                    description: this.description
                }
            }).
            then(res => {
                eventBus.updateNote(res.data)
                this.title = ""
                this.description = ""
                this.folderId = null
                this.noteId = null
                this.$router.push({ path: '/' })
            })
        }
    },
    created() {
        eventBus.addNewNoteEvent((directory) => {
            if (directory[0] !== undefined) {
                this.folderId = directory[0].id
                this.breadcrumb = directory.map(el => el.text).join(" / ")
            }
        })

        eventBus.editNoteEvent((note) => {
            this.title = note.title
            this.description = note.description
            this.folderId = note.folder_id
            this.noteId = note.id
        })
    },
    destroyed() {
        this.folderId = null
    }
}
</script>