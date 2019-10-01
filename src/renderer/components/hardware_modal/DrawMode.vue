<template>
  <canvas ref="canvas"
          :width="width"
          :height="height"
          @contextmenu.prevent="update"
          @click="update"
          @mousemove="move"
          @mousedown="down = true"
          @mouseup="down = false"
          >
  </canvas>
</template>

<script>

import { ipcRenderer } from 'electron'

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
    }, 1000)
    this.context.fillStyle = '#000000'
    this.context.fillRect(0, 0, this.width, this.height)
  },
  beforeDestroy() {
    clearInterval(this.interval)
  },
  methods: {
    update(event) {
      let value = 1
      if (event.button == RIGHT_CLICK) {
        this.context.fillStyle = '#000000'
        value = 0

      }
      else this.context.fillStyle = '#ffffff'
      const rect = this.$refs.canvas.getBoundingClientRect()
      const scaleX = this.$refs.canvas.width / this.$refs.canvas.offsetWidth
      const scaleY = this.$refs.canvas.height / this.$refs.canvas.offsetHeight
      const x = Math.round((event.x - rect.left) * scaleX)
      const y = Math.round((event.y - rect.top) * scaleY)
      this.context.fillRect(x, y, 1, 1)
      modifyBuffer(this.buffer, x, y, value)
    },
    sendBuffer() {
      let arr = new Array(3)
      arr[0] = this.buffer.slice(0, 86)
      arr[1] = this.buffer.slice(86, 172)
      arr[2] = this.buffer.slice(172, 256)
      for (let i = 0; i < 3; ++i ) {
        setTimeout(() => {
          ipcRenderer.send('request', {
            command: 'HWCg',
            value: {
              controllerIndex: +this.$route.params.id + 1,
              commandIndex: i,
              buffer: this.buffer
            }
          })
        }, 1000 * (i + 1))
      }
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
  width: 100%;
  height: 100%;
  border-style: solid;
  image-rendering: pixelated;
}
</style>
