<template>
  <div id="main">
    <div id="wrapper">
    <v-dialog/>
    <div class="svg" ref="svg"></div>
  </div>
  <div id="info">
    <ul id="hardwareInfo">
    <li> Serial number: {{ serial }} </li>
    <li> Model: {{ model }} </li>
    <li> Version: {{ version }} </li>
    </ul>
    <console/>
  </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import generateSVG from './old_svg'
import addHardwareComponent from './hardwareComponent'
import Console from './Console'

  export default {
    name: 'landing-page',
    components: { Console },
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
        const i = +data.id - 1
        let elem = document.getElementById(`hwc${i}`)
        if (data.value === 'Down') elem.classList.add('selected')
        else if (data.value === 'Up') elem.classList.remove('selected')
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
        ipcRenderer.send('request', '\nPanelTopology?\n')
      },
      requestPanelInformation() {
        ipcRenderer.send('request', 'list\n')
      },
      generateSVG() {
        generateSVG(this.hwc, this)
      },
      show(index) {
        ipcRenderer.send('request', `HWC#${index + 1}=5\n`)
        this.$modal.show('dialog', {
          title: `Alert! ${index}`,
          text: 'You are too awesome',
          buttons: [
            {
              title: 'Deal with it',
              default: true,
              handler: () => {
                ipcRenderer.send('request', `HWC#${index + 1}=0\n`)
                this.$modal.hide('dialog')
              }
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
  justify-self: center;
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
.selected {
  fill: yellow;
}
</style>
