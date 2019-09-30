<template>
  <form ref="form" @submit.prevent="sendToHardware">
    <div class="row" v-for='(item, key) in inputs[currentIndex]'>
      <label> {{ item.name }} </label>
      <input
        v-if="item.type !== 'select'"
        v-focus="key === 'title'"
        autofocus
        :type="item.type"
        v-model="inputs[currentIndex][key].value"/>
      <select v-else v-model="item.value">
        <option v-for="val of item.options" :value="val">
        {{ val }}
        </option>
      </select>
    </div>
    <div id="submit">
      <input type="submit" value="Send"/>
    </div>
  </form>
</template>

<script>

import { ipcRenderer } from 'electron'

export default {
  name: 'hardware-modal',
  data() {
    let arr = new Array(128)
    arr.fill(this.makeHardwareInput())
    return {
      inputs: arr,
      menu: ["Title", "Draw"],
    }
  },
  computed: {
    currentIndex() {
      return +this.$route.params.id
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => vm.open())
  },
  methods: {
    open() {
      console.log('opening')
      const index = this.currentIndex
      if (!this.inputs[index])
        this.inputs[index] = this.makeHardwareInput()
      ipcRenderer.send('request', { command: 'HWCc', value: { index, state: 130 }})
      ipcRenderer.send('request', { command: 'HWC', value: { index, state: 36 }})
    },
    close() {
      ipcRenderer.send('request', { command: 'HWC', value: { index: this.currentIndex, state: 0 }})
      ipcRenderer.send('request', { command: 'HWCc', value: { index: this.currentIndex, state: 0 }})
      this.$router.push('/landing-page/')
    },
    sendToHardware() {
      console.log(`sending ${this.currentIndex}`)
      ipcRenderer.send('request', {
        command: 'HWCt',
        value: this.makeHWCtValue(this.currentIndex)
      })
      this.close()
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
  display: table;
  transition: opacity .3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 300px;
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

form {
  padding: 20px 30px;
}

ul {
  padding: 10px 10px;
}

li:hover {
  color: lightgrey;
  cursor: pointer;
}

#submit {
  display: flex;
  justify-content: flex-end;
}
</style>
