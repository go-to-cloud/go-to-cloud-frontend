<script setup lang="ts">
import { ElButton, FormInstance, FormRules } from 'element-plus'
import { CirclePlus, Delete, Expand, MoreFilled, Plus, Search } from '@element-plus/icons-vue'
import { ContentDetailWrap } from '@/components/ContentDetailWrap'
import { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/hooks/web/useI18n'
import { onMounted, onUnmounted, reactive, ref } from 'vue'

import { useIcon } from '@/hooks/web/useIcon'
import {
  BranchDetail,
  BuildEnvGroup,
  BuildPlan,
  BuildPlanCard,
  ImportedSourceCodeData
} from '@/api/projects/types'
import { useAxios } from '@/hooks/web/useAxios'
import {
  deletePlanApi,
  getBranchListApi,
  getBuildCmdApi,
  getBuildEnvsApi,
  getBuildPlansApi,
  getSourceCodeListApi,
  newBuildPlan,
  refreshPipelineApi,
  startBuildPlanApi
} from '@/api/projects'
import { getArtifactRepoApi } from '@/api/configure/artifact'
import { ArtifactRepoData } from '@/api/configure/types'
import { ElMessageBox } from 'element-plus/es'

const namespaces = ref<string[]>([])
const namespacesPair = ref<TextValuePair[]>([])
const formSize = ref('default')

interface KeyValuePair {
  key: string
  value: string
}
interface TextValuePair {
  text: string
  value: string
}

interface DeploymentData {
  name: string
  namespace: string
}

const nsFilterHandler = (
  value: string,
  row: DeploymentData,
  column: TableColumnCtx<DeploymentData>
) => {
  const property = column['property']
  return row.namespace === value
}

const ports = reactive<{ portMapping: KeyValuePair[] }>({
  portMapping: [
    {
      key: '80',
      value: '80'
    }
  ]
})
////////////////////////////////////////

const tSize = ref(24)
const t01 = useIcon({ icon: 'material-symbols:filter-1', color: '#3385ff', size: tSize.value })
const t02 = useIcon({ icon: 'material-symbols:filter-2', color: '#3385ff', size: tSize.value })
const t03 = useIcon({ icon: 'material-symbols:filter-3', color: '#3385ff', size: tSize.value })
const t04 = useIcon({ icon: 'material-symbols:filter-4', color: '#3385ff', size: tSize.value })
const t05 = useIcon({ icon: 'material-symbols:filter-5', color: '#3385ff', size: tSize.value })
const t06 = useIcon({ icon: 'material-symbols:filter-6', color: '#3385ff', size: tSize.value })
const t07 = useIcon({ icon: 'material-symbols:filter-7', color: '#3385ff', size: tSize.value })
const t08 = useIcon({ icon: 'material-symbols:filter-8', color: '#3385ff', size: tSize.value })
const t09 = useIcon({ icon: 'material-symbols:filter-9', color: '#3385ff', size: tSize.value })
const t10 = useIcon({ icon: 'material-symbols:filter-10', color: '#3385ff', size: tSize.value })

const { t } = useI18n()
const { path, params } = useRoute()
const { push } = useRouter()
const request = useAxios()

const tplDialogVisible = ref(false)
const showNewPlanDlg = () => {
  tplDialogVisible.value = true
}
const ruleForm = reactive<BuildPlan>({
  id: 0,
  name: '',
  buildEnv: '',
  source_code_id: undefined,
  branch: '',
  qa_enabled: true,
  unit_test: '',
  lint_check: '',
  artifact_enabled: true,
  dockerfile: '',
  image_name: '',
  artifact_repo_id: undefined,
  deploy_enabled: true,
  remark: ''
})

const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules>({
  name: [
    {
      required: true,
      trigger: 'blur',
      message: t('common.required')
    }
  ],
  dockerfile: [
    {
      required: true,
      trigger: 'blur',
      message: t('common.required'),
      validator: (rule, value) => {
        if (!ruleForm.artifact_enabled) return true
        return value.trim().length > 0
      }
    }
  ],
  image_name: [
    {
      required: true,
      trigger: 'blur',
      message: t('project.ci.artifact_name_rule'),
      validator: (rule, value) => {
        if (!ruleForm.artifact_enabled) return true
        const reg = new RegExp('^[a-z][a-z0-9]*([-_.][a-z0-9]+)*$')
        return reg.test(value)
      }
    }
  ]
})

const sourceCodeList = ref<ImportedSourceCodeData[]>()

const getSourceCodeList = async () => {
  let projectId = Number(params.id)
  await getSourceCodeListApi(projectId).then((dat) => {
    sourceCodeList.value = dat
  })
}

const branchList = ref<BranchDetail[]>()
const getSourceCodeBranches = async (srcId: number) => {
  let project = Number(params.id)
  await getBranchListApi(project, srcId).then((dat) => {
    branchList.value = dat.branches
  })
}

const buildEnvList = ref<BuildEnvGroup[]>()
const getBuildEnvList = async () => {
  await getBuildEnvsApi().then((dat) => {
    buildEnvList.value = dat
  })
}

const artifactTypes = ref<ArtifactRepoData[]>([])

const getArtifactRepo = async () => {
  await getArtifactRepoApi(params).then((resp) => {
    artifactTypes.value = resp
  })
}

const getBuildCmd = async (env: string) => {
  await getBuildCmdApi(env).then((dat) => {
    if (ruleForm) {
      ruleForm.unit_test = dat.unitTest
      ruleForm.lint_check = dat.lintCheck
    }
  })
}
const buildEnvSelected = async function (val: string) {
  await getBuildCmd(val)
}
const gitSelected = async function (val: string) {
  await getSourceCodeBranches(Number(val))
}
const submit = async (formEl: FormInstance) => {
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      let projectId = Number(params.id)
      await newBuildPlan(projectId, ruleForm)
      await getBuildPlans()
      tplDialogVisible.value = false
    }
  })
}

const planCards = ref<BuildPlanCard[]>()
const getBuildPlans = async () => {
  let projectId = Number(params.id)
  await getBuildPlansApi(projectId).then((dat) => {
    planCards.value = dat
  })
}

const buildResultEffect = function (rlt: number): string {
  switch (rlt) {
    case 1:
    case 2:
    case 3:
      return 'dark'
    case 0:
    case 99:
      return 'light'
  }
  return 'dark'
}
const buildResultType = function (rlt: number): string {
  switch (rlt) {
    case 0:
      return 'info'
    case 1:
      return 'success'
    case 2:
      return 'warning'
    case 3:
      return 'danger'
    case 99:
      return 'success'
  }
  return ''
}
const buildResultText = function (rlt: number): string {
  switch (rlt) {
    // 1：成功；2：取消；3：失败；0：从未执行
    case 0:
      return t('project.ci.result.never')
    case 1:
      return t('project.ci.result.success')
    case 2:
      return t('project.ci.result.cancel')
    case 3:
      return t('project.ci.result.failed')
    case 99:
      return t('project.ci.result.building')
  }
  return ''
}

interface HandlerCommand {
  id: number
  cmd: string
  form: BuildPlanCard
}
const actionHandler = (command: HandlerCommand) => {
  switch (command.cmd) {
    case 'del': {
      ElMessageBox.confirm(t('project.ci.removeConfirm'), t('common.confirmMsgTitle'), {
        confirmButtonText: t('common.ok'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }).then(() => {
        deletePlan(command.id)
      })
      break
    }
    case 'building': {
      startBuildPlan(command.id)
      break
    }
  }
}

const deletePlan = async (planId: number) => {
  let projectId = Number(params.id)
  await deletePlanApi(projectId, planId).then(async (resp) => {
    if (resp.success) {
      await getBuildPlans()
    }
  })
}

const startBuildPlan = async (planId: number) => {
  let projectId = Number(params.id)
  await startBuildPlanApi(projectId, planId).then(async (resp) => {
    if (resp.success) {
      await getBuildPlans()
    }
  })
}

class autoRefreshPipeline {
  intervalId: NodeJS.Timer | null = null

  startTimer() {
    this.intervalId = setInterval(() => {
      refreshPipelines()
    }, 5000)
  }

  stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}

const pipelineRefresh = ref<autoRefreshPipeline>()

const refreshPipelines = async () => {
  let projectId = Number(params.id)
  await refreshPipelineApi(projectId).then((resp) => {
    if (resp! && planCards!) {
      for (let i = 0; i < resp.length; i++) {
        let m = planCards.value?.find((r) => r.id == resp[i].id)
        if (m!) {
          if (m.lastBuildResult != resp[i].lastBuildResult) {
          }
          m.lastBuildResult = resp[i].lastBuildResult
        }
      }
    }
  })
}
onMounted(() => {
  getSourceCodeList()
  getBuildEnvList()
  getArtifactRepo()
  getBuildPlans()
  pipelineRefresh.value = new autoRefreshPipeline()
  pipelineRefresh.value.startTimer()
  refreshPipelines()
})
onUnmounted(() => {
  pipelineRefresh.value!.stopTimer()
})
</script>
<template>
  <ElDialog v-model="tplDialogVisible" :title="t('project.cd.new_app')" draggable :size="formSize">
    <div style="height: 500px">
      <ElScrollbar>
        <ElForm label-position="top" :model="ruleForm" ref="ruleFormRef" :rules="rules">
          <ElFormItem label="名字空间" prop="namespace">
            <ElSelect v-model="ruleForm.namespace" placeholder="选择名字空间">
              <Eloption v-for="item in namespaces" :key="item" :label="item" :value="item" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="制品名称" prop="artifact">
            <ElAutocomplete
              v-model="ruleForm.artifact"
              placeholder="输入制品名称"
              :fetch-suggestions="queryArtifacts"
              :trigger-on-focus="false"
              @select="artifactSelected"
            />
          </ElFormItem>
          <ElFormItem label="镜像版本" prop="version">
            <ElSelect
              v-model="ruleForm.version"
              class="inline-input w-50"
              placeholder="输入部署版本"
            >
              <ElOption
                v-for="item in ruleForm.versions"
                :key="item.value"
                :label="item.value"
                :value="item.value"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="副本数量" prop="replicate">
            <ElInputNumber v-model="ruleForm.replicate" :min="1" :max="20" />
          </ElFormItem>
          <ElFormItem label="端口映射" prop="count">
            <ElSpace direction="vertical" :size="10">
              <ElFormItem v-for="port in ports.portMapping" :key="port.key">
                <ElCol :span="8">
                  <ElInput
                    class="w-50 m-2"
                    :controls="false"
                    v-model="port.key"
                    :min="1"
                    :max="65535"
                    oninput="value=value.replace(/\D/g,'')"
                    placeholder="80"
                  >
                    <template #prepend>服务端口</template>
                  </ElInput>
                </ElCol>
                <ElCol class="text-center" :span="1" />
                <ElCol :span="8">
                  <ElInput class="w-50 m-2" :controls="false" v-model="port.value" placeholder="80">
                    <template #prepend>容器端口</template>
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

          <ElFormItem label="资源配置">
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
                    <template #prepend>CPU资源</template>
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
                    <template #prepend>CPU限制</template>
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
                    <template #prepend>内存资源</template>
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
                    <template #prepend>内存限制</template>
                  </ElInput>
                </ElCol>
              </ElFormItem>
            </ElSpace>
          </ElFormItem>

          <ElFormItem label="健康检查">
            <ElCol :span="9">
              <ElInput
                v-model="ruleForm.healthcheck"
                placeholder="健康检查"
                :formatter="(value) => `/ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                :parser="(value) => value.replace(/\/\s?|(,*)/g, '')"
              />
            </ElCol>
            <ElCol class="text-center" :span="1" />
            <ElCol :span="9">
              <ElFormItem prop="date2">
                <ElInput
                  v-model="ruleForm.healthcheckPort"
                  :controls="false"
                  label="服务端口"
                  placeholder="80"
                >
                  <template #prepend>服务端口</template>
                </ElInput>
              </ElFormItem>
            </ElCol>
          </ElFormItem>
          <ElFormItem>
            <ElButton type="primary" @click="submitForm(ruleFormRef)">提交 </ElButton>
            <ElButton @click="resetForm">重置</ElButton>
          </ElFormItem>
        </ElForm>
      </ElScrollbar>
    </div>
    <template #footer>
      <ElButton @click="tplDialogVisible = false">{{ t('common.close') }}</ElButton>
      <ElButton type="primary" @click="submit(ruleFormRef)"> {{ t('common.submit') }} </ElButton>
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
        <ElButton :icon="CirclePlus" @click="showNewPlanDlg" type="primary">
          {{ t('project.cd.new_app') }}</ElButton
        >
      </ElCol>
    </ElRow>
    <ElDivider />
    <ElSpace wrap :size="30">
      <ElTable :data="planCards" style="width: 100%">
        <ElTableColumn fixed prop="name" :label="t('project.cd.app_name')" width="250" />
        <ElTableColumn
          fixed
          prop="buildEnv"
          :label="t('project.cd.namespace')"
          width="180"
          :filters="namespacesPair"
          :filter-method="nsFilterHandler"
        />
        <ElTableColumn fixed prop="branch" :label="t('project.cd.instance')" width="120">
          <template #default="scope">
            {{ scope.row.runningPods }} / {{ scope.row.totalPods }}
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('project.cd.ops')" width="120">
          <template #default="scope">
            <ElButton link type="primary" size="small" @click="scale(scope.row)">{{
              t('project.cd.scale')
            }}</ElButton>
            <ElButton link type="primary" size="small" @click="restart(scope.row)"
              >{{ t('project.cd.restart') }}
            </ElButton>
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
                  <ElDropdownItem :command="{ id: scope.row.id, cmd: 'detail' }">
                    <ElLink :underline="false">
                      <Icon :icon="Expand" />
                      {{ t('project.cd.detail') }}
                    </ElLink>
                  </ElDropdownItem>
                  <ElDropdownItem divided :command="{ id: scope.row.id, cmd: 'building' }">
                    <ElLink :underline="false">
                      <Icon icon="material-symbols:play-circle" />
                      {{ t('project.cd.redeploy') }}
                    </ElLink>
                  </ElDropdownItem>
                  <ElDropdownItem>
                    <ElLink :underline="false">
                      <Icon icon="icon-park-solid:history-query" />
                      {{ t('project.cd.rollback') }}</ElLink
                    >
                  </ElDropdownItem>
                  <ElDropdownItem divided :command="{ id: scope.row.id, cmd: 'del' }">
                    <ElLink :icon="Delete" :underline="false" type="danger">
                      {{ t('project.cd.delete') }}
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
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
