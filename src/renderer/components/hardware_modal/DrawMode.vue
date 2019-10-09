<template>
    <div class="main">
  <canvas ref="canvas"
          :width="width"
          :height="height"
          @contextmenu.prevent="update"
          @scroll.prevent="update"
          @click="update"
          @mousemove="move"
          @mousedown="down = true"
          @mouseup="down = false"
          >
  </canvas>
    </div>
</template>

<script>

import { remote, ipcRenderer } from 'electron'

const RIGHT_CLICK = 2

function modifyBuffer(buffer, x, y, value) {
  const index = Math.floor((x + y * 64) / 8)
  const bit = 7 - ((x + y * 64 ) % 8)
  buffer[index] ^= (-(value | 0) ^ buffer[index]) & (1 << bit)
}

export default {
  data() {
    const width = 64
    const height = 32
    let bufferArray = new Array(256)
    bufferArray.fill(new Uint8Array(256))
    for(let buffer of bufferArray) {
      buffer.fill(0)
    }
    return {
      down: false,
      width,
      height,
      bufferArray
    }
  },
  computed: {
    context() { return this.$refs.canvas.getContext("2d") },
    buffer() { return this.bufferArray[+this.$route.params.id] }
  },
  mounted() {
    this.interval = setInterval(() => {
      this.sendBuffer()
    }, 100)
    this.context.fillStyle = '#000000'
    this.context.fillRect(0, 0, this.width, this.height)
  },
  beforeDestroy() {
    clearInterval(this.interval)
  },
  methods: {
    update(event) {
      console.log(event)
      let value = 1
      if (event.button == RIGHT_CLICK || event.ctrlKey) {
        this.context.fillStyle = '#000000'
        value = 0
      }
      else this.context.fillStyle = '#ffffff'
      const rect = this.$refs.canvas.getBoundingClientRect()
      const scaleX = this.$refs.canvas.width / this.$refs.canvas.offsetWidth
      const scaleY = this.$refs.canvas.height / this.$refs.canvas.offsetHeight
      const x = Math.round(((event.x - rect.left) * scaleX) - 0.5)
      const y = Math.round(((event.y - rect.top) * scaleY) - 0.5)
      this.context.fillRect(x, y, 1, 1)
      modifyBuffer(this.buffer, x, y, value)
    },
    sendBuffer() {
      ipcRenderer.send('request', {
        command: 'HWCg',
        value: {
          index: +this.$route.params.id + 1,
          buffer: this.buffer
        }
      })
    },
    async load() {
      let filename = (await remote.dialog.showOpenDialog(null, {
        filters: [
          { name: 'Bitmap', extensions: 'bmp' }
          ],
        properties: ['openFile']
      }))[0]
      ipcRenderer.send('bitmap', { command: 'open', value: { filename } })
    },
    move(event) {
      if (this.down) this.update(event)
    }
  }
}
</script>

<style scoped>
canvas {
  box-sizing: border-box;
  width: 700px;
  border-style: solid;
  image-rendering: pixelated;
}
.main {
  display: flex;
  flex-direction: column;
}
</style>
