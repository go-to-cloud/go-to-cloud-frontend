<script lang="ts" setup>
import { ElButton } from 'element-plus'
import {
  ChatLineSquare,
  Delete,
  MoreFilled,
  Platform,
  QuestionFilled,
  Refresh,
  Search
} from '@element-plus/icons-vue'
import { ContentDetailWrap } from '@/components/ContentDetailWrap'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/hooks/web/useI18n'
import { onMounted, onUnmounted, ref } from 'vue'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { SearchAddon } from 'xterm-addon-search'
import { AttachAddon } from 'xterm-addon-attach'
import 'xterm/css/xterm.css'
import { useAxios } from '@/hooks/web/useAxios'

import { HandlerCommand, PodDetail, xTermDefaultTheme } from '@/api/monitor/types'
import {
  calcAge,
  deletePodApi,
  getPodLogWebSocket,
  getPodsDetailApi,
  getPodShellWebSocket
} from '@/api/monitor'
import { ElMessageBox } from 'element-plus/es'

const route = useRoute()
const reloadingPods = ref(false)

const { t } = useI18n()
const { path, params } = useRoute()
const { push } = useRouter()
const request = useAxios()

const pods = ref<PodDetail[]>()
const getPodsDetail = async (force: boolean) => {
  reloadingPods.value = force
  let k8sRepoId = Number(params.id)
  let deploymentId = Number(route.query.from)
  await getPodsDetailApi(k8sRepoId, deploymentId, force).then((dat) => {
    pods.value = dat
    reloadingPods.value = false
  })
}

const podsRefresher = ref<autoRefreshPods>()
const selectedPod = ref<PodDetail>()

class autoRefreshPods {
  intervalId: NodeJS.Timer | null = null

  startTimer() {
    this.intervalId = setInterval(() => {
      getPodsDetail(false)
    }, 1000)
  }

  stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}

const describeQos = (qos: string): string => {
  if (qos.toLowerCase() === 'BestEffort'.toLowerCase()) {
    return 'Pod 被赋予了尽可能少的资源，并且允许共享其节点。<br />如果节点有可用的资源，则 Pod 可以使用它们，否则 Pod 可以不被调度或终止。'
  }
  if (qos.toLowerCase() == 'Burstable'.toLowerCase()) {
    return 'Pod 能够得到所需的资源，但可能会受到其他 Pod 影响而被削减。<br />如果请求的计算资源可用，则 Kubernetes 会保证这些资源可以用于 Pod，<br />但是如果节点上没有足够的计算资源可用，则 Kubernetes 可能会从该 Pod 中削减资源，并降低 Pod 的优先级。'
  }
  if (qos.toLowerCase() == 'Guaranteed'.toLowerCase()) {
    return 'Pod 被保证可以拥有其请求的所有计算资源，并且永远不会被剥夺。<br />如果 Pod 请求了 CPU 和内存，则 Kubernetes 会保证这些资源始终可用于该 Pod。<br />这是最高的 QoS 级别。'
  }
  return ''
}

const describeStatus = (status: string): string => {
  if (status.toLowerCase() === 'Pending'.toLowerCase()) {
    return 'warning'
  }
  if (
    status.toLowerCase() === 'Running'.toLowerCase() ||
    status.toLowerCase() === 'Succeeded'.toLowerCase()
  ) {
    return 'success'
  }
  if (status.toLowerCase() === 'Failed'.toLowerCase()) {
    return 'danger'
  }
  if (status.toLowerCase() === 'Unknown'.toLowerCase()) {
    return 'info'
  }
  return 'info'
}
const describeContainerColor = (status: number): string => {
  switch (status) {
    case 1:
      return '#529578'
    case 2:
      return '#6f6f65'
    case 3:
      return '#dccf56'
    case 4:
      return '#989891'
    default:
      return '#989891'
  }
}

const dlgViewLog = ref<boolean>(false)
const dlgShell = ref<boolean>(false)

const actionHandler = (command: HandlerCommand) => {
  selectedPod.value = command.form
  if ((selectedPod.value?.containers?.length || 0) > 0) {
    selectContainer.value = command.form.containers[0].name
  }
  switch (command.cmd) {
    case 'view_logs':
      dlgViewLog.value = true
      break
    case 'shell':
      dlgShell.value = true
      break
    case 'delete':
      ElMessageBox.confirm(t('monitor.deletePodConfirm'), t('common.confirmMsgTitle'), {
        confirmButtonText: t('common.ok'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }).then(() => {
        deletePodApi(Number(params.id), Number(route.query.from), command.form.name)
      })
      break
  }
}

const xTermLog = ref<Terminal | null>(null)
const xTermShell = ref<Terminal | null>(null)
const xterm_log_container = ref(null)
const xterm_shell_container = ref(null)
const fitAddon = new FitAddon()
const webLinksAddon = new WebLinksAddon()
const searchAddon = new SearchAddon()

const wsPodLog = ref<WebSocket>()
const wsPodShell = ref<WebSocket>()

const xTermShellClose = () => {
  wsPodShell.value?.close()
}
const xTermLogClose = () => {
  wsPodLog.value?.close()
}

function resizeScreen() {
  fitAddon.fit()
}

const xTermShellChangeContainer = () => {
  xTermShell.value?.reset()
  wsPodShell.value?.send(selectContainer.value || '')
}

const xTermLogChangeContainer = () => {
  xTermLog.value?.reset()
  wsPodLog.value?.send(selectContainer.value || '')
}

const xTermShellShow = (container: string | '') => {
  wsPodShell.value = getPodShellWebSocket(
    Number(params.id),
    Number(route.query.from),
    selectedPod.value!.name,
    container
  )

  wsPodShell.value!.onopen = () => {
    fitAddon.fit()
    xTermShell.value?.focus()
  }

  const shellConnected = ref<boolean>(false)
  wsPodShell.value!.onmessage = (evt) => {
    if (!shellConnected.value) {
      shellConnected.value = true
      xTermShell.value!.clear()
    }
    xTermShell.value!.write(JSON.parse(evt.data).data)
  }

  wsPodShell.value!.onclose = () => {
    shellConnected.value = false
    xTermShell.value!.writeln(t('monitor.xterm.disconnected'))
  }

  wsPodShell.value!.onerror = () => {
    shellConnected.value = false
    xTermShell.value!.writeln(t('monitor.xterm.disconnected'))
  }

  xTermShell.value = new Terminal({
    rows: 30,
    convertEol: true,
    cursorBlink: true,
    theme: xTermDefaultTheme
  })
  xTermShell.value.loadAddon(fitAddon)
  xTermShell.value.loadAddon(webLinksAddon)
  xTermShell.value.loadAddon(searchAddon)
  xTermShell.value.open(xterm_shell_container.value!)
  xTermShell.value.writeln(t('monitor.xterm.connecting') + '...')

  xTermShell.value.onResize((size) => {
    if (shellConnected.value) {
      wsPodShell.value!.send(
        JSON.stringify({
          operation: 'resize',
          cols: size.cols,
          rows: size.rows
        })
      )
    }
  })
  xTermShell.value.onData((msg) => {
    console.log(msg)
    wsPodShell.value!.send(
      JSON.stringify({
        operation: 'stdin',
        data: msg
      })
    )
  })
  window.addEventListener('resize', resizeScreen)
}

const xTermLogShow = (container: string | '') => {
  wsPodLog.value = getPodLogWebSocket(
    Number(params.id),
    Number(route.query.from),
    selectedPod.value!.name,
    container
  )

  wsPodLog.value!.onopen = () => {
    wsPodLog.value!.send(container)
    xTermLog.value!.clear()
    fitAddon.fit()
  }

  wsPodLog.value!.onclose = () => {
    xTermLog.value!.writeln(t('monitor.xterm.disconnected'))
  }

  xTermLog.value = new Terminal({
    rows: 30,
    convertEol: true,
    disableStdin: true,
    cursorBlink: false,
    theme: xTermDefaultTheme
  })
  xTermLog.value.loadAddon(fitAddon)
  xTermLog.value.loadAddon(webLinksAddon)
  xTermLog.value.loadAddon(searchAddon)
  xTermLog.value.loadAddon(new AttachAddon(wsPodLog.value!))
  xTermLog.value.open(xterm_log_container.value!)
  xTermLog.value.writeln(t('monitor.xterm.connecting') + '...')
  window.addEventListener('resize', resizeScreen)
}

onMounted(() => {
  getPodsDetail(true)
  podsRefresher.value = new autoRefreshPods()
  podsRefresher.value.startTimer()
})
onUnmounted(() => {
  podsRefresher.value?.stopTimer()
})
const selectContainer = ref<string>()
</script>
<template>
  <ElDialog
    v-model="dlgShell"
    :title="t('monitor.container_shell')"
    destroy-on-close
    fullscreen
    @closed="xTermShellClose"
    @opened="xTermShellShow(selectContainer)"
  >
    <template #header="{ titleId, titleClass }">
      <ElSpace>
        <h4 :class="titleClass" :title="titleId">{{ t('monitor.container_shell') }}</h4>
        <ElDivider direction="vertical" />
        <ElSelect
          v-model="selectContainer"
          :placeholder="t('monitor.switch_container')"
          @change="xTermShellChangeContainer"
        >
          <ElOption
            v-for="item in selectedPod.containers"
            :key="item.name"
            :label="item.name"
            :value="item.name"
          />
        </ElSelect>
      </ElSpace>
    </template>
    <ElContainer style="background-color: #000; margin: -20px; padding: 0px">
      <ElMain>
        <div style="height: calc(85vh)">
          <vue-scroll>
            <div ref="xterm_shell_container"></div>
          </vue-scroll>
        </div>
      </ElMain>
    </ElContainer>
  </ElDialog>

  <ElDialog
    v-model="dlgViewLog"
    :title="t('monitor.pod_logs')"
    destroy-on-close
    fullscreen
    @closed="xTermLogClose"
    @opened="xTermLogShow(selectContainer)"
  >
    <template #header="{ titleId, titleClass }">
      <ElSpace>
        <h4 :class="titleClass" :title="titleId">{{ t('monitor.pod_logs') }}</h4>
        <ElDivider direction="vertical" />
        <ElSelect
          v-model="selectContainer"
          :placeholder="t('monitor.switch_container')"
          @change="xTermLogChangeContainer"
        >
          <ElOption
            v-for="item in selectedPod.containers"
            :key="item.name"
            :label="item.name"
            :value="item.name"
          />
        </ElSelect>
      </ElSpace>
    </template>
    <ElContainer style="background-color: #000; margin: -20px; padding: 0px">
      <ElMain>
        <div style="height: calc(85vh)">
          <vue-scroll>
            <div ref="xterm_log_container"></div>
          </vue-scroll>
        </div>
      </ElMain>
    </ElContainer>
  </ElDialog>
  <ContentDetailWrap
    :title="t('monitor.pods_detail')"
    @back="push('/monitor/apps?from=' + route.query.from)"
  >
    <ElRow justify="space-between">
      <ElCol :span="18">
        <ElSpace wrap>
          <span class="header_title">Pod</span>
          <ElDivider direction="vertical" />
          <ElInput
            v-model="filterKeywords"
            :placeholder="t('monitor.podName')"
            :suffix-icon="Search"
            clearable
          />
        </ElSpace>
      </ElCol>
      <ElCol :span="6" style="text-align: right">
        <ElButton
          :disabled="reloadingPods"
          :icon="Refresh"
          type="success"
          @click="getPodsDetail(true)"
          >{{ t('monitor.refreshPod') }}
        </ElButton>
      </ElCol>
    </ElRow>
    <ElDivider />
    <ElSpace :size="30" wrap>
      <ElTable :data="pods" style="width: 100%">
        <ElTableColumn :label="t('monitor.podName')" fixed prop="name" width="300" />
        <ElTableColumn :label="t('monitor.container')" fixed prop="containers" width="180">
          <template #default="scope">
            <span v-for="s in scope.row.containers" :key="s"
              ><ElTooltip :content="s.name"
                ><ElIcon :color="describeContainerColor(s.status)"><Platform /></ElIcon
              ></ElTooltip>
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('monitor.restarts')" fixed prop="restartCounter" width="180" />
        <ElTableColumn fixed label="QoS" prop="qos" width="180">
          <template #default="scope">
            <ElSpace
              >{{ scope.row.qos }}
              <ElTooltip>
                <template #content>
                  <div v-html="describeQos(scope.row.qos)"></div>
                </template>
                <ElIcon>
                  <QuestionFilled />
                </ElIcon>
              </ElTooltip>
            </ElSpace>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('monitor.pod_age')" width="120">
          <template #default="scope">
            {{ calcAge(scope.row.createdAt) }}
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('monitor.pod_status')" prop="status" width="160">
          <template #default="scope">
            <ElTag :type="describeStatus(scope.row.status)">{{ scope.row.status }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('common.action')" fixed="right" prop="id" width="80">
          <template #default="scope">
            <ElDropdown @command="actionHandler">
              <span class="el-dropdown-link">
                <ElButton :icon="MoreFilled" circle />
              </span>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem
                    :command="{ id: scope.row.id, cmd: 'view_logs', form: scope.row }"
                  >
                    <ElLink :icon="ChatLineSquare" :underline="false">
                      {{ t('monitor.pod_logs') }}
                    </ElLink>
                  </ElDropdownItem>
                  <ElDropdownItem :command="{ id: scope.row.id, cmd: 'shell', form: scope.row }">
                    <ElLink :underline="false">
                      <Icon :underline="false" icon="tabler:brand-powershell" />
                      {{ t('monitor.container_shell') }}
                    </ElLink>
                  </ElDropdownItem>
                  <ElDropdownItem
                    :command="{ id: scope.row.id, cmd: 'delete', form: scope.row }"
                    divided
                  >
                    <ElLink :icon="Delete" :underline="false" type="danger">
                      {{ t('monitor.delete_pod') }}
                    </ElLink>
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElSpace>
  </ContentDetailWrap>
</template>

<style scoped>
.el-dialog__body {
  background-color: #000 !important;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
