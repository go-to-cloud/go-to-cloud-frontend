<script setup lang="ts">
import { useI18n } from '@/hooks/web/useI18n'
import {
  createProjectApi,
  deleteProjectApi,
  getProjectsApi,
  updateProjectApi
} from '@/api/projects'
import { ProjectData } from '@/api/projects/types'
import { ref } from 'vue'
import { ElButton, ElDialog, ElMessage, FormInstance, FormRules } from 'element-plus'
import { Delete, Expand, MoreFilled, Plus, Search } from '@element-plus/icons-vue'
import Icon from '@/components/Icon/src/Icon.vue'
import { useRouter } from 'vue-router'
import { Org } from '@/api/common/types'
import { getOrganizationsApi } from '@/api/common'
import { ElMessageBox } from 'element-plus/es'
import { useVisibilityStore } from '@/store/modules/visibility'

const { t } = useI18n()
const { push } = useRouter()

const Organizations = ref<Array<Org>>(new Array<Org>())
const getOrganizations = async () => {
  await getOrganizationsApi().then((resp) => {
    if (resp!) {
      newProjectForm.value.org = null
      newProjectForm.value.orgId = null
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
  orgId: [
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
  orgId: ref<number | null>(),
  org: ref<string | null>()
})
const openDlg = (create: boolean) => {
  dlgForCreate.value = create
  bindDialogVisible.value = true
}

const submit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid) => {
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
  await formEl.validate(async (valid) => {
    if (valid) {
      await updateProjectApi(newProjectForm.value)
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
  newProjectForm.value = { id: 0, name: '', remark: '', orgId: null, org: null }
}
const keywords = ref('')
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

const toolsetClicked = (type: string, id: number) => {
  console.log('/projects/' + type + '/' + id)
  push('/projects/' + type + '/' + id)
}

interface HandlerCommand {
  id: number
  cmd: string
  form: ProjectData
}

const deleteProject = async (repoId: number) => {
  await deleteProjectApi(repoId).then((resp) => {
    if (resp.success) {
      getProjectList()
    }
  })
}

const dlgTitle = (): string => {
  if (dlgForCreate.value) return t('project.create')

  return t('project.update')
}

const actionHandler = (command: HandlerCommand) => {
  switch (command.cmd) {
    case 'del': {
      ElMessageBox.confirm(t('project.removeConfirm'), t('common.confirmMsgTitle'), {
        confirmButtonText: t('common.ok'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }).then(() => {
        deleteProject(command.id)
      })
      break
    }
    case 'view': {
      dlgForCreate.value = false
      bindDialogVisible.value = true

      newProjectForm.value = {
        id: command.form.id,
        name: command.form.name,
        orgId: command.form.orgId,
        org: command.form.org,
        remark: command.form.remark
      }
      break
    }
  }
}
</script>

<template>
  <ElDialog
    v-model="bindDialogVisible"
    :title="dlgTitle()"
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
          <ElFormItem prop="orgId" :label="t('common.organization')">
            <ElSelect v-model="newProjectForm.orgId" style="width: 100%" :disabled="!dlgForCreate">
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
        <ElTableColumn prop="org" :label="t('common.organization')" width="300">
          <template #default="scope">
            <ElTag style="cursor: default" :closable="false">
              {{ scope.row.org }}
            </ElTag>
          </template>
        </ElTableColumn>
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
        <ElTableColumn prop="action" :label="t('project.action')" width="300">
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
                      {{ t('project.remove') }}
                    </ElLink>
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown></template
          >
        </ElTableColumn>
      </ElTable>
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
