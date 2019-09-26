<template>
    <v-col>
        <v-card style="height: 100%">
            <v-card-title class="mb-6 display-1">
                Directories
            </v-card-title>
            <v-card-text>
                <v-text-field
                    v-model="searchQuery"
                    @keydown.enter="finder"
                    label="Search in Directory"
                    solo
                    clear-icon="mdi-close-circle-outline"
                ></v-text-field>

                <v-btn depressed small color="primary" @click="addNewFolder = true">
                    <v-icon class="mr-2">mdi-folder-plus</v-icon> Add new Folder
                </v-btn>

                <v-btn 
                    to="/notes" 
                    depressed 
                    small 
                    color="warning" 
                    class="ml-6" 
                    @click="newNote"
                    v-if="showAddNoteButton"
                >
                    <v-icon class="mr-2">mdi-file-document-box-plus-outline</v-icon> 
                    Add new Note
                </v-btn>

                <v-breadcrumbs :items="breadcrumb"></v-breadcrumbs>

                <v-expand-transition>
                    <v-treeview
                        v-show="expand"
                        open-on-click
                        activatable
                        color="black"
                        :items="items"
                        item-key="itemId"
                    >
                        <template v-slot:prepend="{ item, open }">
                            <v-icon>
                                {{ item.icon }}
                            </v-icon>
                        </template>

                        <template v-slot:label="{ item, active }">

                            <div class="float-left full-component-size" @dblclick="doAction(item)" @click="editFolder = false">
                                
                                <div class="float-left mt-1" v-if="editFolder && active">
                                    <input
                                        type="text"
                                        class="input-edit"
                                        v-model="editFolderName"
                                        @keydown.enter="updateFolder(item)"
                                        @click.stop=""
                                    >
                                </div>

                                <div class="float-left mt-1" v-else>
                                    {{ item.name }} 
                                    <template v-if="searchMode">
                                        <span class="location">({{ item.location }})</span>
                                    </template>
                                </div>

                                <div v-show="active" class="float-right" v-if="item.name != '../'">
                                    
                                    <template v-if="editFolder">
                                        <v-btn small color="success" @click.stop="updateFolder(item)">
                                            <v-icon class="mr-2">mdi-folder-plus</v-icon> Save
                                        </v-btn>
                                        <v-btn small color="error" class="ml-6" @click.stop="editFolder = false">
                                            <v-icon class="mr-2">mdi-folder-plus</v-icon> Cancel
                                        </v-btn>
                                    </template>                                    

                                    <template v-else>
                                        <v-btn v-if="item.type === 'folder'" small color="primary" @click.stop="cEditFolder(item)">
                                            <v-icon class="mr-2">mdi-folder-plus</v-icon> Edit
                                        </v-btn>

                                        <v-btn  small color="error" class="ml-6" @click.stop="deleteItem(item)">
                                            <v-icon class="mr-2">mdi-file-document-box-plus-outline</v-icon> Delete
                                        </v-btn>
                                    </template>

                                </div>

                            </div>

                        </template>
                    </v-treeview>
                </v-expand-transition>

                <v-row v-show="addNewFolder">
                    <v-col class="col-1 mt-4 ml-6">
                        <v-icon>
                            {{ icons.folder }}
                        </v-icon>
                    </v-col>
                    <v-col class="col-6">
                        <v-text-field
                            label="New Folder"
                            solo
                            outlined
                            @keydown.enter="includeNewFolder"
                            v-model="newFolderName"
                        ></v-text-field>
                    </v-col>
                    <v-col class="col-4">
                        <v-btn depressed small color="success" class="mt-4" @click="includeNewFolder">Save</v-btn>
                        <v-btn depressed small color="error" class="mt-4 ml-6" @click="addNewFolder = false">Cancel</v-btn>
                    </v-col>
                </v-row>

            </v-card-text>
        </v-card>
    </v-col>
</template>

<script>
import eventBus from '@/eventBus'

export default {
    data() {
        return {
            items: [],
            searchQuery: "",
            searchMode: false,
            expand: true,
            breadcrumb: [],
            addNewFolder: false,
            editFolder: false,
            newFolderName: "",
            editFolderName: "",
            icons: {
                note: 'mdi-file-document-outline',
                folder: 'mdi-folder',
                open: 'mdi-folder-open',
                newFolder: 'mdi-plus-box-outline',
                newFile: 'mdi-file-plus-outline'
            },
        }
    },
    computed: {
        showAddNoteButton() {
            return this.breadcrumb.length > 0
        }
    },
    methods: {
        expandir() {
            this.expand = !this.expand
        },
        addNewItemInArray(items) {
            for(var index in items){
                var callback = null
                if(items[index].type === 'folder'){
                    callback = (i,c) => this.fetchSubDirectories(i, c, false)
                }else if(items[index].type === 'note'){
                    callback = (i) => this.editNote(i)
                }

                this.items.push({
                    id: items[index].id,
                    itemId: items[index].id + items[index].name + items[index].type,
                    previous_id: items[index].previous_id,
                    name: items[index].name,
                    location: items[index].location,
                    icon: this.icons[items[index].type],
                    type: items[index].type,
                    function: callback
                })
            }
        },
        includeNewFolder() {
            let self = this
            let previousFolder = null

            if (self.breadcrumb[self.breadcrumb.length-1] != undefined){
                previousFolder = self.breadcrumb[self.breadcrumb.length-1].id
            }

            self.axios.post('/folders', {
                folder: {
                    name: self.newFolderName,
                    previous_id: previousFolder
                }
            })
            .then(res => {
                self.addNewFolder = false
                self.newFolderName = ""
                self.addNewItemInArray([res.data])
            })
        },
        deleteItem(item) {
            let self = this
            if(item.type == 'folder'){
                if(confirm("Caso haja subpastas/arquivos associdas a pasta elas também serão apagadas. Tem certeza que deseja deletar?")){
                    self.axios.delete(`/folders/${item.id}`)
                    .then(() => {
                        self.items.splice(self.items.indexOf(item, 0), 1)
                    })
                }
            }else if(item.type == 'note'){
                if(confirm("Are you sure?")){
                    self.axios.delete(`/notes/${item.id}`)
                    .then( () => {
                        self.items.splice(self.items.indexOf(item, 0), 1)
                    })
                }
            }
        },
        cEditFolder(item){
            this.editFolderName = item.name
            this.editFolder = true
        },
        updateFolder(item){
            let self = this
            this.axios.put(`/folders/${item.id}`, {
                folder: {
                    name: self.editFolderName
                }
            })
            .then(() => {
                self.items[self.items.indexOf(item, 0)].name = self.editFolderName
                self.editFolder = false
            })
        },
        newNote(){
            eventBus.newNote(this.breadcrumb)
        },
        ///////////////////////////////////
        doAction(item) {
            if (item.type === 'folder' || item.type === 'openFolder') {
                this.expandir()
                this.searchQuery = ""
                this.searchMode = false
                if (this.$route.path == "/notes")
                {
                    this.$router.push({ path: '/' })
                }
                item.function(item, () => {
                    this.expandir()
                })
            }else if(item.type === 'note') {
                item.function(item)
            }
        },
        fetchSubDirectories(item, callback, previous) {
            let self = this
            let sufixUrl = previous ? 'previous_folders' : 'subfolders'

            this.axios.get(`folders/${item.id}/${sufixUrl}`)
                .then(res => {
                    self.items = []

                    if(res.data[0] === undefined || res.data[0].previous_id !== null){
                        self.items.push({
                            id: res.data[0] === undefined ? item.id : res.data[0].previous_id,
                            name: '../',
                            type: 'openFolder',
                            icon: self.icons.open,
                            function: (i,c) => this.fetchSubDirectories(i,c,true)
                        })
                    }

                    if(previous){
                        self.breadcrumb.pop()
                        self.breadcrumb = self.breadcrumb.map((el) => {
                            return {
                                text: el.text,
                                id: res.data[0] === undefined ? item.id : res.data[0].previous_id,
                            }
                        })
                    }else{
                        let locationArr = item.location.split("/")
                        locationArr.shift()
                        self.breadcrumb = locationArr.map((el) => {
                            return {
                                text: el,
                                id: item.id
                            }
                        })
                    }

                    self.addNewItemInArray(res.data)
                    self.fetchNotes(item, previous)
                    callback()
                })
        },
        fetchNotes(item, previous) {
            let self = this
            let sufixUrl = previous ? 'previous_notes' : 'notes'

            self.axios.get(`folders/${item.id}/${sufixUrl}`)
                .then(res => {
                    self.addNewItemInArray(res.data)
                })
        },
        editNote(item){
            this.$router.push({ path: '/notes' })
            this.axios.get(`/notes/${item.id}`)
                .then(res => {
                    eventBus.editNote(res.data)
                })
        },
        ////////////////////////////////////
        finder() {
            let self = this
            
            self.searchMode = self.searchQuery != "" ? true : false
            self.axios.get(`folders/search_folders?search=${self.searchQuery}`)
                .then(res => {
                    self.items = []
                    self.addNewItemInArray(res.data)
                    self.axios.get(`folders/search_notes?search=${self.searchQuery}`)
                        .then(res => {
                            self.addNewItemInArray(res.data)
                        })
                })
        },
    },
    created() {
        let self = this
        
        this.axios.get('folders')
            .then(res => {
                self.addNewItemInArray(res.data)
            })
        
        eventBus.saveNewNoteEvent((note) => {
            self.addNewItemInArray([note])
        })

        eventBus.updateNoteEvent((note) => {
            //self.items[self.items.indexOf(note, 0)].name = note.title
            let filtered = self.items.filter(function(x) { return x.id == note.id && x.type === 'note'; });
            filtered[0].name = note.title
        })
    }
}
</script>

<style>
    .full-component-size {
        width: 100%;
        height: 100%;
    }
    .input-edit {
        border: 1px solid #000;
    }
    .location {
        color: #ccc;
    }
</style>