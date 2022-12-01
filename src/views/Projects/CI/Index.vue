<script setup lang="ts">
import { ElButton, ElCard } from 'element-plus'
import { CirclePlus, Search } from '@element-plus/icons-vue'
import { ContentDetailWrap } from '@/components/ContentDetailWrap'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/hooks/web/useI18n'
import { reactive, ref } from 'vue'

import { useIcon } from '@/hooks/web/useIcon'
import { ImportedSourceCodeData } from '@/api/projects/types'
import { useAxios } from '@/hooks/web/useAxios'

const t01 = useIcon({ icon: 'material-symbols:filter-1', color: '#3385ff' })
const t02 = useIcon({ icon: 'material-symbols:filter-2', color: '#3385ff' })
const t03 = useIcon({ icon: 'material-symbols:filter-3', color: '#3385ff' })
const t04 = useIcon({ icon: 'material-symbols:filter-4', color: '#3385ff' })
const t05 = useIcon({ icon: 'material-symbols:filter-5', color: '#3385ff' })
const t06 = useIcon({ icon: 'material-symbols:filter-6', color: '#3385ff' })
const t07 = useIcon({ icon: 'material-symbols:filter-7', color: '#3385ff' })
const t08 = useIcon({ icon: 'material-symbols:filter-8', color: '#3385ff' })
const t09 = useIcon({ icon: 'material-symbols:filter-9', color: '#3385ff' })
const t10 = useIcon({ icon: 'material-symbols:filter-10', color: '#3385ff' })

const { t } = useI18n()
const { path, params } = useRoute()
const { push } = useRouter()
const request = useAxios()

const tplDialogVisible = ref(false)
const showNewPlanDlg = () => {
  tplDialogVisible.value = true
}
const formPlan = reactive({
  name: '',
  source_code_id: '',
  branch: '',
  qa_enabled: true,
  unit_test: '',
  lint_check: '',
  artifact_enabled: true,
  dockerfile: '',
  artifact_repo: ''
})

const getSourceCodeListApi = async (projectId: number): Promise<ImportedSourceCodeData[]> => {
  const res = await request.get<IResponse<ImportedSourceCodeData[]>>({
    url: '/projects/' + projectId + '/imported'
  })
  return res && res.data && res.data.data
}

const getBranchListApi = async (sourceCodeId: number): Promise<ImportedSourceCodeData[]> => {
  const res = await request.get<IResponse<ImportedSourceCodeData[]>>({
    url: '/projects/' + projectId + '/imported'
  })
  return res && res.data && res.data.data
}
const sourceCodeList = ref<ImportedSourceCodeData[]>()

const getSourceCodeList = async () => {
  let projectId = Number(params.id)
  await getSourceCodeListApi(projectId).then((dat) => {
    sourceCodeList.value = dat
  })
}

getSourceCodeList()

const gitSelected = function (val: string) {
  console.log(val)
}
const submit = () => {
  console.log(formPlan)
}
</script>
<template>
  <ElDialog v-model="tplDialogVisible" :title="t('project.ci.new_plan')" draggable>
    <div style="height: 500px">
      <ElScrollbar>
        <ElForm label-position="top" :model="formPlan">
          <ElTimeline>
            <ElTimelineItem size="large" :icon="t01" placement="top">
              <ElCard>
                <ElFormItem :label="t('project.ci.plan_name')">
                  <ElInput v-model="formPlan.name" />
                </ElFormItem>
              </ElCard> </ElTimelineItem
            ><ElTimelineItem size="large" :icon="t02" placement="top">
              <ElCard :header="t('project.ci.code_repo_header')">
                <ElFormItem :label="t('project.ci.code_repo')">
                  <ElSelect
                    v-model="formPlan.source_code_id"
                    @change="gitSelected"
                    :placeholder="t('common.selectText')"
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
                  <ElInput v-model="formPlan.name" />
                </ElFormItem>
              </ElCard> </ElTimelineItem
            ><ElTimelineItem size="large" :icon="t03" placement="top">
              <ElCard>
                <template #header>
                  <div class="card-header">
                    <span>{{ t('project.ci.qa_header') }}</span>
                    <ElSwitch
                      v-model="formPlan.qa_enabled"
                      :active-text="t('project.ci.stage_enable')"
                  /></div>
                </template>
                <ElFormItem :label="t('project.ci.unit_test')">
                  <ElInput v-model="formPlan.name" />
                </ElFormItem>
                <ElFormItem :label="t('project.ci.lint_check')">
                  <ElInput v-model="formPlan.name" />
                </ElFormItem>
              </ElCard> </ElTimelineItem
            ><ElTimelineItem size="large" :icon="t04" placement="top">
              <ElCard>
                <template #header>
                  <div class="card-header">
                    <span>{{ t('project.ci.artifact_header') }}</span>
                    <ElSwitch
                      v-model="formPlan.artifact_enabled"
                      :active-text="t('project.ci.stage_enable')"
                  /></div>
                </template>
                <ElFormItem :label="t('project.ci.dockerfile')">
                  <ElInput v-model="formPlan.name" />
                </ElFormItem>
                <ElFormItem :label="t('project.ci.artifact_repo')">
                  <ElInput v-model="formPlan.name" />
                </ElFormItem>
              </ElCard> </ElTimelineItem
            ><ElTimelineItem size="large" placement="top">
              <ElSpace />
            </ElTimelineItem>
          </ElTimeline>
        </ElForm>
      </ElScrollbar>
    </div>
    <template #footer>
      <el-button @click="tplDialogVisible = false">关闭</el-button>
      <el-button type="primary" @click="submit()"> 创建 </el-button>
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
      <ElCol :span="6" style="text-align: right">
        <ElButton :icon="CirclePlus" @click="showNewPlanDlg" type="primary">
          {{ t('project.ci.new_plan') }}</ElButton
        >
      </ElCol>
    </ElRow>
    <ElDivider />
    <ElSpace wrap :size="30">
      <ElCard shadow="hover" v-for="i in 18" :key="i">
        <template #header>
          <div class="card-header">
            <span>Card name</span>
            <el-button class="button" text>Operation button</el-button>
          </div>
        </template>
        <div v-for="o in 4" :key="o" class="text item">{{ 'List item ' + o }}</div>
      </ElCard>
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
