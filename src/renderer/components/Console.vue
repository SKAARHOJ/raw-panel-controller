<template>
  <div id="console">
    <ul>
      <li v-for="line of lines">
        <p width="300px" v-for="part of line">
        {{ part }}
        </p>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'console',
  data() {
    return {
      lines: new Array(256),
      current: 0,
    }
  },
  methods: {
    append(info) {
      const length = this.lines.unshift(info.split('\t'))
      if (length > 50) this.lines.pop()
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
  box-sizing: border-box;
  padding-left: 30px;
  padding-right: 30px;
}
li {
  display: flex;
  justify-content: left;
}
p {
  width: 300px;
}
</style>
