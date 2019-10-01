<template>
  <div id="main">
    <div id="wrapper" @wheel="changeSize">
      <router-view/>
      <div :style="`width: ${size}%;`" class="svg" ref="svg"></div>
    </div>
    <div id="info">
      <ul id="hardwareInfo">
        <li> Serial number: {{ serial }} </li>
        <li> Model: {{ model }} </li>
        <li> Version: {{ version }} </li>
        <div class="row">
          <label> Size </label>
          <input type="range"
                 min="10"
                 max="maxSize"
                 v-model="size"
                 @dblclick="size = 100"/>
        </div>
        <form @submit.prevent='sendCommand' class="row">
          <input placeholder="Command" type="text" v-model="rawCommand"/>
          <input value="Send" type="button"/>
        </form>
      </ul>
      <console ref="console"/>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import generateSVG from '../../lib/svgGenerator'
import Console from './Console'

const maxSize = 300;

export default {
  name: 'landing-page',
  components: { Console },
  data() { return {
    hwc: [],
    typeIndex:[],
    serial: '',
    model: '',
    version: '',
    size: 100,
    rawCommand: '',
  }},
  mounted() {
    ipcRenderer.on('list', (event, data) => {
      this.$refs.svg.innerHTML = data.value
    })
    ipcRenderer.on('_panelTopology_svgbase', (event, data) => {
      this.$refs.svg.innerHTML = data.value
    })
    ipcRenderer.on('_panelTopology_HWC', (event, data) => {
      const json = JSON.parse(data.value)
      this.hwc = json.HWc
      this.typeIndex = json.typeIndex
      this.generateSVG()
    })
    ipcRenderer.on('_serial', (event, data) => {
      this.serial = data.value
    })
    ipcRenderer.on('map', (event, data) => {
    })
    ipcRenderer.on('_model', (event, data) => {
      this.model = data.value
    })
    ipcRenderer.on('_version', (event, data) => {
      this.version = data.value
    })
    ipcRenderer.on('HWC', (event, data) => {
      let val = data.value
      let line = `Component ${val.id}\tsent value ${val.value}`
      if (val.direction) {
        line += `\tfrom the ${val.direction}`
      }
      line += `\t[\t${data.raw}`.padEnd(24) + `]`
      this.$refs.console.append(line)
      const i = +data.id - 1
      let elem = document.getElementById(`hwc${i}`)
      if (data.value === 'Down') elem.classList.add('selected')
      else if (data.value === 'Up') elem.classList.remove('selected')
      else if (data.value === 'Speed:0') elem.setAttribute('fill', '#dddddd')
      else if (data.value.match(/^Speed:*/)) {
        const val = parseInt(data.value.substring(6))
        let color = 'lightgreen'
        if (val < 0) color = 'lightcoral'
        elem.setAttribute('fill', color)
      }
      else if (data.value.match(/^Abs:*/)) { 
        elem.classList.add('selected')
        setTimeout(() => elem.classList.remove('selected'), 500)
      }
      else if (data.value.match(/Enc/)) {
        const val = parseInt(data.value.substring(4))
        let color = 'lightgreen'
        if (val === -1) color = 'lightcoral'
        elem.setAttribute('fill', color)
        setTimeout(() => elem.setAttribute('fill', '#dddddd'), 500)
      }
    })
    this.requestPanelInformation()
    this.requestPanelTopology()
  },
  methods: {
    requestPanelTopology() {
      ipcRenderer.send('request', { command: '\nPanelTopology?' })
    },
    requestPanelInformation() {
      ipcRenderer.send('request', { command:'list' })
    },
    generateSVG() {
      generateSVG(this.hwc, this)
    },
    show(index) {
     this.$router.push(`hardware-modal/${index}/`)
    },
    clear() {
      ipcRenderer.send('request', { command: 'Clear'})
    },
    sendCommand() {
      ipcRenderer.send('request', { command: this.rawCommand })
    },
    changeSize(event) {
      this.size -= event.deltaY;
      if (this.size < 10) this.size = 10;
      else if (this.size > maxSize) this.size = maxSize;
    }
  }
}
</script>

<style >
#wrapper {
  display: flex;
  flex-direction: column;
  width: auto;
  height: 75%;
  text-align: center;
  align-content: center;
  position: relative;
  overflow: auto;
}

#main {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

#info {
  display: grid;
  grid-gap: 10px 10px;
  grid-template-areas:
  "info console console console console console console console";
  height: 25%;
  text-align: center;
  justify-items: center;
}

#hardwareInfo {
  grid-area: info;
  justify-self: left;
  justify-content: left;
}
.svg {
  height: auto;
  position: relative;
  align-self: center;
  border: 10px;
  box-sizing: border-box;
}
li {
  list-style-type: none;
  text-align: justify;
}

.hwcElement {
  cursor:pointer;
}

.hwcElement:hover {
  stroke: red;
  stroke-width: 10px;
}

circle {
  cursor: pointer;
}
text {
  user-select: none;
  cursor: pointer;
  pointer-events: none;
}
.selected {
  fill: yellow;
}
</style>
