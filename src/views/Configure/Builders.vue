<script lang="ts" setup>
import { useI18n } from '@/hooks/web/useI18n'
import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { ElButton, ElDivider, ElMessage, FormInstance, FormRules } from 'element-plus'
import {
  Connection,
  Delete,
  Expand,
  InfoFilled,
  MoreFilled,
  Platform,
  Search
} from '@element-plus/icons-vue'
import { BuilderNodesOnk8s, NewBuilderNodes, NodeType, Params } from '@/api/configure/types'
import {
  getBuilderNodesOnK8sApi,
  installBuilderNodeOnK8s,
  uninstallBuildNodeApi,
  updateBuildNodeApi
} from '@/api/configure/builder'
import { Org } from '@/api/common/types'
import { getAvailableNodesApi, getOrganizationsApi } from '@/api/common'
import { ElMessageBox } from 'element-plus/es'
import { useVisibilityStore } from '@/store/modules/visibility'
import Error from '@/components/Error/src/Error.vue'
import { AuthCodes } from '@/api/constants/auths'

const bindDialogVisible = ref(false)
const { t } = useI18n()

const Organizations = ref<Array<Org>>(new Array<Org>())

const nodeRefresh = ref<autoRefreshNodes>()
onMounted(() => {
  nodeRefresh.value = new autoRefreshNodes()
  getOrganizations()
  nodeRefresh.value.startTimer()
  refreshNodes()
})
onUnmounted(() => {
  nodeRefresh.value!.stopTimer()
})

class autoRefreshNodes {
  intervalId: NodeJS.Timer | null = null

  startTimer() {
    this.intervalId = setInterval(() => {
      refreshNodes()
    }, 5000)
  }

  stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}

const refreshNodes = async () => {
  await getAvailableNodesApi().then((resp) => {
    if (resp!) {
      for (let i = 0; i < builderNodesOnK8s.value.length; i++) {
        const v = builderNodesOnK8s.value[i]
        for (let entry of resp.entries()) {
          if (v.id == entry[0]) {
            v.availableWorkers = entry[1]
            break
          }
        }
      }
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

function GetIcon(nodeType: NodeType) {
  switch (nodeType) {
    case NodeType.Docker:
      return ['logos:docker-icon', null]
    case NodeType.Windows:
      return ['logos:microsoft-windows', null]
    case NodeType.Linux:
      return ['flat-color-icons:linux', null]
    case NodeType.MacOS:
      return ['wpf:macos', null]
    case NodeType.K8s:
    default:
      return ['logos:kubernetes', null]
  }
}

const newBuilderNodeRef = ref<FormInstance>()
const newBuilderNode = ref<NewBuilderNodes>({
  id: 0,
  nodeType: 0,
  name: null,
  maxWorkers: 1,
  workspace: 'gotocloud-agent', // 工作空间，等同于k8s的namespace
  kubeConfig: null,
  remark: null,
  orgLites: [],
  orgs: []
})

function resetForm() {
  newBuilderNode.value = {
    id: 0,
    nodeType: 0,
    name: null,
    maxWorkers: 1,
    workspace: '', // 工作空间，等同于k8s的namespace
    kubeConfig: null,
    remark: null,
    orgLites: [],
    orgs: []
  }
}

const builderNodesOnK8s = ref<BuilderNodesOnk8s[]>([])
const getBuilderNodes = async function (params?: Params) {
  await getBuilderNodesOnK8sApi(
    params || {
      pageIndex: 1,
      pageSize: 20
    }
  ).then((resp) => {
    builderNodesOnK8s.value = resp
  })
}
getBuilderNodes()

const submit = async () => {
  if (!newBuilderNodeRef.value) return
  await newBuilderNodeRef.value.validate(async (valid, fields) => {
    if (valid) {
      await installBuilderNodeOnK8s(newBuilderNode.value)
        .then((resp) => {
          if (resp.success) {
            bindDialogVisible.value = false
            resetForm()
            getBuilderNodes()
          }
          resp.success
            ? ElMessage({
                type: 'success',
                message: t('builder.install_success'),
                showClose: true,
                center: true
              })
            : ElMessage({
                type: 'error',
                message: t('builder.install_failure'),
                showClose: true,
                center: true,
                grouping: true
              })
        })
        .catch(() => {
          ElMessage({
            type: 'error',
            message: t('builder.install_failure'),
            showClose: true,
            center: true
          })
        })
    }
  })
}
const update = async () => {
  if (!newBuilderNodeRef.value) return
  await newBuilderNodeRef.value.validate(async (valid, fields) => {
    if (valid) {
      await updateBuildNodeApi(newBuilderNode.value)
        .then((resp) => {
          if (resp.success) {
            bindDialogVisible.value = false
            resetForm()
            getBuilderNodes()
          }
          resp.success
            ? ElMessage({
                type: 'success',
                message: t('builder.update_success'),
                showClose: true,
                center: true
              })
            : ElMessage({
                type: 'error',
                message: t('builder.update_failure'),
                showClose: true,
                center: true,
                grouping: true
              })
        })
        .catch(() => {
          ElMessage({
            type: 'error',
            message: t('builder.update_failure'),
            showClose: true,
            center: true
          })
        })
    }
  })
}
const newBuilderNodeRule = ref<FormRules>({
  name: [
    {
      required: true,
      message: '',
      trigger: 'blur'
    }
  ],
  workspace: [
    {
      required: true,
      message: '',
      trigger: 'blur'
    }
  ],
  orgs: [
    {
      required: true,
      message: t('coderepo.at_least_one_org'),
      trigger: 'blur',
      validator: (rule, value) => {
        return (value as Array<Org>).length > 0
      }
    }
  ]
})

const kubeconfig_demo =
  'apiVersion: v1\n' +
  'clusters:\n' +
  '- cluster:\n' +
  '    certificate-authority-data: DATA+OMITTED\n' +
  '    server: https://host:port\n' +
  '  name: default\n' +
  'contexts:\n' +
  '- context:\n' +
  '    cluster: default\n' +
  '    user: default\n' +
  '  name: default\n' +
  'current-context: default\n' +
  'kind: Config\n' +
  'preferences: {}\n' +
  'users:\n' +
  '- name: default\n' +
  '  user:\n' +
  '    client-certificate-data: REDACTED\n' +
  '    client-key-data: REDACTED'

interface HandlerCommand {
  id: number
  cmd: string
  form: BuilderNodesOnk8s
}

const uninstallBuilderNode = async (nodeId: number) => {
  await uninstallBuildNodeApi(nodeId).then((resp) => {
    if (resp.success) {
      getBuilderNodes()
      ElMessage({
        showClose: true,
        message: t('builder.uninstall_success'),
        type: 'success'
      })
    } else {
      ElMessage({
        showClose: true,
        message: t('builder.uninstall_failure'),
        type: 'error'
      })
    }
  })
}

const dlgForCreate = ref<boolean>(true)
const actionHandler = (command: HandlerCommand) => {
  switch (command.cmd) {
    case 'del': {
      ElMessageBox.confirm(t('builder.uninstall_confirm'), t('common.confirmMsgTitle'), {
        confirmButtonText: t('common.ok'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }).then(() => {
        uninstallBuilderNode(command.id)
      })
      break
    }
    case 'view': {
      dlgForCreate.value = false
      bindDialogVisible.value = true
      let orgIds: Array<number> = []
      for (let i = 0; i < command.form.orgLites.length; i++) {
        orgIds.push(command.form.orgLites[i].orgId)
      }
      newBuilderNode.value = {
        id: command.form.id,
        name: command.form.name,
        maxWorkers: command.form.maxWorkers,
        workspace: command.form.workspace,
        kubeConfig: command.form.kubeConfig,
        remark: command.form.remark,
        orgs: orgIds,
        nodeType: command.form.nodeType,
        orgLites: command.form.orgLites
      }
      break
    }
  }
}

const describeContainerColor = (current: number, available: number): string => {
  if (current <= available) {
    return '#529578'
  } else {
    return '#B70707FF'
  }
}

const visibilityStore = useVisibilityStore()
const auth = computed(() => visibilityStore.getAuthCodes)

// 防止手动页面刷新后状态丢失
watchEffect(async () => {
  await visibilityStore.setAuthCodes()
})

const filterKeywords = ref('')
const filterData = computed(() => {
  return builderNodesOnK8s.value.filter(
    (data) =>
      !filterKeywords.value || data.name.toLowerCase().includes(filterKeywords.value.toLowerCase())
  )
})
</script>

<template>
  <Error
    v-if="builderNodesOnK8s.length === 0"
    type="builder_empty"
    @error-click="
      () => {
        bindDialogVisible = true
        dlgForCreate = true
      }
    "
  />
  <ElDialog
    v-model="bindDialogVisible"
    :draggable="true"
    :fullscreen="false"
    :title="t('builder.install')"
  >
    <ElTabs type="border-card">
      <ElTabPane>
        <template #label>
          K8S
          <ElTooltip :content="t('builder.introduce.install_on_k8s')">
            <ElIcon style="cursor: pointer">
              <InfoFilled />
            </ElIcon>
          </ElTooltip>
        </template>
        <ElForm
          ref="newBuilderNodeRef"
          :model="newBuilderNode"
          :rules="newBuilderNodeRule"
          label-position="top"
        >
          <ElFormItem :label="t('builder.node_name')" prop="name">
            <ElInput v-model="newBuilderNode.name" :disabled="!dlgForCreate" />
          </ElFormItem>
          <ElFormItem :label="t('common.organization')" prop="orgs">
            <ElSelect v-model="newBuilderNode.orgs" multiple style="width: 100%">
              <ElOption
                v-for="org in Organizations"
                :key="org.id"
                :label="org.name"
                :value="org.id"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem :label="t('builder.max_worker')">
            <ElInputNumber v-model="newBuilderNode.maxWorkers" :min="1" controls-position="right" />
          </ElFormItem>
          <ElFormItem prop="workspace">
            <template #label>
              {{ t('builder.node_type.k8s.namespace') }}
              <ElTooltip>
                <template #content> {{ t('builder.introduce.what_is_namespace') }}</template>
                <ElIcon style="cursor: pointer">
                  <InfoFilled />
                </ElIcon>
              </ElTooltip>
            </template>
            <ElInput
              v-model="newBuilderNode.workspace"
              :disabled="!dlgForCreate"
              placeholder="gotocloud-agent"
            />
          </ElFormItem>
          <ElFormItem prop="kubeconfig">
            <template #label>
              KubeConfig
              <ElTooltip>
                <template #content> {{ t('builder.introduce.where_is_kubeconfig') }}</template>
                <ElIcon style="cursor: pointer">
                  <InfoFilled />
                </ElIcon>
              </ElTooltip>
            </template>
            <ElInput
              v-model="newBuilderNode.kubeConfig"
              :autosize="{ minRows: 3, maxRows: 6 }"
              :disabled="!dlgForCreate"
              :placeholder="kubeconfig_demo"
              type="textarea"
            />
          </ElFormItem>
          <ElFormItem prop="remark">
            <template #label>
              {{ t('common.remark') }}
            </template>
            <ElInput
              v-model="newBuilderNode.remark"
              :autosize="{ minRows: 3, maxRows: 6 }"
              type="textarea"
            />
          </ElFormItem>
        </ElForm>
      </ElTabPane>
      <ElTabPane disabled>
        <template #label>
          Windows
          <ElTooltip :content="t('builder.introduce.install_on_windows')">
            <ElIcon style="cursor: pointer">
              <InfoFilled />
            </ElIcon>
          </ElTooltip>
        </template>
      </ElTabPane>
      <ElTabPane disabled>
        <template #label>
          Linux
          <ElTooltip :content="t('builder.introduce.install_on_linux')">
            <ElIcon style="cursor: pointer">
              <InfoFilled />
            </ElIcon>
          </ElTooltip>
        </template>
      </ElTabPane>
    </ElTabs>
    <template #footer>
      <span>
        <ElButton @click="bindDialogVisible = false">{{ t('common.close') }}</ElButton>
        <ElButton
          v-if="dlgForCreate && auth.includes(AuthCodes.ResConfigureBuildNodeBind)"
          type="primary"
          @click="submit()"
          >{{ t('common.install') }}</ElButton
        >
        <ElButton
          v-if="!dlgForCreate && auth.includes(AuthCodes.ResConfigureBuildNodeUpdate)"
          type="primary"
          @click="update()"
          >{{ t('common.update') }}</ElButton
        >
      </span>
    </template>
  </ElDialog>
  <ElRow v-if="builderNodesOnK8s.length > 0" justify="space-between">
    <ElCol :span="18">
      <ElSpace wrap>
        <span class="header_title">{{ t('router.builders') }}</span>
        <ElDivider direction="vertical" />
        <ElInput
          v-model="filterKeywords"
          :placeholder="t('builder.name')"
          :suffix-icon="Search"
          clearable
        />
      </ElSpace>
    </ElCol>
    <ElCol
      v-if="auth.includes(AuthCodes.ResConfigureBuildNodeBind)"
      :span="6"
      style="text-align: right"
    >
      <ElButton :icon="Connection" type="primary" @click="bindDialogVisible = true"
        >{{ t('builder.install') }}
      </ElButton>
    </ElCol>
  </ElRow>
  <ElTabs v-if="builderNodesOnK8s.length > 0">
    <ElTabPane :label="t('builder.all')">
      <ElTable :data="filterData" style="width: 100%">
        <ElTableColumn :label="t('builder.node_name')" prop="name" width="350">
          <template #default="scope">
            <ElSpace>
              <Icon
                :color="GetIcon(scope.row.nodeType)[1]"
                :icon="GetIcon(scope.row.nodeType)[0]"
                height="24"
                width="24"
              />
              <span>{{ scope.row.name }}</span>
            </ElSpace>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('builder.workload')" prop="remark" width="300">
          <template #default="scope">
            {{ t('builder.available_nodes_number') }}: {{ scope.row.availableWorkers }} /
            {{ scope.row.maxWorkers }}
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('builder.node_status')" prop="pod_status" width="300">
          <template #default="scope">
            <span v-for="s in scope.row.maxWorkers" :key="s"
              ><ElIcon :color="describeContainerColor(s, scope.row.availableWorkers)"
                ><Platform
              /></ElIcon>
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('common.organization')" prop="orgLites">
          <template #default="scope">
            <ElSpace>
              <ElTag
                v-for="item in scope.row.orgLites"
                :key="item.orgId"
                :closable="false"
                style="cursor: default"
                >{{ item.orgName }}
              </ElTag>
            </ElSpace>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('common.remark')" prop="remark" width="300" />
        <ElTableColumn :label="t('coderepo.action')" fixed="right" prop="id" width="80">
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
                    v-if="auth.includes(AuthCodes.ResConfigureBuildNodeRemove)"
                    :command="{ id: scope.row.id, cmd: 'del' }"
                    divided
                  >
                    <ElLink :icon="Delete" :underline="false" type="danger">
                      {{ t('builder.uninstall') }}
                    </ElLink>
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElTabPane>
  </ElTabs>
</template>
<style scoped></style>
