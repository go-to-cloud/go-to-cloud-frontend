<script lang="ts" setup>
import { useI18n } from '@/hooks/web/useI18n'
import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { Action, ElButton, ElDivider, ElMessage } from 'element-plus'
import { Delete, Expand, MoreFilled, Refresh, RefreshRight, Search } from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'
import { Error } from '@/components/Error'
import { Org } from '@/api/common/types'
import { getOrganizationsApi } from '@/api/common'
import { ArtifactRepoItem, NodeType } from '@/api/configure/types'
import { getK8sRepoApi } from '@/api/configure/deploy'
import {
  calcAge,
  deleteDeploymentApi,
  getAppsApi,
  restartDeploymentApi,
  scaleReplicasApi
} from '@/api/monitor'
import { AppData, HandlerCommand, K8sRepoWithAppData } from '@/api/monitor/types'
import { DeploymentApps } from '@/api/projects/types'
import { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus/es'
import { useVisibilityStore } from '@/store/modules/visibility'
import { AuthCodes } from '@/api/constants/auths'

const { path, params } = useRoute()
const { push } = useRouter()
const route = useRoute()

const { t } = useI18n()

const podsDetailDlgVisible = ref(false)
const scaleDlgVisible = ref(false)
const loading = ref(true)
const Organizations = ref<Array<Org>>(new Array<Org>())
const replicasNum = ref(0)
const selectedDeploymentId = ref(0)

const selectedRepoTab = ref('-1')
const k8sWithApp = ref<K8sRepoWithAppData[]>([])
const namespacesPair = ref<TextValuePair[]>([])
const reloadingApps = ref(false)

interface TextValuePair {
  text: string
  value: string
}

const nsFilterHandler = (
  value: string,
  row: DeploymentApps,
  column: TableColumnCtx<DeploymentApps>
) => {
  return row.namespace === value
}
const repoSelected = async (force: boolean) => {
  reloadingApps.value = force
  for (let i = 0; i < k8sWithApp.value.length; i++) {
    if (k8sWithApp.value[i].id == nodeTabSelected.value) {
      selectedRepoTab.value = i + ''
      const node = k8sWithApp.value[i]
      await getAppsApi(node.id, force).then((resp) => {
        node.items = resp
        currentNode.value = resp
        reloadingApps.value = false
      })
      break
    }
  }
}

// from: true时读取url query，目的是仅页面首次加载时读取参数
const getK8sRepoList = async (from: boolean) => {
  await getK8sRepoApi().then(async (resp) => {
    k8sWithApp.value = resp
    if (from && route.query.from) {
      let t = parseInt(route.query.from.toString())
      if (t > 0) {
        nodeTabSelected.value = t
        await repoSelected(true)
        return
      }
    }
    if (resp.length > 0 && selectedRepoTab.value === '-1') {
      nodeTabSelected.value = resp[0].id
      await repoSelected(true)
    }
  })
}

const getOrganizations = async () => {
  await getOrganizationsApi().then((resp) => {
    if (resp!) {
      Organizations.value = new Array<Org>()
      for (let entry of resp.entries()) {
        Organizations.value.push({
          id: Number(entry[0]),
          name: entry[1]
        })
      }
    }
  })
}

const nodeTabHover = ref(0)
const nodeTabSelected = ref(-1)

const IconKube = 'skill-icons:kubernetes'

function GetIcon(nodeType: NodeType) {
  switch (nodeType) {
    case NodeType.K8s:
      return [IconKube, null]
    default:
      return [IconKube, null]
  }
}

function isFirstTabInit(a: K8sRepoWithAppData): boolean {
  return (
    (a === k8sWithApp.value[0] && selectedRepoTab.value === '0') ||
    a.id === nodeTabHover.value ||
    a.id === nodeTabSelected.value
  )
}

const startScaleReplicas = async () => {
  let k8sRepoId = nodeTabSelected.value
  await scaleReplicasApi(selectedDeploymentId.value, k8sRepoId, replicasNum.value).then((resp) => {
    if (resp.code == '200') {
      scaleDlgVisible.value = false
      repoSelected(true)
    }
  })
}
const startRestartDeployment = async () => {
  let k8sRepoId = nodeTabSelected.value
  await restartDeploymentApi(selectedDeploymentId.value, k8sRepoId).then((resp) => {
    if (resp.code == '200') {
      repoSelected(true)
      ElMessage({
        type: 'success',
        message: t('monitor.restart') + t('common.success')
      })
    }
  })
}

const actionHandler = (command: HandlerCommand) => {
  switch (command.cmd) {
    case 'view':
      push('/monitor/' + nodeTabSelected.value + '/pods?from=' + command.form.id)
      break
    case 'scale':
      scaleDlgVisible.value = true
      replicasNum.value = command.form.replicas
      selectedDeploymentId.value = command.form.id
      break
    case 'restart':
      selectedDeploymentId.value = command.form.id
      ElMessageBox.confirm(t('common.confirmMsgTitle') + t('monitor.restart'), '', {
        type: 'warning',
        confirmButtonText: t('common.ok'),
        callback: (action: Action) => {
          if (action == 'confirm') {
            startRestartDeployment()
          }
        }
      })
      break
    case 'delete':
      ElMessageBox.confirm(t('monitor.delete_deployment_confirm'), t('common.confirmMsgTitle'), {
        confirmButtonText: t('common.ok'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }).then(() => {
        deleteDeploymentApi(nodeTabSelected.value, command.form.id)
      })
      break
  }
}

class autoRefreshDeployments {
  intervalId: NodeJS.Timer | null = null

  startTimer() {
    this.intervalId = setInterval(() => {
      repoSelected(false)
    }, 5000)
  }

  stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}

const deploymentsRefresh = ref<autoRefreshDeployments>()

onMounted(() => {
  getOrganizations()
  getK8sRepoList(true)
  deploymentsRefresh.value = new autoRefreshDeployments()
  deploymentsRefresh.value.startTimer()
})
onUnmounted(() => {
  deploymentsRefresh.value!.stopTimer()
})

const visibilityStore = useVisibilityStore()
const auth = computed(() => visibilityStore.getAuthCodes)

// 防止手动页面刷新后状态丢失
watchEffect(async () => {
  await visibilityStore.setAuthCodes()
})

const currentNode = ref<AppData[]>([])
const filterKeywords = ref('')
const filterData = computed(() => {
  if (currentNode.value) {
    return currentNode.value.filter(
      (data) =>
        !filterKeywords.value ||
        data.name.toLowerCase().includes(filterKeywords.value.toLowerCase())
    )
  } else {
    return []
  }
})
</script>

<template>
  <ElDialog
    v-model="podsDetailDlgVisible"
    :title="t('monitor.pods_detail')"
    draggable
    width="280px"
  >
    <ElFormItem>
      <ElCol :span="17">
        <ElInputNumber v-model="replicasNum" :max="100" :min="0" />
      </ElCol>
      <ElCol :span="1" />
      <ElCol v-if="auth.includes(AuthCodes.ResourceMonitorScale)" :span="5">
        <ElButton type="success" @click="startScaleReplicas">{{ t('monitor.start') }}</ElButton>
      </ElCol>
    </ElFormItem>
  </ElDialog>
  <ElDialog v-model="scaleDlgVisible" :title="t('monitor.scale')" draggable width="280px">
    <ElFormItem>
      <ElCol :span="17">
        <ElInputNumber v-model="replicasNum" :max="100" :min="0" />
      </ElCol>
      <ElCol :span="1" />
      <ElCol :span="5">
        <ElButton type="success" @click="startScaleReplicas">{{ t('monitor.start') }}</ElButton>
      </ElCol>
    </ElFormItem>
  </ElDialog>
  <Error v-if="k8sWithApp.length === 0" type="k8srepo_empty" @error-click="() => {}" />
  <ElRow v-if="k8sWithApp.length > 0" justify="space-between">
    <ElCol :span="18">
      <ElSpace wrap>
        <span class="header_title">{{ t('router.monitor') }}</span>
        <ElDivider direction="vertical" />
        <ElInput
          v-model="filterKeywords"
          :placeholder="t('monitor.appName')"
          :suffix-icon="Search"
          clearable
        />
      </ElSpace>
    </ElCol>
    <ElCol :span="6" style="text-align: right">
      <ElButton :disabled="reloadingApps" :icon="Refresh" type="success" @click="repoSelected(true)"
        >{{ t('monitor.refresh') }}
      </ElButton>
    </ElCol>
  </ElRow>
  <ElTabs
    v-if="k8sWithApp.length > 0"
    v-model="selectedRepoTab"
    class="nodes-tabs"
    tab-position="left"
    @tab-change="repoSelected(true)"
  >
    <ElTabPane v-for="node in k8sWithApp" :key="node.id" style="padding: 20px">
      <template #label>
        <div
          :class="isFirstTabInit(node) ? 'node-tab-focus' : ''"
          @click="nodeTabSelected = node.id"
          @mouseleave="nodeTabHover = 0"
          @mouseover="nodeTabHover = node.id"
        >
          <ElSpace :size="10" alignment="center" style="width: 200px">
            <Icon
              :color="GetIcon(node.type)[1]"
              :icon="GetIcon(node.type)[0]"
              height="40"
              style="margin-top: 0"
              width="40"
            />
            <div style="height: 80px; margin-top: 4px">
              <div style="margin: -15px 0 0 5px; height: 40px; text-align: left"
                >{{ node.name }}
              </div>
              <div
                style="
                  margin: -10px 0 0 5px;
                  height: 40px;
                  font-size: 12px;
                  color: #606c80;
                  text-align: left;
                "
              >
                <span>ver: {{ node.serverVersion }} </span></div
              >
            </div>
          </ElSpace>
        </div>
      </template>
      <ElSpace :size="10" alignment="start" direction="vertical" fill fill-ratio="100">
        <span class="header_title">{{ node.name }}</span>
        <div v-if="node.type === NodeType.K8s">
          <ElTable :data="filterData" style="width: 100%">
            <ElTableColumn :label="t('monitor.appName')" fixed prop="name" width="250">
              <template #default="scope">
                <ElLink :underline="false">{{ scope.row.name }}</ElLink>
              </template>
            </ElTableColumn>
            <ElTableColumn
              :filter-method="nsFilterHandler"
              :filters="namespacesPair"
              :label="t('monitor.namespace')"
              fixed
              prop="namespace"
              width="180"
            >
              <template #default="scope">
                <ElTag round type="success">
                  {{ scope.row.namespace }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn :label="t('monitor.pod_number')" fixed prop="pods" width="120">
              <template #default="scope">
                {{ scope.row.availablePods }} /
                {{ scope.row.availablePods + scope.row.unavailablePods }}
              </template>
            </ElTableColumn>
            <ElTableColumn :label="t('monitor.replicas')" fixed prop="replicas" width="120">
              <template #default="scope">
                {{ scope.row.replicas }}
              </template>
            </ElTableColumn>
            <ElTableColumn :label="t('monitor.publish_time')" fixed prop="replicas" width="120">
              <template #default="scope">
                {{ calcAge(scope.row.createdAt) }}
              </template>
            </ElTableColumn>
            <ElTableColumn :label="t('monitor.conditions')" fixed prop="conditions" width="220">
              <template #default="scope">
                <ElTag
                  v-for="item in scope.row.conditions"
                  :key="item.type"
                  :type="
                    item.type === 'Available'
                      ? 'success'
                      : item.type === 'Progressing'
                      ? 'primary'
                      : 'danger'
                  "
                  effect="dark"
                  round
                  size="small"
                  style="margin-right: 10px"
                >
                  {{ item.type }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn :label="t('monitor.action')" fixed="right" prop="id" width="80">
              <template #default="scope">
                <ElDropdown @command="actionHandler">
                  <span class="el-dropdown-link">
                    <ElButton :icon="MoreFilled" circle />
                  </span>
                  <template #dropdown>
                    <ElDropdownMenu>
                      <ElDropdownItem :command="{ id: scope.row.id, cmd: 'view', form: scope.row }">
                        <ElLink :icon="Expand" :underline="false">
                          {{ t('common.viewDetail') }}
                        </ElLink>
                      </ElDropdownItem>
                      <ElDropdownItem
                        v-if="auth.includes(AuthCodes.ResourceMonitorScale)"
                        :command="{ id: scope.row.id, cmd: 'scale', form: scope.row }"
                      >
                        <ElLink :underline="false">
                          <Icon icon="fluent:scale-fill-24-regular" style="margin-right: 5px" />
                          {{ t('monitor.scale') }}
                        </ElLink>
                      </ElDropdownItem>
                      <ElDropdownItem
                        v-if="auth.includes(AuthCodes.ResourceMonitorRestart)"
                        :command="{ id: scope.row.id, cmd: 'restart', form: scope.row }"
                      >
                        <ElLink :icon="RefreshRight" :underline="false">
                          {{ t('monitor.restart') }}
                        </ElLink>
                      </ElDropdownItem>
                      <ElDropdownItem
                        v-if="auth.includes(AuthCodes.ResourceMonitorDelete)"
                        :command="{ id: scope.row.id, cmd: 'delete', form: scope.row }"
                        divided
                      >
                        <ElLink :icon="Delete" :underline="false" type="danger">
                          {{ t('monitor.delete_deployment') }}
                        </ElLink>
                      </ElDropdownItem>
                    </ElDropdownMenu>
                  </template>
                </ElDropdown>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
      </ElSpace>
    </ElTabPane>
  </ElTabs>
</template>
<style scoped>
.tab-action {
  position: relative;
  top: 32px;
  cursor: pointer;
  font-size: 12px;
  color: rgb(96, 108, 128);
}

.header_title {
  font-size: 18px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.nodes-tabs {
  background-color: #fff;
  margin: 10px 0 10px 0;
  height: 800px;
}

.radio-sel {
  border: solid 1px #dadfe6;
  text-align: center;
  display: inline-block;
  width: 80px;
  height: 80px;
  position: relative;
}

.radio-sel > svg {
  margin: 6px 18px 0 18px;
}

.radio-sel-hover {
  border: solid 1px #06f;
  cursor: pointer;
}

.radio-sel-hover-disabled {
  cursor: not-allowed;
}

.radio-sel-selected::before {
  content: '';
  position: absolute;
  display: inline-block;
  top: -16px;
  right: -16px;
  border: solid 16px transparent;
  border-bottom-color: #06f;
  transform: rotate(45deg);
}

.radio-sel-selected::after {
  content: '';
  position: absolute;
  display: inline-block;
  right: 0;
  top: 0;
  width: 12px;
  height: 12px;
  background: url(data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjE4IiB3aWR0aD0iMTgiIGZpbGw9IiNmZmYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE2LjAzMSAzLjM0aC0xLjIyOGEuNTYuNTYgMCAwMC0uNDQyLjIxNGwtNy4yNDcgOS4xODEtMy40NzUtNC40MDNhLjU2Mi41NjIgMCAwMC0uNDQyLS4yMTRIMS45N2EuMTQuMTQgMCAwMC0uMTExLjIyNmw0LjgxNSA2LjFhLjU2NC41NjQgMCAwMC44ODQgMGw4LjU4NS0xMC44OGEuMTQuMTQgMCAwMC0uMTEtLjIyNHoiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==)
    no-repeat 50%/100%;
}

.el-tabs {
  --el-tabs-header-height: 80px;
}

.node-tab-focus {
  background-color: rgb(245, 247, 250);
  margin: 0 -18px 0 -20px;
  padding: 0 18px 0 20px;
  border-bottom-color: #fff;
}
</style>
