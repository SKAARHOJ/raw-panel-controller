<template>
  <div id="wrapper">
    <div class="svg" ref="svg"></div>
    <ul>
    <li> Serial number: {{ serial }} </li>
    <li> Model: {{ model }} </li>
    <li> Version: {{ version }} </li>
    </ul>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'

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
        this.hwc = json.HWc
        this.typeIndex = json.typeIndex
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
        console.log(this.hwc)
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
    }
  }
</script>

<style>
#wrapper {
  display: flex;
  flex-direction: column;
  width: 50%;
  height: auto;
  text-align: center;
  align-content: center;
  position: relative;
  left: 25%;
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
</style>
