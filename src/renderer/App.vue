<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import { ipcRenderer } from  'electron'

export default {
  name: 'raw-panel-controller',
  mounted() {
    for (let key of [
      'map',
      'list',
      '_panelTopology_svgbase',
      '_panelTopology_HWC',
      '_serial',
      '_model',
      '_version',
    ]) {
      ipcRenderer.on(key, (event, data) => {
        this.$store.commit(key, data.value)
      })
    }
    ipcRenderer.on('error/client_connection_refused', (event) =>  {
      console.log('error')
      this.header = 'Connection refused'
      this.$refs.header.classList.remove('hidden')
    });
    ipcRenderer.on('connected', (event, isConnected) =>  {
      setTimeout(() => { 
        if (isConnected && !this.$route.path.match(/landing-page/))
          this.$router.push('/landing-page/')
      }, 1000)
    })
  },
}
</script>

<style>
:root {
  --skaarhoj-blue: #064c9f
}

html, body, #app {
  width: 100%;
  height: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center
}

.header {
  background: var(--skaarhoj-blue);
  color: white;
  font-size: x-large;
}

.row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 10px;
}
</style>

