<template>
  <div id="app">
    <landing-page></landing-page>
  </div>
</template>

<script>
  import LandingPage from '@/components/LandingPage'

  export default {
    name: 'raw-panel-controller',
    components: {
      LandingPage
    }
  }
</script>

<style>
html, body, #app {
  width: 100%;
  height: 100%;
  margin: 0;
}

.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}
</style>
