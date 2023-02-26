<script setup lang="ts">
import { ElButton, ElMessage, FormInstance, FormRules } from 'element-plus'
import { CirclePlus, Delete, Expand, MoreFilled, Plus, Search } from '@element-plus/icons-vue'
import { ContentDetailWrap } from '@/components/ContentDetailWrap'
import { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/hooks/web/useI18n'
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { DeploymentApps } from '@/api/projects/types'
import { useAxios } from '@/hooks/web/useAxios'
import { newDeployment } from '@/api/projects'
import Icon from '@/components/Icon/src/Icon.vue'
import { ElMessageBox } from 'element-plus/es'

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
        .then(() => getDeploymentList())
      break
    }
  }
}

onMounted(() => {
  getDeploymentList()
  getK8sRepo()
})
onUnmounted(() => {})
</script>
<template>
  <ElDialog v-model="tplDialogVisible" :title="t('project.cd.new_app')" draggable :size="formSize">
    <div style="height: 500px">
      <ElScrollbar>
        <ElForm label-position="top" :model="ruleForm" ref="ruleFormRef" :rules="rules">
          <ElSpace>
            <ElFormItem :label="t('project.cd.target_env')" prop="k8s" style="margin-right: 8px">
              <ElSelect
                v-model="ruleForm.k8s"
                @change="k8sRepoSelected"
                style="width: 200px"
                :placeholder="t('common.selectText') + t('project.cd.target_env')"
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
                :disabled="ruleForm.k8s === ''"
                style="width: 200px"
                v-model="ruleForm.namespace"
                allow-create
                filterable
                :placeholder="t('common.selectText') + t('project.cd.namespace')"
              >
                <ElOption v-for="item in namespaces" :key="item" :label="item" :value="item" />
              </ElSelect>
            </ElFormItem>
          </ElSpace>
          <ElFormItem :label="t('project.cd.artifact_name')" prop="artifact">
            <ElSelect
              style="width: 200px"
              v-model="ruleForm.artifact"
              value-key="id"
              :placeholder="t('common.selectText') + t('project.cd.artifact_name')"
              filterable
              remote
              :remote-method="queryArtifacts"
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
              :disabled="ruleForm.artifact == null"
              style="width: 200px"
              v-model="ruleForm.artifactTag"
              class="inline-input w-50"
              :placeholder="t('common.selectText') + t('project.cd.deploy_version')"
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
            <ElInputNumber style="width: 200px" v-model="ruleForm.replicate" :min="1" />
          </ElFormItem>
          <ElFormItem :label="t('project.cd.port_mapping')">
            <ElSpace direction="vertical" :size="10">
              <ElFormItem v-for="(port, index) in ports.portMapping" :key="port.text">
                <ElCol :span="8">
                  <ElInput
                    class="w-50"
                    :controls="false"
                    v-model="port.text"
                    :min="1"
                    :max="65535"
                    oninput="value=value.replace(/\D/g,'')"
                    placeholder="80"
                  >
                    <template #prepend>{{ t('project.cd.service_port') }}</template>
                  </ElInput>
                </ElCol>
                <ElCol class="text-center" :span="1" />
                <ElCol :span="8">
                  <ElInput class="w-50" :controls="false" v-model="port.value" placeholder="80">
                    <template #prepend>{{ t('project.cd.container_port') }}</template>
                  </ElInput>
                </ElCol>
                <ElCol :span="2">
                  <ElButton
                    type="primary"
                    :icon="Plus"
                    plain
                    style="margin-left: 10px"
                    circle
                    @click="addPorts"
                  />
                </ElCol>
                <ElCol :span="2">
                  <ElButton
                    v-if="ports.portMapping.length <= 1"
                    disabled
                    type="danger"
                    :icon="Delete"
                    plain
                    style="margin-left: 10px"
                    circle
                  />
                  <ElButton
                    v-if="ports.portMapping.length > 1"
                    type="danger"
                    :icon="Delete"
                    plain
                    style="margin-left: 10px"
                    circle
                    @click="removePort(index)"
                  />
                </ElCol>
              </ElFormItem>
            </ElSpace>
          </ElFormItem>
          <ElFormItem :label="t('project.cd.env_vars')">
            <ElSpace direction="vertical" :size="10">
              <ElFormItem v-for="(vars, index) in env" :key="vars">
                <ElCol :span="8">
                  <ElInput
                    class="w-50"
                    :controls="false"
                    v-model="vars.text"
                    :placeholder="t('project.cd.env_vars_key')"
                  />
                </ElCol>
                <ElCol class="text-center" :span="1" />
                <ElCol :span="8">
                  <ElInput
                    class="w-50"
                    :controls="false"
                    v-model="vars.value"
                    :placeholder="t('project.cd.env_vars_value')"
                  />
                </ElCol>
                <ElCol :span="2">
                  <ElButton
                    type="primary"
                    :icon="Plus"
                    plain
                    style="margin-left: 10px"
                    circle
                    @click="addVars"
                  />
                </ElCol>
                <ElCol :span="2">
                  <ElButton
                    v-if="env.length <= 1"
                    disabled
                    type="danger"
                    :icon="Delete"
                    plain
                    style="margin-left: 10px"
                    circle
                  />
                  <ElButton
                    v-if="env.length > 1"
                    type="danger"
                    :icon="Delete"
                    plain
                    style="margin-left: 10px"
                    circle
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
                    placeholder="1000"
                    oninput="value=value.replace(/\D/g,'')"
                  >
                    <template #prepend>{{ t('project.cd.resource_limit.cpu_request') }}</template>
                  </ElInput>
                </ElCol>
                <ElCol :span="1" />
                <ElCol :span="9">
                  <ElInput
                    v-model="ruleForm.cpuLimits"
                    :controls="false"
                    placeholder="2000"
                    oninput="value=value.replace(/\D/g,'')"
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
                    placeholder="500"
                    oninput="value=value.replace(/\D/g,'')"
                  >
                    <template #prepend>{{ t('project.cd.resource_limit.mem_request') }}</template>
                  </ElInput>
                </ElCol>
                <ElCol :span="1" />
                <ElCol :span="9">
                  <ElInput
                    v-model="ruleForm.memLimits"
                    :controls="false"
                    placeholder="2000"
                    oninput="value=value.replace(/\D/g,'')"
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
                :placeholder="t('project.cd.health_checker')"
                :formatter="(value) => `/${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                :parser="(value) => value.replace(/\/\s?|(,*)/g, '')"
              />
            </ElCol>
            <ElCol class="text-center" :span="1" />
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
        <Icon style="margin-right: 5px" icon="ic:round-rocket-launch" />
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
      <ElCol :span="6" style="text-align: right">
        <ElButton :icon="CirclePlus" @click="showNewDeploymentDlg" type="primary">
          {{ t('project.cd.new_app') }}</ElButton
        >
      </ElCol>
    </ElRow>
    <ElDivider />
    <ElScrollbar max-height="500px">
      <ElSpace wrap :size="30">
        <ElTable :data="deploymentsData" style="width: 100%">
          <ElTableColumn
            fixed
            prop="k8sName"
            :label="t('project.cd.target_env')"
            width="180"
            :filters="namespacesPair"
            :filter-method="nsFilterHandler"
          /><ElTableColumn
            fixed
            prop="namespace"
            :label="t('project.cd.namespace')"
            width="180"
            :filters="namespacesPair"
            :filter-method="nsFilterHandler"
          /><ElTableColumn fixed :label="t('project.cd.artifact_name')" width="250">
            <template #default="scope">
              {{ scope.row.artifactName }}
              <ElDivider direction="vertical" />
              <ElTag effect="light" type="success" v-if="scope.row.artifactTag == 'latest'">{{
                t('project.cd.deploy_version_latest')
              }}</ElTag>
              <ElTag effect="dark" v-if="scope.row.artifactTag != 'latest'">{{
                scope.row.artifactTag
              }}</ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn :label="t('project.cd.env_vars')" width="200">
            <template #default="scope">
              <ElRow>
                <ElCol :key="vars" :span="24" v-for="(vars, index) in scope.row.env">
                  <ElTag v-if="index <= 2" style="margin: 3px"
                    >{{ vars.text }}:{{ vars.value }}</ElTag
                  >
                  <span v-if="index > 2">...</span>
                </ElCol>
              </ElRow>
            </template>
          </ElTableColumn>
          <ElTableColumn :label="t('project.cd.port_mapping')" width="200">
            <template #default="scope">
              <ElRow>
                <ElCol :key="port" :span="24" v-for="(port, index) in scope.row.ports">
                  <ElTag v-if="index <= 2" style="margin: 3px"
                    >{{ port.text }}:{{ port.value }}</ElTag
                  >
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
          <ElTableColumn :label="t('project.cd.action')" fixed="right" width="120" align="center">
            <template #default="scope">
              <ElDropdown @command="actionHandler">
                <span class="el-dropdown-link">
                  <ElButton :icon="MoreFilled" circle />
                </span>
                <template #dropdown>
                  <ElDropdownMenu>
                    <ElDropdownItem :command="{ id: scope.row.id, cmd: 'deploy' }">
                      <ElLink v-if="scope.row.lastDeployAt == null" :underline="false">
                        <Icon icon="material-symbols:play-circle" />
                        {{ t('project.cd.first_deploy') }}
                      </ElLink>
                      <ElLink v-if="scope.row.lastDeployAt != null" :underline="false">
                        <Icon icon="material-symbols:play-circle" />
                        {{ t('project.cd.redeploy') }}
                      </ElLink>
                    </ElDropdownItem>
                    <ElDropdownItem>
                      <ElLink :underline="false">
                        <Icon icon="icon-park-solid:history-query" />
                        {{ t('project.cd.deploy_history') }}</ElLink
                      >
                    </ElDropdownItem>
                    <ElDropdownItem divided :command="{ id: scope.row.id, cmd: 'del' }">
                      <ElLink :icon="Delete" :underline="false" type="danger">
                        {{ t('project.cd.delete_deployment') }}
                      </ElLink>
                    </ElDropdownItem>
                    <ElDropdownItem
                      v-if="scope.row.lastDeployAt != null"
                      divided
                      :command="{ id: scope.row.id, cmd: 'del' }"
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
