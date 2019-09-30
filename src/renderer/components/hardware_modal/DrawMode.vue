<template>
  <canvas ref="canvas"
    width=64
    height=32
    @contextmenu.prevent="update"
    @click="update"
    @mousemove="move"
    @mousedown="down = true"
    @mouseup="down = false"
    >
  </canvas>
</template>

<script>

const RIGHT_CLICK = 2

export default {
  data() {
    return {
      down: false
    }
  },
  computed: {
    context() { return this.$refs.canvas.getContext("2d") }
  },
  methods: {
    update(event) {
      console.log(event.button)
      if (event.button == RIGHT_CLICK) this.context.fillStyle = '#ffffff'
      else this.context.fillStyle = '#000000'
      const rect = this.$refs.canvas.getBoundingClientRect()
      const scaleX = this.$refs.canvas.width / this.$refs.canvas.offsetWidth
      const scaleY = this.$refs.canvas.height / this.$refs.canvas.offsetHeight
      const x = Math.round((event.x - rect.left) * scaleX)
      const y = Math.round((event.y - rect.top) * scaleY)
      console.log({x, y})
      this.context.fillRect(x, y, 1, 1)
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
}
</style>
