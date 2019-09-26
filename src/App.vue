<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>Runa </span>
        <span class="font-weight-light">App Notes</span>
      </v-toolbar-title>
    </v-app-bar>

    <v-content>
      <v-row>
        <Folders />
        <router-view></router-view>
      </v-row>
    </v-content>
  </v-app>
</template>

<script>
import Folders from '@/components/Folders';
import Notepad from '@/components/Notepad'

export default {
  name: 'App',
  components: {
    Folders,
    Notepad,
  }
};
</script>