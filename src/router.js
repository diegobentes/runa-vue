import Vue from 'vue'
import Router from 'vue-router'

import Notepad from '@/components/Notepad'
import NoContent from '@/components/NoContent'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [{
    path: '/',
    component: NoContent
  },
  {
    path: '/notes',
    component: Notepad,
    props: true
  }]
  // routes: [
  //   {
      
  //   }
  // ]
})
