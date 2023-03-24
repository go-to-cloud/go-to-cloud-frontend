<script lang="ts" setup>
import { ElButton, ElCard, FormInstance, FormRules } from 'element-plus'
import { CirclePlus, Delete, Memo, MoreFilled, Search } from '@element-plus/icons-vue'
import { ContentDetailWrap } from '@/components/ContentDetailWrap'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/hooks/web/useI18n'
import { computed, onMounted, onUnmounted, reactive, ref, watchEffect } from 'vue'

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
  getBuildHistoryApi,
  getBuildPlansApi,
  getSourceCodeListApi,
  newBuildPlan,
  refreshPipelineApi,
  startBuildPlanApi
} from '@/api/projects'
import { getArtifactRepoApi } from '@/api/configure/artifact'
import { ArtifactRepoData } from '@/api/configure/types'
import { ElMessageBox } from 'element-plus/es'
import { useVisibilityStore } from '@/store/modules/visibility'
import { AuthCodes } from '@/api/constants/auths'

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
const historyDialogVisible = ref(false)

const showNewPlanDlg = () => {
  tplDialogVisible.value = true
}
const ruleForm = reactive<BuildPlan>({
  id: 0,
  name: '',
  buildEnv: '',
  source_code_id: undefined,
  branch: undefined,
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
const buildHistory = ref<BuildPlanCard[]>()

const getBuildPlans = async () => {
  let projectId = Number(params.id)
  await getBuildPlansApi(projectId).then((dat) => {
    planCards.value = dat
  })
}

const buildResultEffect = function (rlt: number): string {
  switch (rlt) {
    case 1:
    case 3:
      return 'dark'
    case 0:
    case 2:
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
    case 'build_history': {
      historyDialogVisible.value = true
      loadBuildHistory(command.id)
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

const loadBuildHistory = async (planId: number) => {
  let projectId = Number(params.id)
  await getBuildHistoryApi(projectId, planId).then(async (res) => {
    buildHistory.value = res
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

const visibilityStore = useVisibilityStore()
const auth = computed(() => visibilityStore.getAuthCodes)

// 防止手动页面刷新后状态丢失
watchEffect(async () => {
  await visibilityStore.setAuthCodes()
})
</script>
<template>
  <ElDialog
    v-model="historyDialogVisible"
    :title="t('project.ci.build_history')"
    draggable
    width="90%"
  >
    <ElTable :data="buildHistory" style="width: 100%">
      <ElTableColumn :label="t('project.ci.plan_name')" fixed prop="name" width="250" />
      <ElTableColumn :label="t('project.ci.build_env')" fixed prop="buildEnv" width="180" />
      <ElTableColumn :label="t('project.ci.code_branch')" fixed prop="branch.name" width="180" />
      <ElTableColumn :label="t('project.ci.build_at')" width="300">
        <template #default="scope">
          <span v-if="scope.row.lastBuildResult != 0"
            >{{ scope.row.lastBuildAt }} <ElDivider direction="vertical"
          /></span>
          <ElTag
            :effect="buildResultEffect(scope.row.lastBuildResult)"
            :type="buildResultType(scope.row.lastBuildResult)"
            >{{ buildResultText(scope.row.lastBuildResult) }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn :label="t('project.ci.steps')" width="160">
        <template #default="scope">
          <ElSpace style="margin-top: 4px">
            <ElTooltip
              v-if="scope.row.qa_enabled && scope.row.unit_test"
              :content="t('project.ci.unit_test')"
            >
              <Icon class="toolset" icon="file-icons:test-generic" />
            </ElTooltip>
            <ElTooltip
              v-if="scope.row.qa_enabled && scope.row.lint_check"
              :content="t('project.ci.lint_check')"
            >
              <Icon class="toolset" icon="file-icons:commitlint" />
            </ElTooltip>
            <ElTooltip v-if="scope.row.artifact_enabled" :content="t('project.toolset.artifact')">
              <Icon class="toolset" icon="cib:azure-artifacts" />
            </ElTooltip>
          </ElSpace>
        </template>
      </ElTableColumn>
      <ElTableColumn fixed="right" prop="id" width="120">
        <template #default>
          <ElLink :icon="Memo">{{ t('project.ci.build_logs') }}</ElLink>
        </template>
      </ElTableColumn>
    </ElTable>
  </ElDialog>
  <ElDialog v-model="tplDialogVisible" :title="t('project.ci.new_plan')" draggable>
    <div style="height: 500px">
      <ElScrollbar>
        <ElForm ref="ruleFormRef" :model="ruleForm" :rules="rules" label-position="top">
          <ElTimeline style="margin-top: 10px">
            <ElTimelineItem placement="top" size="large">
              <ElCard>
                <ElFormItem :label="t('project.ci.build_env')">
                  <ElSelect
                    v-model="ruleForm.buildEnv"
                    :placeholder="t('common.selectText')"
                    @change="buildEnvSelected"
                  >
                    <ElOptionGroup
                      v-for="group in buildEnvList"
                      :key="group.label"
                      :label="group.label"
                    >
                      <ElOption
                        v-for="item in group.options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </ElOptionGroup>
                  </ElSelect>
                </ElFormItem>
              </ElCard>
            </ElTimelineItem>
            <ElTimelineItem :icon="t01" placement="top" size="large">
              <ElCard>
                <ElFormItem :label="t('project.ci.plan_name')" prop="name">
                  <ElInput v-model="ruleForm.name" />
                </ElFormItem>
              </ElCard>
            </ElTimelineItem>
            <ElTimelineItem :icon="t02" placement="top" size="large">
              <ElCard :header="t('project.ci.code_repo_header')">
                <ElFormItem :label="t('project.ci.code_repo')">
                  <ElSelect
                    v-model="ruleForm.source_code_id"
                    :placeholder="t('common.selectText')"
                    @change="gitSelected"
                  >
                    <ElOption
                      v-for="item in sourceCodeList"
                      :key="item.id"
                      :label="item.url"
                      :value="item.id"
                    />
                  </ElSelect>
                </ElFormItem>
                <ElFormItem :label="t('project.ci.code_branch')">
                  <ElSelect v-model="ruleForm.branch" :placeholder="t('common.selectText')">
                    <ElOption
                      v-for="item in branchList"
                      :key="item.Sha"
                      :label="item.Name"
                      :value="{ sha: item.Sha, name: item.Name }"
                    />
                  </ElSelect>
                </ElFormItem>
              </ElCard>
            </ElTimelineItem>
            <ElTimelineItem :icon="t03" v-if="false" placement="top" size="large">
              <ElCard>
                <template #header>
                  <div class="card-header">
                    <span>{{ t('project.ci.qa_header') }}</span>
                    <ElSwitch
                      v-model="ruleForm.qa_enabled"
                      :active-text="t('project.ci.stage_enable')"
                    />
                  </div>
                </template>
                <ElFormItem :label="t('project.ci.unit_test')">
                  <ElInput v-model="ruleForm.unit_test" :disabled="!ruleForm.qa_enabled" />
                </ElFormItem>
                <ElFormItem :label="t('project.ci.lint_check')">
                  <ElInput v-model="ruleForm.lint_check" :disabled="!ruleForm.qa_enabled" />
                </ElFormItem>
              </ElCard>
            </ElTimelineItem>
            <ElTimelineItem :icon="t03" placement="top" size="large">
              <ElCard>
                <template #header>
                  <div class="card-header">
                    <span>{{ t('project.ci.artifact_header') }}</span>
                    <ElSwitch
                      v-model="ruleForm.artifact_enabled"
                      :active-text="t('project.ci.stage_enable')"
                    />
                  </div>
                </template>
                <ElFormItem :label="t('project.ci.dockerfile')" prop="dockerfile">
                  <ElInput v-model="ruleForm.dockerfile" :disabled="!ruleForm.artifact_enabled" />
                </ElFormItem>
                <ElFormItem :label="t('project.ci.artifact_name')" prop="image_name">
                  <ElInput v-model="ruleForm.image_name" :disabled="!ruleForm.artifact_enabled" />
                </ElFormItem>
                <ElFormItem :label="t('project.ci.artifact_repo')">
                  <ElSelect
                    v-model="ruleForm.artifact_repo_id"
                    :disabled="!ruleForm.artifact_enabled"
                    :placeholder="t('common.selectText')"
                  >
                    <ElOption
                      v-for="item in artifactTypes"
                      :key="item.name"
                      :label="item.name"
                      :value="item.id"
                    />
                  </ElSelect>
                </ElFormItem>
              </ElCard>
            </ElTimelineItem>
            <ElTimelineItem placement="top" size="large">
              <ElSpace />
            </ElTimelineItem>
          </ElTimeline>
        </ElForm>
      </ElScrollbar>
    </div>
    <template #footer>
      <el-button @click="tplDialogVisible = false">{{ t('common.close') }}</el-button>
      <el-button type="primary" @click="submit(ruleFormRef)"> {{ t('common.submit') }}</el-button>
    </template>
  </ElDialog>
  <ContentDetailWrap :title="t('project.toolset.ci')" @back="push('/projects/index')">
    <ElRow justify="space-between">
      <ElCol :span="18">
        <ElSpace wrap>
          <span class="header_title">{{ t('router.projects') }}</span>
          <ElDivider direction="vertical" />
          <ElInput
            v-model="filterKeywords"
            :placeholder="t('project.ci.plan')"
            :suffix-icon="Search"
            clearable
          />
        </ElSpace>
      </ElCol>
      <ElCol v-if="auth.includes(AuthCodes.ResProjectCINew)" :span="6" style="text-align: right">
        <ElButton :icon="CirclePlus" type="primary" @click="showNewPlanDlg">
          {{ t('project.ci.new_plan') }}
        </ElButton>
      </ElCol>
    </ElRow>
    <ElDivider />
    <ElSpace :size="30" wrap>
      <ElTable :data="planCards" style="width: 100%">
        <ElTableColumn :label="t('project.ci.plan_name')" fixed prop="name" width="250" />
        <ElTableColumn :label="t('project.ci.build_env')" fixed prop="buildEnv" width="180" />
        <ElTableColumn :label="t('project.ci.code_branch')" fixed prop="branch.name" width="180" />
        <ElTableColumn :label="t('project.ci.last_build')" width="300">
          <template #default="scope">
            <span v-if="scope.row.lastBuildResult != 0"
              >{{ scope.row.lastBuildAt }} <ElDivider direction="vertical"
            /></span>
            <ElTag
              :effect="buildResultEffect(scope.row.lastBuildResult)"
              :type="buildResultType(scope.row.lastBuildResult)"
              >{{ buildResultText(scope.row.lastBuildResult) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('project.ci.steps')" width="160">
          <template #default="scope">
            <ElSpace style="margin-top: 4px">
              <ElTooltip
                v-if="scope.row.qa_enabled && scope.row.unit_test"
                :content="t('project.ci.unit_test')"
              >
                <Icon class="toolset" icon="file-icons:test-generic" />
              </ElTooltip>
              <ElTooltip
                v-if="scope.row.qa_enabled && scope.row.lint_check"
                :content="t('project.ci.lint_check')"
              >
                <Icon class="toolset" icon="file-icons:commitlint" />
              </ElTooltip>
              <ElTooltip v-if="scope.row.artifact_enabled" :content="t('project.toolset.artifact')">
                <Icon class="toolset" icon="cib:azure-artifacts" />
              </ElTooltip>
            </ElSpace>
          </template>
        </ElTableColumn>
        <ElTableColumn
          v-if="
            auth.includes(AuthCodes.ResProjectCIDelete) ||
            auth.includes(AuthCodes.ResProjectCIStart) ||
            auth.includes(AuthCodes.ResProjectCIHistory)
          "
          :label="t('common.action')"
          fixed="right"
          prop="id"
          width="80"
        >
          <template #default="scope">
            <ElDropdown @command="actionHandler">
              <span class="el-dropdown-link">
                <ElButton :icon="MoreFilled" circle />
              </span>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem
                    v-if="!scope.row.buildingNow"
                    :command="{ id: scope.row.id, cmd: 'building' }"
                  >
                    <ElLink :underline="false">
                      <Icon icon="material-symbols:play-circle" />
                      {{ t('project.ci.build_now') }}
                    </ElLink>
                  </ElDropdownItem>
                  <ElDropdownItem v-if="scope.row.buildingNow">
                    <ElLink :underline="false">
                      <Icon icon="typcn:cancel" size="20" />
                      {{ t('project.ci.cancel_building') }}
                    </ElLink>
                  </ElDropdownItem>
                  <ElDropdownItem :command="{ id: scope.row.id, cmd: 'build_history' }">
                    <ElLink :underline="false">
                      <Icon icon="icon-park-solid:history-query" />
                      {{ t('project.ci.build_history') }}
                    </ElLink>
                  </ElDropdownItem>
                  <ElDropdownItem :command="{ id: scope.row.id, cmd: 'del' }" divided>
                    <ElLink :icon="Delete" :underline="false" type="danger">
                      {{ t('project.ci.delete_plan') }}
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
