<template>
  <div class="terminal-container" v-loading="loading" element-loading-text="waiting ..." element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
    <div ref="xtermEL" class="my-xterm" />
  </div>
</template>
<script lang="ts">
  import 'xterm/css/xterm.css'
  import { ITerminalAddon, ITerminalOptions, Terminal } from 'xterm'
  import { FitAddon } from 'xterm-addon-fit'

  import { AttachAddon } from 'xterm-addon-attach'
  import { computed, defineComponent, nextTick, onMounted, onUnmounted, PropType, reactive, ref, watchEffect } from 'vue'
  import { RemoteOrLocal, TerminalStatus } from '@/renderer/enum'

  interface TerminalInfo {
    xterm: Nullable<Terminal>
    socket: Nullable<WebSocket>
    status: Nullable<TerminalStatus>
    addons: Nullable<ITerminalAddon[]>
  }

  export default defineComponent({
    name: 'SshPane',
    emits: ['status-change'],
    props: {
      remoteOrLocal: {
        type: String as PropType<RemoteOrLocal>,
        required: true,
      },
      socketURI: {
        type: String,
        required: true,
        validate: (val: string) => /^ws:\/\//.test(val),
      },
      autoConnect: {
        type: Boolean,
        default: true,
      },
      active: {
        type: Boolean,
        default: false,
      },
    },
    setup(props, { emit }) {
      const xtermEL = ref<Nullable<HTMLDivElement>>(null)
      const terminalInfo = reactive<TerminalInfo>({
        xterm: null,
        socket: null,
        status: TerminalStatus.OFFLINE,
        addons: [],
      })

      const changeTerminalStatus = (status: TerminalStatus) => {
        terminalInfo.status = status
        emit('status-change', status)
      }

      const initXterm = (el: HTMLElement, options?: ITerminalOptions, addons?: ITerminalAddon[]) => {
        options = options || {
          fontSize: 14,
          cursorBlink: true,
        }
        const term = new Terminal(options)
        addons?.forEach((i) => term.loadAddon(i))
        term.open(el)
        return term
      }

      const initSocket = (socketURI: string) => {
        return new Promise<WebSocket>((resolve, reject) => {
          const socket = new WebSocket(socketURI)
          socket.onopen = () => {
            resolve(socket)
          }
          socket.onerror = (e: Event) => {
            reject(e)
          }
        })
      }

      const bindSocketEvent = (socket: WebSocket) => {
        socket.onmessage = () => {
          changeTerminalStatus(TerminalStatus.ONLINE)
        }
        socket.onclose = () => {
          changeTerminalStatus(TerminalStatus.OFFLINE)
        }
      }

      const findFitAddon = (addons: ITerminalAddon[]) => addons.find((i) => i instanceof FitAddon) as Nullable<FitAddon>

      const fit = () => {
        nextTick(() => {
          const { addons, xterm } = terminalInfo
          findFitAddon(addons || [])?.fit()
          xterm?.focus()
        })
      }

      const resizeHandler = () => fit()

      const init = async () => {
        changeTerminalStatus(TerminalStatus.CONNECTING)
        try {
          terminalInfo.socket = await initSocket(props.socketURI)
        } catch (error) {
          changeTerminalStatus(TerminalStatus.ERROR)
        }
        terminalInfo.addons = [new FitAddon(), new AttachAddon(terminalInfo.socket!)]
        const xtermOptions = {
          fontSize: 14,
          cursorBlink: true,
        }
        terminalInfo.xterm = initXterm(xtermEL.value!, xtermOptions, terminalInfo.addons)
        bindSocketEvent(terminalInfo.socket!)
        fit()
        watchEffect(() => terminalInfo.status === TerminalStatus.ONLINE && fit())
        window.addEventListener('resize', resizeHandler)
      }

      const dispose = () => {
        const { xterm, socket } = terminalInfo
        xterm?.dispose()
        socket?.close()
        window.removeEventListener('resize', resizeHandler)
      }

      const loading = computed(() => terminalInfo.status === TerminalStatus.CONNECTING)

      watchEffect(() => {
        props.active && fit()
      })

      onMounted(() => {
        props.autoConnect && init()
      })

      onUnmounted(() => {
        dispose()
      })

      return {
        TerminalStatus,
        xtermEL,
        terminalInfo,
        init,
        fit,
        loading,
      }
    },
  })
</script>
<style lang="scss">
  .terminal-container {
    width: 100%;
    height: 100%;
    .my-xterm {
      width: 100%;
      height: 100%;
    }
  }
</style>
