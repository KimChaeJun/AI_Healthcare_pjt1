// src/router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router'
import OverviewView from '../views/OverviewView.vue'
import HypothesisView from '../views/HypothesisView.vue'
import LiveChartsView from '../views/LiveChartsView.vue'
import NotebookImagesView from '../views/NotebookImagesView.vue'
import UpdateView from '../views/UpdateView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: OverviewView },
    { path: '/hypothesis', component: HypothesisView },
    { path: '/live-charts', component: LiveChartsView },
    { path: '/notebook-images', component: NotebookImagesView },
    { path: '/update', component: UpdateView },
  ],
})

export default router