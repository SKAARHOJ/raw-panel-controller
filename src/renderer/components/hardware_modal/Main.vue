<template>
  <transition name="modal">
  <div class="modal-mask" @click="leave">
    <div class="modal-wrapper">
      <div class="modal-container" @click.stop>
        <ul class="header row">
          <router-link v-for="item, i of menu" :key="i" :to="{ name: item }">
            {{ item }}
          </router-link>
        </ul>
        <router-view/>
          <footer class="row">
            <p align="justify"> {{ lastCommand }} </p>
            <button @click="clipboard.writeText(lastCommand)"> Copy </button>
          </footer>
      </div>
    </div>
  </div>
  </transition>
</template>

<script>

import { ipcRenderer, clipboard } from 'electron'

export default {
  name: 'hardware-modal',
  data() {
    let arr = new Array(128)
    arr.fill(this.makeHardwareInput())
    return {
      inputs: arr,
      menu: ["Text", "Draw"],
      lastCommand: '',
      clipboard
    }
  },
  computed: {
    currentIndex() {
      return +this.$route.params.id
    }
  },
  beforeRouteLeave(to, from, next) {
    this.close()
    next()
  },
  mounted() {
    ipcRenderer.on('raw_command', (event, data) => {
      this.lastCommand = data.raw
    })
  },
  methods: {
    close() {
      ipcRenderer.send('request', { command: 'HWC', value: { index: this.currentIndex, state: 0 }})
      ipcRenderer.send('request', { command: 'HWCc', value: { index: this.currentIndex, state: 0 }})
    },
    leave() {
      console.log('leaving')
      this.$router.push('/landing-page/')
    },
    sendToHardware() {
      console.log(`sending ${this.currentIndex}`)
      ipcRenderer.send('request', {
        command: 'HWCt',
        value: this.makeHWCtValue(this.currentIndex)
      })
      this.leave()
    },
    makeHWCtValue(index) {
      let ret = { index }
      let current = this.inputs[index]
      for (let key in current) {
        ret[key] = current[key].value
      }
      console.log(ret)
      return ret
    },
    makeHardwareInput() {
      return {
        title: {
          name: 'Title',
          value: '',
          type: 'text'
        },
        isLabel: {
          name: "Label",
          value: false,
          type: 'checkbox'
        },
        value: {
          name: "Value",
          value: 0,
          type: 'number'
        },
        displayType: {
          name: "Display Type",
          options: ["Integer", "No Display"],
          value: "Integer",
          type: 'select'
        },
      }
    }
  },
  directives: {
    focus: {
      inserted: function (el, args) {
        if (args.value) el.focus()
      }
    }
  }
}

</script>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: flex;
  transition: opacity .3s ease;
  justify-content: center;
}

.modal-wrapper {
  align-self: center;
  align-items: center;
  display: flex;
  justify-content: center;
  flex-direction: row;
}

.modal-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: auto;
  margin: 0px auto;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
  font-family: Helvetica, Arial, sans-serif;
}


.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  transform: scale(1.1);
}

.header {
  width: 100%;
  justify-content: space-evenly;
  margin: 0px;
  padding: 10px 0px;
}

a {
  color: white;
  text-decoration: none;
}

a.router-link-exact-active {
  font-weight: bold;
}

a:hover {
  color: lightgrey;
  cursor: pointer;
}

#submit {
  display: flex;
  justify-content: flex-end;
}

footer {
  padding: 0px 30px;
  width: 100%;
  justify-content: space-evenly;
}

p {
  padding: 0px 30px;
}

button {
  padding: 10px;
  margin: 0px 30px;
}
</style>
