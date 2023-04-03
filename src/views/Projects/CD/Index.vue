<script lang="ts" setup>
import { ElButton, ElMessage, ElNotification, FormInstance, FormRules } from 'element-plus'
import { CirclePlus, Delete, MoreFilled, Plus, Search } from '@element-plus/icons-vue'
import { ContentDetailWrap } from '@/components/ContentDetailWrap'
import { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/hooks/web/useI18n'
import { computed, onMounted, onUnmounted, reactive, ref, watchEffect } from 'vue'
import { DeploymentApps } from '@/api/projects/types'
import { useAxios } from '@/hooks/web/useAxios'
import { newDeployment, startRollback } from '@/api/projects'
import Icon from '@/components/Icon/src/Icon.vue'
import { ElMessageBox } from 'element-plus/es'
import { useVisibilityStore } from '@/store/modules/visibility'
import { AuthCodes } from '@/api/constants/auths'

const { t } = useI18n()
const { path, params } = useRoute()
const { push } = useRouter()
const request = useAxios()
const k8sRepos = ref<KeyValuePair[]>([])
const namespaces = ref<string[]>([])
const namespacesPair = ref<TextValuePair[]>([])
const formSize = ref('default')
const enableLimit = ref(false)
const deploymentsData = ref<DeploymentApps[]>([])
const deploymentHistoryData = ref<DeploymentApps[]>([])
const artifacts = ref<KeyValuePair[]>([])
const imageTags = ref<string[]>([])

interface KeyValuePair {
  id: number
  name: string
}

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

const env = reactive<TextValuePair[]>([
  {
    text: '',
    value: ''
  }
])
const addVars = () => {
  env.push({
    text: '',
    value: ''
  })
}
const removeVars = (index: number) => {
  if (env.length > 1) {
    env.splice(index, 1)
  }
}
const ports = reactive<{ portMapping: TextValuePair[] }>({
  portMapping: [
    {
      text: '80',
      value: '80'
    }
  ]
})

const addPorts = () => {
  ports.portMapping.push({
    text: '',
    value: ''
  })
}
const removePort = (index: number) => {
  if (ports.portMapping.length > 1) {
    ports.portMapping.splice(index, 1)
  }
}

const tplDialogVisible = ref(false)
const historyDlgVisible = ref(false)
const historyLoading = ref(true)

const showNewDeploymentDlg = () => {
  ports.portMapping = [
    {
      text: '80',
      value: '80'
    }
  ]
  tplDialogVisible.value = true
}

const ruleForm = reactive({
  id: 0,
  k8s: '',
  namespace: '',
  artifact: null,
  artifactTag: '',
  replicate: 1,
  healthcheck: '/healthz',
  healthcheckPort: '80',
  enableLimit: enableLimit,
  cpuLimits: '1000',
  cpuRequest: '500',
  memLimits: '2000',
  memRequest: '200',
  ports: ports.portMapping,
  env: env,
  lastDeployAt: null
})

const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules>({
  k8s: [
    { required: true, message: t('common.selectText') + t('project.cd.namespace'), trigger: 'blur' }
  ],
  namespace: [
    { required: true, message: t('common.selectText') + t('project.cd.namespace'), trigger: 'blur' }
  ],
  artifact: [
    {
      required: true,
      message: t('common.selectText') + t('project.cd.artifact_name'),
      trigger: 'blur'
    }
  ],
  version: [
    {
      required: true,
      message: t('common.selectText') + t('project.cd.deploy_version'),
      trigger: 'blur'
    }
  ]
})

const getDeploymentList = async () => {
  let projectId = Number(params.id)
  const rlt = await request.get({
    url: '/projects/' + projectId + '/deploy/apps'
  })
  deploymentsData.value = rlt.data.data
}

const getDeploymentHistory = async (deploymentId): Promise<DeploymentApps[]> => {
  let projectId = Number(params.id)
  const rlt = await request.get({
    url: '/projects/' + projectId + '/deploy/app/' + deploymentId + '/history'
  })
  return rlt.data.data
}
const getK8sRepo = async () => {
  let projectId = Number(params.id)
  const rlt = await request.get({
    url: '/projects/' + projectId + '/deploy/env'
  })
  k8sRepos.value = rlt.data.data
}
const k8sRepoSelected = async function (val: number) {
  let projectId = Number(params.id)
  const rlt = await request.get({
    url: '/projects/' + projectId + '/deploy/' + val + '/namespaces'
  })
  namespaces.value = rlt.data.data
}

let timeout: NodeJS.Timeout
const queryArtifacts = async (queryString: string) => {
  if (queryString) {
    let projectId = Number(params.id)
    const res = await request.get({
      url: '/projects/' + projectId + '/artifacts/' + queryString
    })

    clearTimeout(timeout)
    timeout = setTimeout(() => {
      artifacts.value = res.data.data
    }, 10)
  } else {
    artifacts.value = []
  }
}

const artifactSelected = async () => {
  let projectId = Number(params.id)
  const res = await request.get({
    url: '/projects/' + projectId + '/artifact/' + ruleForm.artifact + '/tags'
  })
  imageTags.value = res.data.data
}
const submit = async (formEl: FormInstance, launch: boolean) => {
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      let projectId = Number(params.id)
      ruleForm.ports = ports.portMapping
      return await newDeployment(projectId, ruleForm, launch).then(async (res) => {
        if (res.success) {
          ElMessage({
            type: 'success',
            message: t('common.save') + t('common.success')
          })
          await getDeploymentList()
          tplDialogVisible.value = false
        } else {
          ElMessage.error(t('common.save') + t('common.failed'))
        }
      })
    }
  })
}

interface HandlerCommand {
  id: number
  cmd: string
  form: DeploymentApps | null
}

const actionHandler = (command: HandlerCommand) => {
  switch (command.cmd) {
    case 'del': {
      ElMessageBox.confirm(t('project.cd.deleteConfirm'), t('common.confirmMsgTitle'), {
        confirmButtonText: t('common.ok'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }).then(() => {
        let projectId = Number(params.id)
        const rlt = request
          .delete({
            url: '/projects/' + projectId + '/deploy/' + command.id
          })
          .then(() => getDeploymentList())
      })
      break
    }
    case 'deploy': {
      let projectId = Number(params.id)
      const rlt = request
        .put({
          url: '/projects/' + projectId + '/deploy/' + command.id
        })
        .then(() => {
          ElNotification({
            title: t('common.success'),
            message: t('project.cd.start_deploy'),
            type: 'success'
          })
          getDeploymentList()
        })
      break
    }
    case 'history': {
      historyDlgVisible.value = true
      historyLoading.value = true
      getDeploymentHistory(command.id)
        .then((resp) => {
          deploymentHistoryData.value = resp
        })
        .finally(() => {
          setTimeout(() => {
            historyLoading.value = false
          }, 500)
        })
      break
    }
    case 'jump_to_monitor': {
      push(
        '/monitor/' +
          command.form!.k8s +
          '/pods?from=' +
          command.form!.id +
          '&redirect=/projects/cd/' +
          params.id
      )
      break
    }
  }
}

const tooltipRollbackTo = (a: any): string => {
  return t('project.cd.rollback_to') + a.artifactTag
}
const canRollback = (a: any): boolean => {
  return a.lastDeployAt !== deploymentHistoryData.value[0].lastDeployAt
}

const rollback = async (historyId: number, deploymentId: number) => {
  let projectId = Number(params.id)
  return await startRollback(projectId, historyId, deploymentId).then(async (rlt) => {
    if (rlt) {
      ElNotification({
        title: t('common.success'),
        message: t('project.cd.start_deploy'),
        type: 'success'
      })
      await getDeploymentList()
      historyDlgVisible.value = false
    } else {
      ElNotification({
        title: t('common.failed'),
        message: t('project.cd.deploy_failed'),
        type: 'warning'
      })
    }
  })
}

onMounted(() => {
  getDeploymentList()
  getK8sRepo()
})
onUnmounted(() => {})

const visibilityStore = useVisibilityStore()
const auth = computed(() => visibilityStore.getAuthCodes)

// 防止手动页面刷新后状态丢失
watchEffect(async () => {
  await visibilityStore.setAuthCodes()
})

const filterKeywords = ref('')
const filterData = computed(() => {
  return deploymentsData.value.filter(
    (data) =>
      !filterKeywords.value ||
      data.artifactName.toLowerCase().includes(filterKeywords.value.toLowerCase()) ||
      data.k8sName.toLowerCase().includes(filterKeywords.value.toLowerCase())
  )
})
</script>
<template>
  <ElDialog
    v-model="historyDlgVisible"
    :title="t('project.cd.deploy_history')"
    draggable
    width="90%"
  >
    <ElSkeleton :loading="historyLoading" animated>
      <template #template>
        <ElSkeletonItem style="margin-right: 16px" variant="text" />
        <ElSkeletonItem style="width: 30%" variant="text" />
        <ElSkeletonItem style="margin-right: 16px" variant="text" />
        <ElSkeletonItem style="width: 30%" variant="text" />
        <ElSkeletonItem style="margin-right: 16px" variant="text" />
        <ElSkeletonItem style="width: 30%" variant="text" />
      </template>
      <template #default>
        <ElTable :data="deploymentHistoryData" style="width: 100%">
          <ElTableColumn :label="t('project.cd.deployed_at')" width="180">
            <template #default="scope">
              {{ scope.row.lastDeployAt }}
            </template>
          </ElTableColumn>
          <ElTableColumn
            :filter-method="nsFilterHandler"
            :filters="namespacesPair"
            :label="t('project.cd.target_env')"
            prop="k8sName"
            width="180"
          />
          <ElTableColumn
            :filter-method="nsFilterHandler"
            :filters="namespacesPair"
            :label="t('project.cd.namespace')"
            prop="namespace"
            width="180"
          />
          <ElTableColumn :label="t('project.cd.artifact_name')" width="250">
            <template #default="scope">
              {{ scope.row.artifactName }}
              <ElDivider direction="vertical" />
              <ElTag v-if="scope.row.artifactTag === 'latest'" effect="light" type="success"
                >{{ t('project.cd.deploy_version_latest') }}
              </ElTag>
              <ElTag v-if="scope.row.artifactTag !== 'latest'" effect="dark"
                >{{ scope.row.artifactTag }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn :label="t('project.cd.env_vars')" width="200">
            <template #default="scope">
              <ElRow>
                <ElCol v-for="(vars, index) in scope.row.env" :key="vars" :span="24">
                  <ElTag v-if="index <= 2" style="margin: 3px"
                    >{{ vars.text }}:{{ vars.value }}
                  </ElTag>
                  <span v-if="index > 2">...</span>
                </ElCol>
              </ElRow>
            </template>
          </ElTableColumn>
          <ElTableColumn :label="t('project.cd.port_mapping')" width="180">
            <template #default="scope">
              <ElRow>
                <ElCol v-for="(port, index) in scope.row.ports" :key="port" :span="24">
                  <ElTag v-if="index <= 2" style="margin: 3px"
                    >{{ port.text }}:{{ port.value }}
                  </ElTag>
                  <span v-if="index > 2">...</span>
                </ElCol>
              </ElRow>
            </template>
          </ElTableColumn>
          <ElTableColumn width="80">
            <template #default="scope">
              <ElTooltip
                v-if="canRollback(scope.row)"
                :content="tooltipRollbackTo(scope.row)"
                placement="right"
              >
                <ElButton @click="rollback(scope.row.id, scope.row.deploymentId)">
                  <Icon icon="eos-icons:snapshot-rollback" />
                </ElButton>
              </ElTooltip>
            </template>
          </ElTableColumn>
        </ElTable>
      </template>
    </ElSkeleton>
  </ElDialog>
  <ElDialog v-model="tplDialogVisible" :size="formSize" :title="t('project.cd.new_app')" draggable>
    <div style="height: 500px">
      <ElScrollbar>
        <ElForm ref="ruleFormRef" :model="ruleForm" :rules="rules" label-position="top">
          <ElSpace>
            <ElFormItem :label="t('project.cd.target_env')" prop="k8s" style="margin-right: 8px">
              <ElSelect
                v-model="ruleForm.k8s"
                :placeholder="t('common.selectText') + t('project.cd.target_env')"
                style="width: 200px"
                @change="k8sRepoSelected"
              >
                <ElOption
                  v-for="item in k8sRepos"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </ElSelect>
            </ElFormItem>
            <ElFormItem
              :label="t('project.cd.namespace')"
              prop="namespace"
              style="margin-right: 8px"
            >
              <ElSelect
                v-model="ruleForm.namespace"
                :disabled="ruleForm.k8s === ''"
                :placeholder="t('common.selectText') + t('project.cd.namespace')"
                allow-create
                filterable
                style="width: 200px"
              >
                <ElOption v-for="item in namespaces" :key="item" :label="item" :value="item" />
              </ElSelect>
            </ElFormItem>
          </ElSpace>
          <ElFormItem :label="t('project.cd.artifact_name')" prop="artifact">
            <ElSelect
              v-model="ruleForm.artifact"
              :placeholder="t('common.selectText') + t('project.cd.artifact_name')"
              :remote-method="queryArtifacts"
              filterable
              remote
              style="width: 200px"
              value-key="id"
              @change="artifactSelected"
            >
              <ElOption
                v-for="item in artifacts"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem :label="t('project.cd.deploy_version')" prop="tag">
            <ElSelect
              v-model="ruleForm.artifactTag"
              :disabled="ruleForm.artifact == null"
              :placeholder="t('common.selectText') + t('project.cd.deploy_version')"
              class="inline-input w-50"
              style="width: 200px"
            >
              <ElOptionGroup label="最新版本">
                <ElOption key="latest" label="latest" value="latest" />
              </ElOptionGroup>
              <ElOptionGroup label="固定版本">
                <ElOption v-for="item in imageTags" :key="item" :label="item" :value="item" />
              </ElOptionGroup>
            </ElSelect>
          </ElFormItem>
          <ElFormItem :label="t('project.cd.replicate_num')" prop="replicate">
            <ElInputNumber v-model="ruleForm.replicate" :min="1" style="width: 200px" />
          </ElFormItem>
          <ElFormItem :label="t('project.cd.port_mapping')">
            <ElSpace :size="10" direction="vertical">
              <ElFormItem v-for="(port, index) in ports.portMapping" :key="port.text">
                <ElCol :span="8">
                  <ElInput
                    v-model="port.text"
                    :controls="false"
                    :max="65535"
                    :min="1"
                    class="w-50"
                    placeholder="80"
                  >
                    <template #prepend>{{ t('project.cd.service_port') }}</template>
                  </ElInput>
                </ElCol>
                <ElCol :span="1" class="text-center" />
                <ElCol :span="8">
                  <ElInput
                    v-model="port.value"
                    :controls="false"
                    class="w-50"
                    placeholder="80"
                    :max="65535"
                    :min="1"
                  >
                    <template #prepend>{{ t('project.cd.container_port') }}</template>
                  </ElInput>
                </ElCol>
                <ElCol :span="2">
                  <ElButton
                    :icon="Plus"
                    circle
                    plain
                    style="margin-left: 10px"
                    type="primary"
                    @click="addPorts"
                  />
                </ElCol>
                <ElCol :span="2">
                  <ElButton
                    v-if="ports.portMapping.length <= 1"
                    :icon="Delete"
                    circle
                    disabled
                    plain
                    style="margin-left: 10px"
                    type="danger"
                  />
                  <ElButton
                    v-if="ports.portMapping.length > 1"
                    :icon="Delete"
                    circle
                    plain
                    style="margin-left: 10px"
                    type="danger"
                    @click="removePort(index)"
                  />
                </ElCol>
              </ElFormItem>
            </ElSpace>
          </ElFormItem>
          <ElFormItem :label="t('project.cd.env_vars')">
            <ElSpace :size="10" direction="vertical">
              <ElFormItem v-for="(vars, index) in env" :key="vars">
                <ElCol :span="8">
                  <ElInput
                    v-model="vars.text"
                    :controls="false"
                    :placeholder="t('project.cd.env_vars_key')"
                    class="w-50"
                  />
                </ElCol>
                <ElCol :span="1" class="text-center" />
                <ElCol :span="8">
                  <ElInput
                    v-model="vars.value"
                    :controls="false"
                    :placeholder="t('project.cd.env_vars_value')"
                    class="w-50"
                  />
                </ElCol>
                <ElCol :span="2">
                  <ElButton
                    :icon="Plus"
                    circle
                    plain
                    style="margin-left: 10px"
                    type="primary"
                    @click="addVars"
                  />
                </ElCol>
                <ElCol :span="2">
                  <ElButton
                    v-if="env.length <= 1"
                    :icon="Delete"
                    circle
                    disabled
                    plain
                    style="margin-left: 10px"
                    type="danger"
                  />
                  <ElButton
                    v-if="env.length > 1"
                    :icon="Delete"
                    circle
                    plain
                    style="margin-left: 10px"
                    type="danger"
                    @click="removeVars(index)"
                  />
                </ElCol>
              </ElFormItem>
            </ElSpace>
          </ElFormItem>
          <ElFormItem :label="t('project.cd.resource_limit.text')">
            <ElSpace direction="vertical" style="align-items: flex-start">
              <ElSwitch v-model="enableLimit" />
              <ElFormItem v-if="enableLimit">
                <ElCol :span="9">
                  <ElInput
                    v-model="ruleForm.cpuRequest"
                    :controls="false"
                    oninput="value=value.replace(/\D/g,'')"
                    placeholder="1000"
                  >
                    <template #prepend>{{ t('project.cd.resource_limit.cpu_request') }}</template>
                  </ElInput>
                </ElCol>
                <ElCol :span="1" />
                <ElCol :span="9">
                  <ElInput
                    v-model="ruleForm.cpuLimits"
                    :controls="false"
                    oninput="value=value.replace(/\D/g,'')"
                    placeholder="2000"
                  >
                    <template #prepend>{{ t('project.cd.resource_limit.cpu_limit') }}</template>
                  </ElInput>
                </ElCol>
              </ElFormItem>
              <ElFormItem v-if="enableLimit">
                <ElCol :span="9">
                  <ElInput
                    v-model="ruleForm.memRequest"
                    :controls="false"
                    oninput="value=value.replace(/\D/g,'')"
                    placeholder="500"
                  >
                    <template #prepend>{{ t('project.cd.resource_limit.mem_request') }}</template>
                  </ElInput>
                </ElCol>
                <ElCol :span="1" />
                <ElCol :span="9">
                  <ElInput
                    v-model="ruleForm.memLimits"
                    :controls="false"
                    oninput="value=value.replace(/\D/g,'')"
                    placeholder="2000"
                  >
                    <template #prepend>{{ t('project.cd.resource_limit.mem_limit') }}</template>
                  </ElInput>
                </ElCol>
              </ElFormItem>
            </ElSpace>
          </ElFormItem>

          <ElFormItem :label="t('project.cd.health_checker')">
            <ElCol :span="9">
              <ElInput
                v-model="ruleForm.healthcheck"
                :formatter="(value) => `/${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                :parser="(value) => value.replace(/\/\s?|(,*)/g, '')"
                :placeholder="t('project.cd.health_checker')"
              />
            </ElCol>
            <ElCol :span="1" class="text-center" />
            <ElCol :span="9">
              <ElFormItem prop="date2">
                <ElInput
                  v-model="ruleForm.healthcheckPort"
                  :controls="false"
                  :label="t('project.cd.health_checker_port')"
                  placeholder="80"
                >
                  <template #prepend>{{ t('project.cd.health_checker_port') }}</template>
                </ElInput>
              </ElFormItem>
            </ElCol>
          </ElFormItem>
        </ElForm>
      </ElScrollbar>
    </div>
    <template #footer>
      <ElButton @click="tplDialogVisible = false">{{ t('common.close') }}</ElButton>
      <ElButton type="primary" @click="submit(ruleFormRef, false)">
        {{ t('common.submit') }}
      </ElButton>
      <ElButton type="primary" @click="submit(ruleFormRef, true)">
        <Icon icon="ic:round-rocket-launch" style="margin-right: 5px" />
        {{ t('project.cd.submitAndDeploy') }}
      </ElButton>
    </template>
  </ElDialog>
  <ContentDetailWrap :title="t('project.toolset.cd')" @back="push('/projects/index')">
    <ElRow justify="space-between">
      <ElCol :span="18">
        <ElSpace wrap>
          <span class="header_title">{{ t('router.projects') }}</span>
          <ElDivider direction="vertical" />
          <ElInput
            v-model="filterKeywords"
            :placeholder="t('project.cd.app_name')"
            :suffix-icon="Search"
            clearable
          />
        </ElSpace>
      </ElCol>
      <ElCol v-if="auth.includes(AuthCodes.ResProjectCDNew)" :span="6" style="text-align: right">
        <ElButton :icon="CirclePlus" type="primary" @click="showNewDeploymentDlg">
          {{ t('project.cd.new_app') }}
        </ElButton>
      </ElCol>
    </ElRow>
    <ElDivider />
    <ElScrollbar max-height="500px">
      <ElSpace :size="30" wrap>
        <ElTable :data="filterData" style="width: 100%">
          <ElTableColumn
            :filter-method="nsFilterHandler"
            :filters="namespacesPair"
            :label="t('project.cd.target_env')"
            fixed
            prop="k8sName"
            width="180"
          />
          <ElTableColumn
            :filter-method="nsFilterHandler"
            :filters="namespacesPair"
            :label="t('project.cd.namespace')"
            fixed
            prop="namespace"
            width="180"
          />
          <ElTableColumn :label="t('project.cd.artifact_name')" fixed width="250">
            <template #default="scope">
              {{ scope.row.artifactName }}
              <ElDivider direction="vertical" />
              <ElTag v-if="scope.row.artifactTag === 'latest'" effect="light" type="success"
                >{{ t('project.cd.deploy_version_latest') }}
              </ElTag>
              <ElTag v-if="scope.row.artifactTag !== 'latest'" effect="dark"
                >{{ scope.row.artifactTag }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn :label="t('project.cd.env_vars')" width="200">
            <template #default="scope">
              <ElRow>
                <ElCol v-for="(vars, index) in scope.row.env" :key="vars" :span="24">
                  <ElTag v-if="index <= 2" style="margin: 3px"
                    >{{ vars.text }}:{{ vars.value }}
                  </ElTag>
                  <span v-if="index > 2">...</span>
                </ElCol>
              </ElRow>
            </template>
          </ElTableColumn>
          <ElTableColumn :label="t('project.cd.port_mapping')" width="200">
            <template #default="scope">
              <ElRow>
                <ElCol v-for="(port, index) in scope.row.ports" :key="port" :span="24">
                  <ElTag v-if="index <= 2" style="margin: 3px"
                    >{{ port.text }}:{{ port.value }}
                  </ElTag>
                  <span v-if="index > 2">...</span>
                </ElCol>
              </ElRow>
            </template>
          </ElTableColumn>
          <ElTableColumn :label="t('project.cd.last_deploy_at')" width="180">
            <template #default="scope">
              {{ scope.row.lastDeployAt }}
            </template>
          </ElTableColumn>
          <ElTableColumn
            v-if="
              auth.includes(AuthCodes.ResProjectCDStart) ||
              auth.includes(AuthCodes.ResProjectCDHistory) ||
              auth.includes(AuthCodes.ResProjectCDDelete) ||
              auth.includes(AuthCodes.ResProjectCDMonitor)
            "
            :label="t('project.cd.action')"
            align="center"
            fixed="right"
            width="120"
          >
            <template #default="scope">
              <ElDropdown @command="actionHandler">
                <span class="el-dropdown-link">
                  <ElButton :icon="MoreFilled" circle />
                </span>
                <template #dropdown>
                  <ElDropdownMenu>
                    <ElDropdownItem :command="{ id: scope.row.id, cmd: 'deploy' }">
                      <ElLink
                        v-if="
                          scope.row.lastDeployAt == null &&
                          auth.includes(AuthCodes.ResProjectCDStart)
                        "
                        :underline="false"
                      >
                        <Icon icon="material-symbols:play-circle" />
                        {{ t('project.cd.first_deploy') }}
                      </ElLink>
                      <ElLink
                        v-if="
                          scope.row.lastDeployAt != null &&
                          auth.includes(AuthCodes.ResProjectCDStart)
                        "
                        :underline="false"
                      >
                        <Icon icon="material-symbols:play-circle" />
                        {{ t('project.cd.redeploy') }}
                      </ElLink>
                    </ElDropdownItem>
                    <ElDropdownItem
                      v-if="auth.includes(AuthCodes.ResProjectCDHistory)"
                      :command="{ id: scope.row.id, cmd: 'history' }"
                    >
                      <ElLink :underline="false">
                        <Icon icon="icon-park-solid:history-query" />
                        {{ t('project.cd.deploy_history') }}
                      </ElLink>
                    </ElDropdownItem>
                    <ElDropdownItem
                      v-if="auth.includes(AuthCodes.ResProjectCDHistory)"
                      :command="{ id: scope.row.id, cmd: 'del' }"
                      divided
                    >
                      <ElLink :icon="Delete" :underline="false" type="danger">
                        {{ t('project.cd.delete_deployment') }}
                      </ElLink>
                    </ElDropdownItem>
                    <ElDropdownItem
                      v-if="
                        scope.row.lastDeployAt != null &&
                        auth.includes(AuthCodes.ResProjectCDMonitor)
                      "
                      :command="{ id: scope.row.id, cmd: 'jump_to_monitor', form: scope.row }"
                      divided
                    >
                      <ElLink :underline="false" type="primary">
                        <Icon icon="material-symbols:text-select-jump-to-end" />
                        {{ t('common.jump_to') + t('router.monitor') }}
                      </ElLink>
                    </ElDropdownItem>
                  </ElDropdownMenu>
                </template>
              </ElDropdown>
            </template>
          </ElTableColumn>
        </ElTable>
      </ElSpace>
    </ElScrollbar>
  </ContentDetailWrap>
</template>

<style scoped></style>
