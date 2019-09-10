<template>
  <div id="main">
    <div id="wrapper">
    <v-dialog/>
    <div class="svg" ref="svg"></div>
  </div>
  <div>
    <ul>
    <li> Serial number: {{ serial }} </li>
    <li> Model: {{ model }} </li>
    <li> Version: {{ version }} </li>
    </ul>
  </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import generateSVG from './old_svg'
import addHardwareComponent from './hardwareComponent'

  export default {
    name: 'landing-page',
    components: {},
    data() { return {
      hwc: [],
      typeIndex:[],
      serial: '',
      model: '',
      version: ''
    }},
    mounted() {
      ipcRenderer.on('_panelTopology_svgbase', (event, data) => {
        this.$refs.svg.innerHTML = data
      })
      ipcRenderer.on('_panelTopology_HWC', (event, data) => {
        const json = JSON.parse(data)
        console.log(json)
        this.hwc = json.HWc
        this.typeIndex = json.typeIndex
        this.generateSVG()
      })
      ipcRenderer.on('_serial', (event, data) => {
        this.serial = data
      })
      ipcRenderer.on('_model', (event, data) => {
        this.model = data
      })
      ipcRenderer.on('_version', (event, data) => {
        this.version = data
      })
      ipcRenderer.on('HWC', (event, data) => {
        console.log(data)
      })
      this.requestPanelInformation()
      this.requestPanelTopology()
    },
    methods: {
      requestPanelTopology() {
        ipcRenderer.send('request', '\nPanelTopology?\n')
      },
      requestPanelInformation() {
        ipcRenderer.send('request', 'list\n')
      },
      generateSVG() {
        generateSVG(this.hwc, this)
      },
      show(hwc) {
        this.$modal.show('dialog', {
          title: `Alert! ${hwc}`,
          text: 'You are too awesome',
          buttons: [
            {
              title: 'Deal with it',
              handler: () => { alert('Woot!') }
            },
            {
              title: '',       // Button title
              default: true,    // Will be triggered by default if 'Enter' pressed.
              handler: () => {} // Button click handler
            },
            {
              title: 'Close'
            }
          ]
        })

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
.svg {
  width: 100%;
  height: 100%;
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
</style>
