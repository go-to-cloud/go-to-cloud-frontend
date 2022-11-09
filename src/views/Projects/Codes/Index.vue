<script setup lang="ts">
import { useI18n } from '@/hooks/web/useI18n'
import { ref } from 'vue'
import { ElButton, ElDialog, FormInstance } from 'element-plus'
import { ScmType } from '@/api/configure/types'
import { Delete, Expand, MoreFilled } from '@element-plus/icons-vue'
import { getBindCodeRepoGroupApi, getSourceCodeListApi, importSourceCodeApi } from '@/api/projects'
import { Icon } from '@iconify/vue'
import { BindCodeRepoGroup, CodeRepoKVP, ImportedSourceCodeResult } from '@/api/projects/types'
import { ContentDetailWrap } from '@/components/ContentDetailWrap'
import { useRoute, useRouter } from 'vue-router'

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
  console.log(scmType)
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

const { t } = useI18n()
const bindDialogVisible = ref(false)

const close = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  bindDialogVisible.value = false
}

const sourceCodeList = ref<ImportedSourceCodeResult[]>()
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
  })
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
        <ElButton @click="importSourceCode" type="primary"><Icon icon="uil:import" /></ElButton
      ></ElSpace>
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
        <ElButton @click="showImportGit" type="primary">
          <ElSpace> <Icon icon="uil:import" /> {{ t('coderepo.git.import') }}</ElSpace></ElButton
        >
      </ElCol>
    </ElRow>

    <ElTable :data="sourceCodeList">
      <ElTableColumn prop="url" :label="t('coderepo.git.name')">
        <template #default="scope">
          <ElSpace>
            <Icon
              :icon="GetIcon(scope.row.codeRepoOrigin)[0]"
              :color="GetIcon(scope.row.codeRepoOrigin)[1]"
              width="24"
              height="24"
            /><span
              ><ElLink :underline="false" target="_blank" :href="scope.row.url"
                >{{ scope.row.url
                }}<Icon
                  width="24"
                  height="24"
                  icon="iconoir:open-new-window"
                  class="el-icon--right" /></ElLink
            ></span>
          </ElSpace>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="createdUser" :label="t('coderepo.origin')" />
      <ElTableColumn prop="createdAt" :label="t('coderepo.updatedAt')" width="200" />
      <ElTableColumn fixed="right" prop="id" :label="t('common.action')">
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
