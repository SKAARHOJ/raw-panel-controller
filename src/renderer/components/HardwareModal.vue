<template>
  <transition name="modal" v-if="enabled">
  <div class="modal-mask" @click="close">
    <div class="modal-wrapper">
      <div class="modal-container" @click.stop>
        <form ref="form" @submit.prevent="sendToHardware">
          <div class="row" v-for='(value, key) in inputs[currentIndex]'>
            <label> {{ value.name }} </label>
            <input
              v-if="value.type !== 'select'"
              v-focus="key === 'title'"
              autofocus
              :type="value.type"
              v-model="inputs[currentIndex][key].value"/>
            <select v-else>
              <option v-for="val of value.value" :value="val">
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
import hardwareController from './hardwareController'

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
      ipcRenderer.send('request', `HWC#${index + 1}=5\n`)
    },
    close() {
      ipcRenderer.send('request', `HWC#${this.currentIndex + 1}=0\n`)
      this.enabled = false
    },
    sendToHardware() {
      const title = this.inputs[this.currentIndex].title
      hardwareController.sendHWCt(this.currentIndex, this.inputs[this.currentIndex])
      this.close()
    },
    capitalize(value) {
      return value.charAt(0).toUpperCase() + value.slice(1);
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
          value: ["Number", "No display",],
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
