<template>
  <div id="app">
    <landing-page v-if="connected"></landing-page>
    <div v-else id="waiter">
      <h3 v-if="!restarting"> Waiting for connection </h3>
      <h3 v-else> Restarting Server </h3>
        <form class="row" @submit.prevent="restartServer">
        <label> Server Port </label>
        <input id="port" autofocus="autofocus" v-model="port"></input>
        <input ref="button" value="Restart Server" type="button">
        </form>
    </div>
  </div>
</template>

<script>
  import LandingPage from '@/components/LandingPage'
  import { ipcRenderer } from  'electron'

  export default {
    name: 'raw-panel-controller',
    components: {
      LandingPage
    },
    data() {
      return {
        connected: false,
        restarting: false,
        port: 9924
      }
    },
    mounted() {
      ipcRenderer.send('connected')
      ipcRenderer.on('connected', (event, isConnected) => this.connected = isConnected )
      ipcRenderer.on('restarted', () => { 
        setTimeout(() => this.restarting = false, 1000)
      })
    },
    methods: {
      restartServer() {
        this.restarting = true
        ipcRenderer.send('restart', { port: this.port })
      },
    }
  }
</script>

<style>
html, body, #app {
  width: 100%;
  height: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center
}

.row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 10px;
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

#port {
  margin-right: 10px;
  margin-left: 10px;
}
</style>
