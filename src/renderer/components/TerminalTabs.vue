<template>
  <div class="terminal-tabs" style="height: 100%; width: 100%; background: #000">
    <el-tabs v-model="currentPane" stretch>
      <el-tab-pane :name="SshOrSftp.SSH" label="SSH">
        <ssh-pane
          :remoteOrLocal="remoteOrLocal"
          :socketURI="socketURI + '/ssh'"
          :autoConnect="autoConnect"
          :active="currentPane === SshOrSftp.SSH && active"
          @status-change="sshStatusChange"
        ></ssh-pane>
      </el-tab-pane>
      <el-tab-pane :name="SshOrSftp.SFTP" label="SFTP">
        <sftp-pane
          :remoteOrLocal="remoteOrLocal"
          :socketURI="socketURI + '/sftp'"
          :autoConnect="autoConnect"
          :active="currentPane === SshOrSftp.SSH && active"
          @status-change="sshStatusChange"
        ></sftp-pane>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script lang="ts">
  import { defineComponent, PropType, ref } from 'vue'
  import { RemoteOrLocal, SshOrSftp, TerminalStatus } from '@/renderer/enum'
  import SshPane from './SshPane.vue'
  import SftpPane from './SftpPane.vue'

  export default defineComponent({
    name: 'TerminalTabs',
    emits: ['update:activePane', 'status-change'],
    components: { SftpPane, SshPane },
    props: {
      remoteOrLocal: {
        type: String as PropType<RemoteOrLocal>,
        default: RemoteOrLocal.LOCAL,
      },
      socketURI: {
        type: String,
        default: '',
        validate: (val: string) => /^ws:\/\//.test(val),
      },
      autoConnect: {
        type: Boolean,
        default: true,
      },

      serverConfig: {
        type: Object as PropType<ServerConfig>,
        required: true,
      },
      active: {
        type: Boolean,
        default: false,
      },
    },
    setup(_props, { emit }) {
      const currentPane = ref(SshOrSftp.SSH)

      const sshStatusChange = (status: TerminalStatus) => {
        emit('status-change', status)
      }

      return {
        currentPane,
        SshOrSftp,
        sshStatusChange,
      }
    },
  })
</script>
<style lang="scss">
  .terminal-tabs {
    .el-tabs__item {
      color: #888 !important;
      font-size: 12px !important;
      padding: 0 !important;
    }
    .el-tabs__item.is-active {
      color: #fff !important;
      background: inherit !important;
    }
    .el-tabs__active-bar {
      display: block !important;
    }
    .el-tabs__header {
      background: #141314;
      background-image: none;
    }
    .el-tabs__content {
      height: calc(100vh - 95px) !important;
      margin: 10px;
    }
  }
</style>
