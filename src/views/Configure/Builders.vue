<script setup lang="ts">
import { useI18n } from '@/hooks/web/useI18n'
import { ref } from 'vue'
import { ElButton, ElDivider, ElMessage, FormInstance, FormRules } from 'element-plus'
import { Connection, Delete, Expand, InfoFilled, MoreFilled, Search } from '@element-plus/icons-vue'
import { Error } from '@/components/Error'
import { BuilderNodesOnk8s, NewBuilderNodes, NodeType, Params } from '@/api/configure/types'
import {
  getBuilderNodesOnK8sApi,
  installBuilderNodeOnK8s,
  uninstallBuildNodeApi,
  updateBuildNodeApi
} from '@/api/configure/builder'
import { Org } from '@/api/common/types'
import { getOrganizationsApi } from '@/api/common'
import { ElMessageBox } from 'element-plus/es'

const bindDialogVisible = ref(false)

const { t } = useI18n()

const Organizations = ref<Array<Org>>(new Array<Org>())

class autoRefreshNodes {
  intervalId: any | null = null

  startTimer() {
    this.intervalId = setInterval(() => {
      // 执行需要重复执行的代码
    }, 1000) // 1秒钟执行一次
  }

  stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}
new autoRefreshNodes().startTimer()
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

getOrganizations()

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
    :title="t('builder.install')"
    :fullscreen="false"
    :draggable="true"
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
          label-position="top"
          :model="newBuilderNode"
          ref="newBuilderNodeRef"
          :rules="newBuilderNodeRule"
        >
          <ElFormItem :label="t('builder.node_name')" prop="name">
            <ElInput :disabled="!dlgForCreate" v-model="newBuilderNode.name" />
          </ElFormItem>
          <ElFormItem prop="orgs" :label="t('common.organization')">
            <ElSelect multiple v-model="newBuilderNode.orgs" style="width: 100%">
              <ElOption
                v-for="org in Organizations"
                :key="org.id"
                :label="org.name"
                :value="org.id"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem :label="t('builder.max_worker')">
            <ElInputNumber :min="1" controls-position="right" v-model="newBuilderNode.maxWorkers" />
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
              placeholder="gotocloud-agent"
              :disabled="!dlgForCreate"
              v-model="newBuilderNode.workspace"
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
              type="textarea"
              :placeholder="kubeconfig_demo"
              :disabled="!dlgForCreate"
              v-model="newBuilderNode.kubeConfig"
              :autosize="{ minRows: 3, maxRows: 6 }"
            />
          </ElFormItem>
          <ElFormItem prop="remark">
            <template #label>
              {{ t('common.remark') }}
            </template>
            <ElInput
              type="textarea"
              v-model="newBuilderNode.remark"
              :autosize="{ minRows: 3, maxRows: 6 }"
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
        <ElButton @click="bindDialogVisible = false">{{ t('common.cancel') }}</ElButton>
        <ElButton v-if="dlgForCreate" type="primary" @click="submit()">{{
          t('common.install')
        }}</ElButton>
        <ElButton v-if="!dlgForCreate" type="primary" @click="update()">{{
          t('common.update')
        }}</ElButton>
      </span>
    </template>
  </ElDialog>
  <ElRow justify="space-between" v-if="builderNodesOnK8s.length > 0">
    <ElCol :span="18">
      <ElSpace wrap>
        <span class="header_title">{{ t('router.builders') }}</span>
        <ElDivider direction="vertical" />
        <ElInput
          v-model="keywords"
          :placeholder="t('builder.name')"
          :suffix-icon="Search"
          clearable
        />
      </ElSpace>
    </ElCol>
    <ElCol :span="6" style="text-align: right">
      <ElButton :icon="Connection" type="primary" @click="bindDialogVisible = true"
        >{{ t('builder.install') }}
      </ElButton>
    </ElCol>
  </ElRow>
  <ElTabs v-if="builderNodesOnK8s.length > 0">
    <ElTabPane :label="t('builder.all')">
      <ElTable style="width: 100%" :data="builderNodesOnK8s">
        <ElTableColumn prop="name" :label="t('builder.node_name')" width="350">
          <template #default="scope">
            <ElSpace>
              <Icon
                :icon="GetIcon(scope.row.nodeType)[0]"
                :color="GetIcon(scope.row.nodeType)[1]"
                width="24"
                height="24"
              />
              <span>{{ scope.row.name }}</span>
            </ElSpace>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="remark" :label="t('builder.workload')" width="300">
          <template #default="scope">
            {{ t('builder.available_nodes_number') }}: {{ scope.row.availableWorkers }} /
            {{ scope.row.maxWorkers }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="pod_status" :label="t('builder.node_status')" width="300">
          n个指示灯
        </ElTableColumn>
        <ElTableColumn :label="t('common.organization')" prop="orgLites">
          <template #default="scope">
            <ElSpace>
              <ElTag
                style="cursor: default"
                v-for="item in scope.row.orgLites"
                :key="item.orgId"
                :closable="false"
                >{{ item.orgName }}
              </ElTag>
            </ElSpace>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="remark" :label="t('common.remark')" width="300" />
        <ElTableColumn fixed="right" prop="id" :label="t('coderepo.action')" width="80">
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
                  <ElDropdownItem divided :command="{ id: scope.row.id, cmd: 'del' }">
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
