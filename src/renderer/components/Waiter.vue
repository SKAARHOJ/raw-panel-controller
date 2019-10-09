<template>
  <div id="waiter">
    <h3 ref="header" class="hidden"> {{ header }} </h3>
    <form disabled="connecting" @submit.prevent="restart">
      <div class="row">
        <label> Server Mode </label>
        <input class="checkbox" v-model="serverMode" type="checkbox"/>
      </div>
      <div class="row">
        <label> Port </label>
        <input
          class="address"
          type="number"
          autofocus="autofocus"
          v-model="port"
          min="1"
          max="65535"
          >
        </input>
      </div>
      <div class="row">
        <label> IP </label>
        <input class="address" v-model="ip" type="text"/>
      </div>
      <div style="display: flex; direction: rtl">
        <input ref="button" value="Connect" type="submit">
      </div>
    </form>
  </div>
</template>

<script>
import { ipcRenderer } from  'electron'

export default {
  name: 'waiter',
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
    ipcRenderer.on('controller_ip', (event, data) => {
      console.log(data)
      this.ip = data.addresses[0]
      this.port = data.port
    })
    ipcRenderer.send('connected')
    ipcRenderer.on('error/client_connection_refused', (event) =>  {
      console.log('error')
      this.header = 'Connection refused'
      this.$refs.header.classList.remove('hidden')
    });
    ipcRenderer.on('restarted', () => { 
      setTimeout(() => this.restarting = false, 1000)
    })
    ipcRenderer.send('ready')
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

