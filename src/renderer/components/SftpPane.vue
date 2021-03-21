<template>
  <div class="sftp-container" v-loading="loading" element-loading-text="waiting ..." element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
    <el-container class="">
      <el-aside width="260px" v-if="false">
        <el-tree :data="treeData" lazy :load="loadTree" :props="defaultProps" node-key="id">
          <template #default="{ node }">
            <span class="custom-tree-node">
              <i class="el-icon-folder-opened" />
              <span>{{ node.label }}</span>
            </span>
          </template>
        </el-tree>
      </el-aside>
      <el-container>
        <el-header height="40px">
          <el-breadcrumb separator=">" v-if="pathList.length">
            <el-breadcrumb-item v-for="(item, index) in pathList" :key="item">
              <a href="javascript:void(0)" @click="go(index)">
                <i v-if="index === 0" class="el-icon-s-home"></i>
                <span v-else>{{ item }} </span>
              </a>
            </el-breadcrumb-item>
          </el-breadcrumb>
        </el-header>
        <el-main>
          <el-table :data="fileList" style="width: 100%">
            <el-table-column show-overflow-tooltip prop="name" label="Name">
              <template #default="scope">
                <i v-if="scope.row.type === 'File'" class="el-icon-document"></i>
                <i v-else class="el-icon-folder"></i>
                <a href="javascript:void(0)" @click="changePath(scope.row)">{{ scope.row.name }}</a>
              </template>
            </el-table-column>
            <el-table-column show-overflow-tooltip prop="type" label="Type" width="120"> </el-table-column>
            <el-table-column show-overflow-tooltip prop="size" label="Size" width="120"> </el-table-column>
            <el-table-column show-overflow-tooltip prop="modifyTime" label="ModifyTime" width="180"> </el-table-column>
            <el-table-column show-overflow-tooltip prop="permissions" label="Permissions" width="120"> </el-table-column>
          </el-table>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script lang="ts">
  import { computed, defineComponent, PropType, reactive, toRefs, watch } from 'vue'
  import { RemoteOrLocal } from '@/renderer/enum'
  import { formatDate, formatSize } from '@/renderer/shared'

  interface FileItem {
    type: 'd' | 'l' | '-'
    path: string
    name: string
    size: number
    modifyTime: number
    accessTime: number
    rights: { user: string; group: string; other: string }
    owner: number
    group: number
    children?: FileItem[]
  }
  export default defineComponent({
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
    setup(props) {
      let socket: Nullable<WebSocket> = null
      const defaultProps = {
        children: 'children',
        label: 'name',
      }

      const state = reactive({
        fileList: [] as any[],
        currentPath: '/',
        pathList: ['/'] as string[],
        loading: false,
      })

      const loadTree = (node: any, resolve: any) => {
        console.log('🚀 ~ file: SftpPane.vue ~ line 86 ~ loadTree ~ node', node, resolve)
      }

      watch(
        () => state.currentPath,
        () => {
          socket?.send(state.currentPath)
        }
      )

      const treeData = computed(() => {
        return state.fileList.filter((i) => i.type === 'Directory')
      })

      const changePath = (row: any) => {
        if (row.type === 'File') {
          return
        }
        state.pathList.push(row.name)
        socket?.send(state.pathList.join('/'))
        console.log('🚀 ~ file: SftpPane.vue ~ line 108 ~ changePath ~ row', row)
      }

      const go = (index: number) => {
        state.pathList.splice(index + 1)
        socket?.send(state.pathList.join('/'))
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

      const formatFileList = (data: FileItem[]) => {
        return data.map((i) => {
          return {
            type: i.type === '-' ? 'File' : 'Directory',
            name: i.name,
            modifyTime: formatDate(i.modifyTime),
            size: formatSize(i.size),
            permissions: Object.values(i.rights).join(''),
            path: i.path,
          }
        })
      }

      const bindSocketEvent = (socket: WebSocket) => {
        socket.onmessage = (event: MessageEvent) => {
          state.loading = false
          let data = formatFileList(JSON.parse(event.data))
          console.log(data)
          state.fileList = data
        }
        socket.onclose = () => {}
      }

      const init = async () => {
        state.loading = true
        console.log('🚀 ~ file: SftpPane.vue ~ line 86 ~ init ~ init')
        socket = await initSocket(props.socketURI)
        bindSocketEvent(socket)
        console.log('🚀 ~ file: SftpPane.vue ~ line 97 ~ init ~ socket', socket)
      }

      props.remoteOrLocal === RemoteOrLocal.REMOTE && init()

      return { ...toRefs(state), treeData, loadTree, defaultProps, changePath, go }
    },
  })
</script>
<style lang="scss">
  .sftp-container {
    width: 100%;
    height: 100%;
    background: #fff;
    .el-container {
      width: 100%;
      height: 100%;
      // border: 1px solid red;
      .el-aside,
      .el-container {
        padding: 10px;
      }
      .el-aside {
        border-right: 1px solid #ccc;
      }

      .el-header,
      .el-main {
        padding: 0px;
      }
      .el-main {
        padding-top: 10px;
      }
      .el-header {
        display: flex;
        justify-content: start;
        align-items: center;
        border-bottom: 1px solid #ccc;
      }
      .el-header {
        // border: 1px solid red;
      }
      .custom-tree-node {
        .el-icon-folder-opened {
          margin-right: 5px;
          font-size: 18px;
          // color: #f6ce62;
        }
      }
    }
  }
</style>
