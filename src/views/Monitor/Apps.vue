<script setup lang="ts">
import { useI18n } from '@/hooks/web/useI18n'
import { onMounted, ref } from 'vue'
import { ElButton, ElDivider, dayjs } from 'element-plus'
import {
  CopyDocument,
  Delete,
  Expand,
  MoreFilled,
  Refresh,
  Search,
  RefreshRight
} from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'
import { Error } from '@/components/Error'
import { Org } from '@/api/common/types'
import { getOrganizationsApi } from '@/api/common'
import { NodeType } from '@/api/configure/types'
import { getK8sRepoApi } from '@/api/configure/deploy'
import { calcAge, getAppsApi, scaleReplicasApi } from '@/api/monitor'
import { K8sRepoWithAppData } from '@/api/monitor/types'
import { DeploymentApps } from '@/api/projects/types'
import { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults'
import { useRoute } from 'vue-router'
import { timeout } from 'windicss-analysis'

const { path, params } = useRoute()

const { t } = useI18n()
const scaleDlgVisible = ref(false)
const loading = ref(true)
const keywords = ref('')
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
  reloadingApps.value = true
  for (let i = 0; i < k8sWithApp.value.length; i++) {
    if (k8sWithApp.value[i].id == nodeTabSelected.value) {
      const node = k8sWithApp.value[i]
      await getAppsApi(node.id, force).then((resp) => {
        node.items = resp
        reloadingApps.value = false
      })
      break
    }
  }
}

const getK8sRepoList = async () => {
  await getK8sRepoApi().then(async (resp) => {
    k8sWithApp.value = resp
    if (resp.length > 0 && selectedRepoTab.value === '-1') {
      selectedRepoTab.value = '0'
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

interface HandlerCommand {
  id: number
  cmd: string
  form: any
}

let timeout: NodeJS.Timeout
const startScaleReplicas = async () => {
  let k8sRepoId = nodeTabSelected.value
  await scaleReplicasApi(selectedDeploymentId.value, k8sRepoId, replicasNum.value).then((resp) => {
    if (resp.code == '200') {
      scaleDlgVisible.value = false
      repoSelected(true)
    }
  })
}

const actionHandler = (command: HandlerCommand) => {
  switch (command.cmd) {
    // case 'view':
    //   dlgForCreate.value = false
    //   bindDialogVisible.value = true
    //   let orgIds: Array<number> = []
    //   for (let i = 0; i < command.form.Data!.orgLites.length; i++) {
    //     orgIds.push(command.form.Data!.orgLites[i].orgId)
    //   }
    //   artifactRepoForm.value = {
    //     id: command.form.Data!.id,
    //     name: command.form.Data!.name,
    //     type: command.form.Data!.type,
    //     isSecurity: command.form.Data!.isSecurity,
    //     url: command.form.Data!.url,
    //     user: command.form.Data!.user,
    //     password: command.form.Data!.password,
    //     remark: command.form.Data!.remark,
    //     orgs: orgIds
    //   }
    //   break
    case 'scale':
      scaleDlgVisible.value = true
      replicasNum.value = command.form.replicas
      selectedDeploymentId.value = command.form.id
      break
    case 'restart':
      break
    case 'delete':
      break
  }
}

onMounted(() => {
  getOrganizations()
  getK8sRepoList()
})
</script>

<template>
  <ElDialog :title="t('monitor.scale')" v-model="scaleDlgVisible" width="280px" draggable>
    <ElFormItem>
      <ElCol :span="17">
        <ElInputNumber v-model="replicasNum" :min="0" :max="100" />
      </ElCol>
      <ElCol :span="1" />
      <ElCol :span="5">
        <ElButton type="success" @click="startScaleReplicas">{{ t('monitor.start') }}</ElButton>
      </ElCol>
    </ElFormItem>
  </ElDialog>
  <Error v-if="k8sWithApp.length == 0" type="k8srepo_empty" @error-click="() => {}" />
  <ElRow justify="space-between" v-if="k8sWithApp.length > 0">
    <ElCol :span="18">
      <ElSpace wrap>
        <span class="header_title">{{ t('router.monitor') }}</span>
        <ElDivider direction="vertical" />
        <ElInput
          v-model="keywords"
          :placeholder="t('monitor.appName')"
          :suffix-icon="Search"
          clearable
        />
      </ElSpace>
    </ElCol>
    <ElCol :span="6" style="text-align: right">
      <ElButton :disabled="reloadingApps" :icon="Refresh" @click="repoSelected(true)" type="success"
        >{{ t('monitor.refresh') }}
      </ElButton>
    </ElCol>
  </ElRow>
  <ElTabs
    v-if="k8sWithApp.length > 0"
    class="nodes-tabs"
    tab-position="left"
    @tab-change="repoSelected(true)"
    v-model="selectedRepoTab"
  >
    <ElTabPane v-for="node in k8sWithApp" :key="node.id" style="padding: 20px">
      <template #label>
        <div
          @mouseover="nodeTabHover = node.id"
          @mouseleave="nodeTabHover = 0"
          @click="nodeTabSelected = node.id"
          :class="isFirstTabInit(node) ? 'node-tab-focus' : ''"
        >
          <ElSpace :size="10" alignment="center" style="width: 200px">
            <Icon
              style="margin-top: 0"
              :icon="GetIcon(node.type)[0]"
              :color="GetIcon(node.type)[1]"
              width="40"
              height="40"
            />
            <div style="height: 80px; margin-top: 4px">
              <div style="margin: -15px 0 0 5px; height: 40px; text-align: left">{{
                node.name
              }}</div>
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
      <ElSpace :size="10" direction="vertical" alignment="start" fill fill-ratio="100">
        <span class="header_title">{{ node.name }}</span>
        <div v-if="node.type === NodeType.K8s">
          <ElTable :data="node.items" style="width: 100%">
            <ElTableColumn fixed prop="name" :label="t('monitor.appName')" width="250">
              <template #default="scope">
                <ElLink :underline="false">{{ scope.row.name }} </ElLink>
              </template>
            </ElTableColumn>
            <ElTableColumn
              fixed
              prop="namespace"
              :label="t('monitor.namespace')"
              width="180"
              :filters="namespacesPair"
              :filter-method="nsFilterHandler"
            >
              <template #default="scope">
                <ElTag round type="success">
                  {{ scope.row.namespace }}
                </ElTag>
              </template></ElTableColumn
            >
            <ElTableColumn fixed prop="pods" :label="t('monitor.pod_number')" width="120">
              <template #default="scope">
                {{ scope.row.availablePods }} /
                {{ scope.row.availablePods + scope.row.unavailablePods }}
              </template>
            </ElTableColumn>
            <ElTableColumn fixed prop="replicas" :label="t('monitor.replicas')" width="120">
              <template #default="scope">
                {{ scope.row.replicas }}
              </template>
            </ElTableColumn>
            <ElTableColumn fixed prop="replicas" :label="t('monitor.publish_time')" width="120">
              <template #default="scope">
                {{ calcAge(scope.row.createdAt) }}
              </template> </ElTableColumn
            ><ElTableColumn fixed prop="conditions" :label="t('monitor.conditions')" width="220">
              <template #default="scope">
                <ElTag
                  style="margin-right: 10px"
                  v-for="item in scope.row.conditions"
                  :key="item.type"
                  round
                  size="small"
                  effect="dark"
                  :type="
                    item.type == 'Available'
                      ? 'success'
                      : item.type == 'Progressing'
                      ? 'primary'
                      : 'danger'
                  "
                >
                  {{ item.type }}
                </ElTag>
              </template></ElTableColumn
            >
            <ElTableColumn fixed="right" prop="id" :label="t('monitor.action')" width="80">
              <template #default="scope">
                <ElDropdown @command="actionHandler">
                  <span class="el-dropdown-link">
                    <ElButton :icon="MoreFilled" circle />
                  </span>
                  <template #dropdown>
                    <ElDropdownMenu>
                      <ElDropdownItem>
                        <ElLink :icon="Expand" :underline="false">
                          {{ t('common.viewDetail') }}
                        </ElLink>
                      </ElDropdownItem>
                      <ElDropdownItem
                        :command="{ id: scope.row.id, cmd: 'scale', form: scope.row }"
                      >
                        <ElLink :underline="false">
                          <Icon icon="fluent:scale-fill-24-regular" style="margin-right: 5px" />
                          {{ t('monitor.scale') }}</ElLink
                        >
                      </ElDropdownItem>
                      <ElDropdownItem :command="{ id: scope.row.id, cmd: 'restart' }">
                        <ElLink :icon="RefreshRight" :underline="false">
                          {{ t('monitor.restart') }}</ElLink
                        >
                      </ElDropdownItem>
                      <ElDropdownItem divided :command="{ id: scope.row.id, cmd: 'delete' }">
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
