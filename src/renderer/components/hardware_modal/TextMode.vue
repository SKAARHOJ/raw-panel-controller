<template>
  <form ref="form" @submit.prevent="sendToHardware">
    <div class="row" v-for='(item, key) in inputs[currentIndex]'>
      <label> {{ item.name }} </label>
      <input
        @input="sendToHardware"
        @change="sendToHardware"
        v-if="item.type !== 'select'"
        v-focus="key === 'title'"
        autofocus
        :type="item.type"
        v-model="inputs[currentIndex][key].value"/>
      <select v-else v-model="item.value" @change="sendToHardware">
        <option v-for="val, i of item.options" :value="i">
        {{ val }}
        </option>
      </select>
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
      ipcRenderer.send('request', {
        command: 'HWCt',
        value: this.makeHWCtValue(this.currentIndex)
      })
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
          options: [
            "X",
            "10^-3 X.XX",
            "X%",
            "XdB",
            "XF",
            "1/X",
            "XK",
            "Hidden",
            "10^-3 X.XXX",
            "10^-2 XX.XX",
            "1 Text line",
            "2 Text lines",
          ],
          value: 0,
          type: 'select'
        },
        label1: {
          name: "Label 1",
          value: '',
          type: 'text',
        },
        label2: {
          name: "Label 2",
          value: '',
          type: 'text',
        },
        value2: {
          name: "Secondary value",
          value: 0,
          type: 'number',
        },
        // useScale: {
        //   name: "Add Scale",
        //   type: 'checkbox',
        //   value: false,
        // },
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

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
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
label {
  padding: 0px 30px 0px 0px;
}
</style>
