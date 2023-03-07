<script setup lang="ts">
import { ElButton } from 'element-plus'
import {
  Refresh,
  QuestionFilled,
  Platform,
  ChatLineSquare,
  Delete,
  MoreFilled,
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

const route = useRoute()
const reloadingPods = ref(false)

import { useAxios } from '@/hooks/web/useAxios'

import { HandlerCommand, PodDetail, xTermDefaultTheme } from '@/api/monitor/types'
import { calcAge, getPodsDetailApi, getPodLogWebSocket, getWebSocketHost } from '@/api/monitor'
import { Num } from 'windicss/types/lang/tokens'
import { contain } from 'echarts/types/src/scale/helper'

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
    }, 5000)
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

const actionHandler = (command: HandlerCommand) => {
  switch (command.cmd) {
    case 'view_logs':
      dlgViewLog.value = true
      selectedPod.value = command.form
      break
    case 'shell':
      break
    case 'delete':
      break
  }
}

const xTermLog = ref<Terminal | null>(null)
const xterm_log_container = ref(null)
const fitAddon = new FitAddon()
const webLinksAddon = new WebLinksAddon()
const searchAddon = new SearchAddon()

const wsPodLog = ref<WebSocket>()

const xTermLogClose = () => {
  wsPodLog.value?.close()
}

function resizeScreen() {
  fitAddon.fit()
}

const xTermLogChangeContainer = () => {
  xTermLog.value?.reset()
  wsPodLog.value?.send(selectContainer.value || '')
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
    v-model="dlgViewLog"
    fullscreen
    :title="t('monitor.pod_logs')"
    @opened="xTermLogShow('')"
    @closed="xTermLogClose"
    destroy-on-close
  >
    <template #header="{ titleId, titleClass }">
      <ElSpace>
        <h4 :title="titleId" :class="titleClass">{{ t('monitor.pod_logs') }}</h4>
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
        </ElSelect> </ElSpace
    ></template>
    <ElContainer style="background-color: #000; margin: -20px; padding: 0px">
      <ElMain>
        <div style="height: calc(85vh)">
          <vue-scroll>
            <div ref="xterm_log_container"> </div>
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
          @click="getPodsDetail(true)"
          type="success"
          >{{ t('monitor.refreshPod') }}
        </ElButton>
      </ElCol>
    </ElRow>
    <ElDivider />
    <ElSpace wrap :size="30">
      <ElTable :data="pods" style="width: 100%">
        <ElTableColumn fixed prop="name" :label="t('monitor.podName')" width="300" />
        <ElTableColumn fixed prop="containers" :label="t('monitor.container')" width="180">
          <template #default="scope">
            <span v-for="s in scope.row.containers" :key="s"
              ><ElTooltip :content="s.name"
                ><ElIcon :color="describeContainerColor(s.status)"><Platform /></ElIcon
              ></ElTooltip>
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn fixed prop="restartCounter" :label="t('monitor.restarts')" width="180" />
        <ElTableColumn fixed prop="qos" label="QoS" width="180">
          <template #default="scope">
            <ElSpace
              >{{ scope.row.qos
              }}<ElTooltip
                ><template #content><div v-html="describeQos(scope.row.qos)"></div></template>
                <ElIcon><QuestionFilled /></ElIcon></ElTooltip
            ></ElSpace>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('monitor.pod_age')" width="120">
          <template #default="scope">
            {{ calcAge(scope.row.createdAt) }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="status" :label="t('monitor.pod_status')" width="160">
          <template #default="scope">
            <ElTag :type="describeStatus(scope.row.status)">{{ scope.row.status }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn fixed="right" prop="id" :label="t('common.action')" width="80">
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
                      <Icon icon="tabler:brand-powershell" :underline="false" />{{
                        t('monitor.container_shell')
                      }}</ElLink
                    > </ElDropdownItem
                  ><ElDropdownItem
                    divided
                    :command="{ id: scope.row.id, cmd: 'delete', form: scope.row }"
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
