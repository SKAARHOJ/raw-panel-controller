<template>
  <div id="console">
    <ul>
      <li v-for="line in display">
        {{ line }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'console',
  data() {
    return {
      lines: []
    }
  },
  computed: {
    display() {
      let reversed = new Array(this.lines.length)
      let j = 0;
      for (let i = this.lines.length - 1, j = 0; i >= 0; --i) {
        reversed[j] = this.lines[i]
        ++j
      }
      return reversed
    }
  },
  methods: {
    append(info) {
      this.lines.push(info)
    }
  }
}
</script>

<style scoped>
#console {
  width: 95%;
  height: 95%;
  border: 5px black solid;
  border-radius: 5px;
  box-sizing: border-box;
  margin: auto;
  grid-area: console;
  overflow: auto;
}
ul {
  width: auto;
  height: 100px;
}
</style>
