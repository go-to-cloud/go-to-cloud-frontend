<script setup lang="ts">
import { useI18n } from '@/hooks/web/useI18n'
import { ref } from 'vue'
import { ElButton, ElDialog, ElMessage, FormInstance } from 'element-plus'
import { ScmType } from '@/api/configure/types'
import { CircleCloseFilled, Delete, MoreFilled, Search } from '@element-plus/icons-vue'
import {
  getBindCodeRepoGroupApi,
  getSourceCodeListApi,
  importSourceCodeApi,
  removeSourceCodeApi
} from '@/api/projects'
import { Icon } from '@iconify/vue'
import { BindCodeRepoGroup, CodeRepoKVP, ImportedSourceCodeData } from '@/api/projects/types'
import { ContentDetailWrap } from '@/components/ContentDetailWrap'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus/es'

const { t } = useI18n()
const { path, params } = useRoute()
const { push } = useRouter()
const codeRepoDetailFormRef = ref<FormInstance>()
const codeRepoDetailForm = ref({
  id: 0,
  name: '',
  origin: ScmType.Gitlab,
  url: ''
})

const showImportGit = function () {
  getBindCodeRepoGroups()
  bindDialogVisible.value = true
}
const bindCodeRepoGroups = ref<BindCodeRepoGroup[]>([])

const getBindCodeRepoGroups = async () => {
  await getBindCodeRepoGroupApi().then((dat) => {
    if (dat!) {
      bindCodeRepoGroups.value = dat
    }
  })
}

function GetIcon(scmType: ScmType) {
  switch (scmType) {
    case ScmType.Gitlab:
      return ['logos:gitlab', null]
    case ScmType.Github:
      return ['ant-design:github-outlined', '#24292F']
    case ScmType.Gitee:
      return ['simple-icons:gitee', '#B7312D']
    case ScmType.Gitea:
      return ['simple-icons:gitea', '#528321']
    default:
      return [ScmType.Gitlab, null]
  }
}

const bindDialogVisible = ref(false)

const close = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  bindDialogVisible.value = false
}

const sourceCodeList = ref<ImportedSourceCodeData[]>()

const getSourceCodeList = async () => {
  let projectId = Number(params.id)
  await getSourceCodeListApi(projectId).then((dat) => {
    sourceCodeList.value = dat
  })
}

const selectedGit = ref<CodeRepoKVP>()
const gitHost = ref('')
const combine_git_path = function (item: CodeRepoKVP) {
  return item.namespace + ' / ' + item.label
}
const combine_group_host = function (group: BindCodeRepoGroup) {
  return group.label + '(' + group.host + ')'
}
const gitSelected = function (val: CodeRepoKVP) {
  for (let i = 0; i < bindCodeRepoGroups.value!.length; i++) {
    for (let j = 0; j < bindCodeRepoGroups.value[i].options!.length; j++) {
      if (bindCodeRepoGroups.value[i].options[j].id === val.id) {
        gitHost.value = bindCodeRepoGroups.value[i].label
        return
      }
    }
  }
}

const importSourceCode = async () => {
  let projectId = Number(params.id)
  await importSourceCodeApi(projectId, selectedGit.value!).then(async (dat) => {
    await getSourceCodeList()
    ElMessage({
      message: t('project.sourceCode.importSuccess'),
      type: 'success'
    })
  })
}

interface HandlerCommand {
  id: number
  cmd: string
  form: ImportedSourceCodeData
}

const removeSourceCode = async (projectId: number, sourceCodeId: number) => {
  await removeSourceCodeApi(projectId, sourceCodeId).then(async (resp) => {
    if (resp.success) {
      await getSourceCodeList()
    }
  })
}
const actionHandler = (command: HandlerCommand) => {
  switch (command.cmd) {
    case 'del': {
      ElMessageBox.confirm(t('project.sourceCode.removeConfirm'), t('common.confirmMsgTitle'), {
        confirmButtonText: t('common.ok'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }).then(() => {
        let projectId = Number(params.id)
        removeSourceCode(projectId, command.id)
      })
      break
    }
  }
}

getSourceCodeList()
</script>

<template>
  <ElDialog v-model="bindDialogVisible" :title="t('coderepo.git.import')" :fullscreen="false">
    <ElForm
      ref="codeRepoDetailFormRef"
      status-icon
      label-position="top"
      :model="codeRepoDetailForm"
    >
      <ElSpace wrap>
        <ElSelect @change="gitSelected" v-model="selectedGit" :placeholder="t('common.selectText')">
          <template #prefix>{{ gitHost }}</template>
          <ElOptionGroup
            v-for="group in bindCodeRepoGroups"
            :key="group.id"
            :label="combine_group_host(group)"
          >
            <ElOption
              v-for="item in group.options"
              :key="item.value"
              :label="combine_git_path(item)"
              :value="item"
            />
          </ElOptionGroup>
        </ElSelect>
        <ElButton @click="importSourceCode" type="primary"><Icon icon="uil:import" /></ElButton>
        <ElButton @click="bindDialogVisible = false" :icon="CircleCloseFilled" type="danger"
          >关闭</ElButton
        ></ElSpace
      >
      <template #footer>
        <span>
          <ElButton @click="close(codeRepoDetailFormRef)">{{ t('common.cancel') }}</ElButton>
          <ElButton type="primary">{{ t('common.ok') }}</ElButton>
        </span>
      </template>
    </ElForm>
  </ElDialog>
  <ContentDetailWrap :title="t('project.toolset.code')" @back="push('/projects/index')">
    <ElRow justify="space-between">
      <ElCol :span="18">
        <ElSpace wrap>
          <ElInput
            v-model="filterKeywords"
            :placeholder="t('coderepo.name')"
            :suffix-icon="Search"
            clearable
          />
        </ElSpace>
      </ElCol>
      <ElCol :span="6" style="text-align: right">
        <ElButton @click="showImportGit" type="primary">
          <ElSpace> <Icon icon="uil:import" /> {{ t('coderepo.git.import') }}</ElSpace></ElButton
        >
      </ElCol>
    </ElRow>
    <ElTable :data="sourceCodeList">
      <ElTableColumn prop="url" min-width="60%" :label="t('coderepo.git.name')">
        <template #default="scope">
          <ElSpace>
            <Icon
              :icon="GetIcon(scope.row.codeRepoOrigin)[0]"
              :color="GetIcon(scope.row.codeRepoOrigin)[1]"
              width="24"
              height="24"
            /><span>
              <ElTooltip effect="dark" :content="scope.row.url">
                <ElLink
                  style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap"
                  :underline="false"
                  target="_blank"
                  :href="scope.row.url"
                  >{{ scope.row.url
                  }}<Icon
                    width="20"
                    height="20"
                    icon="iconoir:open-new-window"
                    class="el-icon--right" /></ElLink></ElTooltip
            ></span>
          </ElSpace>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="latestBuildAt" :label="t('project.latest_ci')" />
      <ElTableColumn prop="updatedAt" :label="t('project.updatedAt')" width="200" />
      <ElTableColumn fixed="right" prop="id" :label="t('common.action')">
        <template #default="scope">
          <ElDropdown @command="actionHandler">
            <span class="el-dropdown-link">
              <ElButton :icon="MoreFilled" circle />
            </span>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem :command="{ id: scope.row.id, cmd: 'del' }">
                  <ElLink :icon="Delete" :underline="false" type="danger">
                    {{ t('coderepo.remove') }}
                  </ElLink>
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </template>
      </ElTableColumn>
    </ElTable>
  </ContentDetailWrap>
</template>

<style scoped></style>
