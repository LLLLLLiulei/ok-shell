<template>
  <div style="height: 100%; width: 100%; background: #000">
    <el-tabs v-model="activeName">
      <el-tab-pane v-for="item in terminals" :key="item.id" :label="item.label" :name="item.id" class="top-tab-pane">
        <template #label>
          <div style="display: flex; align-items: center; padding: 0 5px">
            <i :class="'term-' + item.status"></i>
            <i class="el-icon-s-platform" style="font-size: 18px; padding-left: 6px" />
            <span style="padding: 0 5px"> {{ item.label }}</span>
          </div>
        </template>
        <terminal-tabs v-bind="item" :active="activeName === item.id" @status-change="terminalStatusChange(item.id, $event)"></terminal-tabs>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue'
  import { RemoteOrLocal, TerminalStatus, SshOrSftp } from '../enum'
  import { uuid } from '../shared/uuid'
  import TerminalTabs from './TerminalTabs.vue'

  export default defineComponent({
    name: 'Demo',
    components: { TerminalTabs },
    setup() {
      const remoteSocketURI = 'ws://localhost:4001'
      const localSocketURI = 'ws://localhost:4002'
      const terminals = ref([
        {
          id: RemoteOrLocal.LOCAL + ':' + uuid(),
          label: 'LocalShell',
          remoteOrLocal: RemoteOrLocal.LOCAL,
          socketURI: localSocketURI,
          autoConnect: true,
          serverConfig: {},
          status: TerminalStatus.OFFLINE,
        },
        {
          id: RemoteOrLocal.REMOTE + ':' + uuid(),
          label: 'root@test.var123.cn',
          remoteOrLocal: RemoteOrLocal.REMOTE,
          socketURI: remoteSocketURI,
          autoConnect: true,
          status: TerminalStatus.OFFLINE,
          serverConfig: {
            port: '122',
            host: 'test.var123.cn',
            username: 'root',
            password: 'LIUliu',
          },
        },
      ])

      const activeName = ref(terminals.value[0].id)

      const terminalStatusChange = (id: string, status: TerminalStatus) => {
        console.log('🚀 ~ file: Demo.vue ~ line 64 ~ terminalStatusChange ~ status', id, status)
        terminals.value.find((i) => i.id === id)!.status = status
      }

      return {
        terminals,
        activeName,
        terminalStatusChange,
        SshOrSftp,
      }
    },
  })
</script>

<style>
  @import url(./css/terminal.css);
</style>
