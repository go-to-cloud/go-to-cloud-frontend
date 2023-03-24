<script lang="ts" setup>
import { useI18n } from '@/hooks/web/useI18n'
import { computed, ref, watchEffect } from 'vue'
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
import { useVisibilityStore } from '@/store/modules/visibility'
import { AuthCodes } from '@/api/constants/auths'

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

const visibilityStore = useVisibilityStore()
const auth = computed(() => visibilityStore.getAuthCodes)

// 防止手动页面刷新后状态丢失
watchEffect(async () => {
  await visibilityStore.setAuthCodes()
})
</script>

<template>
  <ElDialog v-model="bindDialogVisible" :fullscreen="false" :title="t('coderepo.git.import')">
    <ElForm
      ref="codeRepoDetailFormRef"
      :model="codeRepoDetailForm"
      label-position="top"
      status-icon
    >
      <ElSpace wrap>
        <ElSelect v-model="selectedGit" :placeholder="t('common.selectText')" @change="gitSelected">
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
        <ElButton
          v-if="auth.includes(AuthCodes.ResProjectSourceCodeImport)"
          type="primary"
          @click="importSourceCode"
        >
          <Icon icon="uil:import" />
        </ElButton>
        <ElButton :icon="CircleCloseFilled" type="danger" @click="bindDialogVisible = false"
          >关闭
        </ElButton>
      </ElSpace>
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
      <ElCol
        v-if="auth.includes(AuthCodes.ResProjectSourceCodeImport)"
        :span="6"
        style="text-align: right"
      >
        <ElButton type="primary" @click="showImportGit">
          <ElSpace>
            <Icon icon="uil:import" />
            {{ t('coderepo.git.import') }}
          </ElSpace>
        </ElButton>
      </ElCol>
    </ElRow>
    <ElTable :data="sourceCodeList">
      <ElTableColumn :label="t('coderepo.git.name')" width="600" prop="url">
        <template #default="scope">
          <ElSpace>
            <Icon
              :color="GetIcon(scope.row.codeRepoOrigin)[1]"
              :icon="GetIcon(scope.row.codeRepoOrigin)[0]"
              height="24"
              width="24"
            />
            <span>
              <ElTooltip :content="scope.row.url" effect="dark">
                <ElLink
                  :href="scope.row.url"
                  :underline="false"
                  style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap"
                  target="_blank"
                  >{{ scope.row.url
                  }}<Icon
                    class="el-icon--right"
                    height="20"
                    icon="iconoir:open-new-window"
                    width="20" /></ElLink></ElTooltip
            ></span>
          </ElSpace>
        </template>
      </ElTableColumn>
      <ElTableColumn :label="t('project.latest_ci')" prop="latestBuildAt" width="250" />
      <ElTableColumn :label="t('project.updatedAt')" prop="updatedAt" width="250" />
      <ElTableColumn
        v-if="auth.includes(AuthCodes.ResProjectSourceDelete)"
        :label="t('common.action')"
        fixed="right"
        prop="id"
      >
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
