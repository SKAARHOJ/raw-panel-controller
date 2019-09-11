<template>
  <transition name="modal" v-if="enabled">
  <div class="modal-mask" @click="close">
    <div class="modal-wrapper">
      <div class="modal-container" @click.stop>
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
      </div>
    </div>
  </div>
  </transition>
</template>

<script>

import { ipcRenderer } from 'electron'

export default {
  name: 'hardware-modal',
  data() {
    let arr = new Array(128)
    arr.fill(undefined)
    return {
      enabled: false,
      inputs: arr,
      currentIndex: 0,
    }
  },
  methods: {
    show(index) {
      this.currentIndex = index
      if (!this.inputs[index])
        this.inputs[index] = this.makeHardwareInput()
      this.enabled = true
      ipcRenderer.send('request', { command: 'HWCc', value: { index, state: 130 }})
      ipcRenderer.send('request', { command: 'HWC', value: { index, state: 36 }})
    },
    close() {
      ipcRenderer.send('request', { command: 'HWC', value: { index: this.currentIndex, state: 0 }})
      ipcRenderer.send('request', { command: 'HWCc', value: { index: this.currentIndex, state: 0 }})
      this.enabled = false
    },
    sendToHardware() {
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
  padding: 20px 30px;
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

.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

#submit {
  display: flex;
  justify-content: flex-end;
}
</style>
