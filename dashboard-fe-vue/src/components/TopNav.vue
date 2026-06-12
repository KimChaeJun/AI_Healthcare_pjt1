<!-- src/components/TopNav.vue -->
<template>
  <nav class="topnav">
    <button :class="{ active: route.path === '/' }" @click="go('/')">Overview</button>
    <button :class="{ active: route.path === '/hypothesis' }" @click="go('/hypothesis')">Hypothesis</button>
    <button :class="{ active: route.path === '/live-charts' }" @click="go('/live-charts')">Live Charts</button>
    <button :class="{ active: route.path === '/notebook-images' }" @click="go('/notebook-images')">Notebook Images</button>
    <button :class="{ active: route.path === '/update' }" @click="go('/update')">Update</button>
  </nav>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

function go(path: string): void {
  router.push(path)
}
</script>