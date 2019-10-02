<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import { ipcRenderer } from  'electron'

export default {
  name: 'raw-panel-controller',
  data() {
    return {
      connected: false,
      connecting: false,
      port: 9923,
      serverMode: false,
      ip: '0.0.0.0',
      header: 'Waiting for connection...'
    }
  },
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
    ipcRenderer.send('connected')
    ipcRenderer.on('error/client_connection_refused', (event) =>  {
      console.log('error')
      this.header = 'Connection refused'
      this.$refs.header.classList.remove('hidden')
    });
    ipcRenderer.on('connected', (event, isConnected) =>  {
      setTimeout(() => { 
        if (isConnected && !this.$route.path.match(/\/landing-page\//))
          this.$router.push('/landing-page/')
        }, 1000)
    })
        ipcRenderer.on('restarted', () => { 
          setTimeout(() => this.restarting = false, 1000)
        })
  },
  methods: {
    restart() {
      this.restarting = true
      this.$refs.header.classList.remove('hidden')
      this.header = 'Waiting for connection...'
      ipcRenderer.send('restart', {
        port: this.port,
        ip: this.ip,
        serverMode: this.serverMode
      })
    },
    changeIP(event, data) {
      this.ip = this.defaultIP()
    },
    defaultIP() { return this.serverMode ? '0.0.0.0' : '192.168.10.99' }
  }
}
</script>

<style scoped>
.visible {
  visibility: visible;
}
.hidden {
  visibility: hidden;
}
#waiter {
  display: flex;
  flex-direction: column;
  max-width: 400px;
  background: #064c9f;
  padding: 20px;
  border-radius: 5px;
  text-align: left;
  color: white;
}

.address {
  width: 60%;
  text-align: center;
}
.checkbox {
  margin: 0%;
}
</style>

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

