<script setup lang="ts">
import { useI18n } from '@/hooks/web/useI18n'
import { ref } from 'vue'
import { ElButton, ElDialog, FormInstance } from 'element-plus'
import { GitSources } from '@/api/gitsources/types'
import { ScmType } from '@/api/configure/types'
import { Delete, Expand, MoreFilled } from '@element-plus/icons-vue'
import { getBindCodeRepoGroupApi, importSourceCodeApi } from '@/api/projects'
import Icon from '@/components/Icon/src/Icon.vue'
import { BindCodeRepoGroup, CodeRepoKVP } from '@/api/projects/types'
import { ContentDetailWrap } from '@/components/ContentDetailWrap'
import { useRoute, useRouter } from 'vue-router'

const { query } = useRoute()
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

const { t } = useI18n()
const bindDialogVisible = ref(false)

const close = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  bindDialogVisible.value = false
}

const gitSourcesList = ref<GitSources[]>()

const selectedGit = ref('')
const gitHost = ref('')
const combine_git_path = function (item: CodeRepoKVP) {
  return item.namespace + ' / ' + item.label
}
const combine_group_host = function (group: BindCodeRepoGroup) {
  return group.label + '(' + group.host + ')'
}
const gitSelected = function (val: string) {
  for (let i = 0; i < bindCodeRepoGroups.value!.length; i++) {
    for (let j = 0; j < bindCodeRepoGroups.value[i].options!.length; j++) {
      if (bindCodeRepoGroups.value[i].options[j].id === val) {
        gitHost.value = bindCodeRepoGroups.value[i].label
        return
      }
    }
  }
}

const importSourceCode = async () => {
  debugger
  let projectId = Number(query.id as string)
  await importSourceCodeApi(projectId, selectedGit.value).then((dat) => {
    console.log(dat)
  })
}
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
              :value="item.value"
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

    <ElTable :data="gitSourcesList">
      <ElTableColumn prop="name" :label="t('coderepo.git.name')">
        <template #default="scope">
          <ElSpace>
            <Icon
              :icon="GetIcon(scope.row.origin)[0]"
              :color="GetIcon(scope.row.origin)[1]"
              width="24"
              height="24"
            /><span>{{ scope.row.name }}</span>
          </ElSpace>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="origin" :label="t('coderepo.origin')" />
      <ElTableColumn prop="updatedAt" :label="t('coderepo.updatedAt')" width="200" />
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
