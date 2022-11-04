<script setup lang="ts">
import { useI18n } from '@/hooks/web/useI18n'
import { createProjectApi, getProjectsApi } from '@/api/projects'
import { ProjectData } from '@/api/projects/types'
import { ref } from 'vue'
import { ElButton, ElMessage, FormInstance, FormRules } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import Icon from '@/components/Icon/src/Icon.vue'
import { useRouter } from 'vue-router'
import { Org } from '@/api/common/types'
import { getOrganizationsApi } from '@/api/common'
import { updateRepoApi } from '@/api/configure/coderepo'

const { t } = useI18n()
const { push } = useRouter()

const Organizations = ref<Array<Org>>(new Array<Org>())
const getOrganizations = async () => {
  await getOrganizationsApi().then((resp) => {
    if (resp!) {
      newProjectForm.value.org = null
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

getOrganizations()

const dlgForCreate = ref(true)
const bindDialogVisible = ref(false)

const newProjectFormRule = ref<FormRules>({
  name: [
    {
      required: true,
      message: '',
      trigger: 'blur'
    }
  ],
  org: [
    {
      required: true,
      message: t('project.at_least_one_org'),
      trigger: 'blur',
      validator: (rule, value) => {
        return (value as number) >= 0
      }
    }
  ]
})
const newProjectFormRef = ref<FormInstance>()
const newProjectForm = ref({
  id: 0,
  name: '',
  remark: '',
  org: ref<number | null>()
})
const openDlg = (create: boolean) => {
  dlgForCreate.value = create
  bindDialogVisible.value = true
}

const submit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      await createProjectApi(newProjectForm.value)
        .then((resp) => {
          if (resp.success) {
            bindDialogVisible.value = false
            resetForm()
            getProjectList()
          }
          resp.success
            ? ElMessage({
                type: 'success',
                message: t('project.createSuccess'),
                showClose: true,
                center: true
              })
            : ElMessage({
                type: 'error',
                message: t('project.createFailure'),
                showClose: true,
                center: true,
                grouping: true
              })
        })
        .catch(() => {
          ElMessage({
            type: 'error',
            message: t('project.createFailure'),
            showClose: true,
            center: true
          })
        })
    }
  })
}
const save = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      await updateRepoApi(newProjectForm.value)
        .then((resp) => {
          if (resp.success) {
            bindDialogVisible.value = false
            resetForm()
            getProjectList()
          }
          resp.success
            ? ElMessage({
                type: 'success',
                message: t('project.updateSuccess'),
                showClose: true,
                center: true
              })
            : ElMessage({
                type: 'error',
                message: t('project.updateFailure'),
                showClose: true,
                center: true,
                grouping: true
              })
        })
        .catch(() => {
          ElMessage({
            type: 'error',
            message: t('project.updateFailure'),
            showClose: true,
            center: true
          })
        })
    }
  })
}
const close = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  bindDialogVisible.value = false
  resetForm()
  getProjectList()
}

function resetForm() {
  newProjectForm.value = { id: 0, name: '', remark: '', org: null }
}
const keywords = ref('')
const columns: TableColumn[] = [
  {
    field: 'name',
    label: t('project.name'),
    width: '450'
  },
  {
    field: 'id',
    label: t('project.modules'),
    width: '300'
  },
  {
    field: 'action',
    label: t('project.action')
  }
]
const loading = ref(true)

let projectDataList = ref<ProjectData[]>([])

interface Params {
  pageIndex?: number
  pageSize?: number
}

const getProjectList = async (params?: Params) => {
  const dat = await getProjectsApi(
    params || {
      pageIndex: 1,
      pageSize: 20
    }
  )
    .catch(() => {})
    .finally(() => {
      loading.value = false
    })

  if (dat) {
    projectDataList.value = dat
  }
}

getProjectList()

const tableData = [
  {
    date: '2016-05-03',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Home'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Office'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Home'
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Office'
  }
]

const toolsetClicked = (type: string, id: number) => {
  push('/projects/' + type + '/' + id)
}
const ffv = ref(true)
</script>

<template>
  <ElDialog
    v-model="bindDialogVisible"
    :title="t('project.create')"
    @close="close(newProjectFormRef)"
    height
    :fullscreen="false"
  >
    <ElForm
      ref="newProjectFormRef"
      status-icon
      label-position="top"
      :model="newProjectForm"
      :rules="newProjectFormRule"
    >
      <ElRow>
        <ElCol :span="10">
          <ElFormItem prop="name" :label="t('project.name')">
            <ElInput
              v-model="newProjectForm.name"
              :label="t('project.name')"
              :placeholder="t('common.inputText') + t('project.name')"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="18">
          <ElFormItem prop="org" :label="t('common.organization')">
            <ElSelect v-model="newProjectForm.org" style="width: 100%">
              <ElOption
                v-for="org in Organizations"
                :key="org.id"
                :label="org.name"
                :value="org.id"
              /> </ElSelect
          ></ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="18">
          <ElFormItem :label="t('common.remark')">
            <ElInput
              v-model="newProjectForm.remark"
              show-word-limit
              maxlength="200"
              type="textarea"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <span>
        <ElButton @click="close(newProjectFormRef)">{{ t('common.cancel') }}</ElButton>
        <ElButton v-if="dlgForCreate" type="primary" @click="submit(newProjectFormRef)">{{
          t('common.ok')
        }}</ElButton>
        <ElButton v-if="!dlgForCreate" type="primary" @click="save(newProjectFormRef)">{{
          t('common.update')
        }}</ElButton>
      </span>
    </template>
  </ElDialog>
  <ElRow justify="space-between">
    <ElCol :span="18">
      <ElSpace wrap>
        <span class="header_title">{{ t('router.projects') }}</span>
        <ElDivider direction="vertical" />
        <ElInput
          v-model="keywords"
          :placeholder="t('project.name')"
          :suffix-icon="Search"
          clearable
        />
      </ElSpace>
    </ElCol>
    <ElCol :span="6" style="text-align: right">
      <ElButton :icon="Plus" @click="openDlg(true)" type="primary">{{
        t('project.create')
      }}</ElButton>
    </ElCol>
  </ElRow>
  <ElTabs>
    <ElTabPane :label="t('project.all')">
      <ElTable :data="projectDataList">
        <ElTableColumn prop="name" :label="t('project.name')" width="450" />
        <ElTableColumn prop="org" :label="t('project.org')" width="500" />
        <ElTableColumn prop="id" :label="t('project.modules')" width="300">
          <template #default="scope">
            <ElSpace>
              <ElTooltip :content="t('project.toolset.code')">
                <ElLink @click="toolsetClicked('codes', scope.row.id)" :underline="false">
                  <Icon class="toolset" icon="mdi:code-braces-box" />
                </ElLink>
              </ElTooltip>
              <ElTooltip :content="t('project.toolset.ci')">
                <ElLink @click="toolsetClicked('ci', scope.row.id)" :underline="false">
                  <Icon class="toolset" icon="ant-design:ci-circle-filled" />
                </ElLink>
              </ElTooltip>
              <ElTooltip v-if="false" :content="t('project.toolset.delivery')">
                <ElLink @click="toolsetClicked('delivery', scope.row.id)" :underline="false">
                  <Icon class="toolset" icon="mdi:truck-delivery" />
                </ElLink>
              </ElTooltip>
              <ElTooltip :content="t('project.toolset.cd')">
                <ElLink @click="toolsetClicked('cd', scope.row.id)" :underline="false">
                  <Icon class="toolset" icon="ic:round-rocket-launch" />
                </ElLink>
              </ElTooltip>
              <ElTooltip :content="t('project.toolset.artifact')">
                <ElLink @click="toolsetClicked('artifacts', scope.row.id)" :underline="false">
                  <Icon class="toolset" icon="cib:azure-artifacts" />
                </ElLink>
              </ElTooltip>
            </ElSpace>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="action" :label="t('project.modules')" width="300" />
      </ElTable>
    </ElTabPane>
    <ElTabPane :label="t('project.archived')">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column fixed prop="date" label="Date" width="150" />
        <el-table-column prop="name" label="Name" width="120" />
        <el-table-column prop="state" label="State" width="120" />
        <el-table-column prop="city" label="City" width="120" />
        <el-table-column prop="address" label="Address" width="600" />
        <el-table-column prop="zip" label="Zip" width="120" />
        <el-table-column fixed="right" label="Operations" width="120">
          <template #default>
            <el-button link type="primary" size="small" @click="handleClick">Detail</el-button>
            <el-button link type="primary" size="small">Edit</el-button>
          </template>
        </el-table-column>
      </el-table>
    </ElTabPane>
  </ElTabs>
</template>

<style scoped>
.header_title {
  font-size: 18px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.toolset {
  cursor: pointer;
  margin-top: 3px;
}
</style>
