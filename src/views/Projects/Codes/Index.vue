<script setup lang="ts">
import { useI18n } from '@/hooks/web/useI18n'
import { ref } from 'vue'
import { GitSources } from '@/api/gitsources/types'
import { ScmType } from '@/api/configure/types'
import { Delete, Expand, MoreFilled } from '@element-plus/icons-vue'
import Dialog from '@/components/Dialog/src/Dialog.vue'
import { FormInstance } from 'element-plus/es'
import { getBindCodeRepoGroupApi } from '@/api/projects'
import { BindCodeRepoGroup, CodeRepoKVP } from '@/api/projects/types'

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
const githost = ref('')
const combine_git_path = function (item: CodeRepoKVP) {
  return item.namespace + ' / ' + item.label
}
const gitSelected = function (val: string) {
  for (let i = 0; i < bindCodeRepoGroups.value!.length; i++) {
    for (let j = 0; j < bindCodeRepoGroups.value[i].options!.length; j++) {
      if (bindCodeRepoGroups.value[i].options[j].id === val) {
        githost.value = bindCodeRepoGroups.value[i].label
        return
      }
    }
  }
}
</script>

<template>
  <Dialog v-model="bindDialogVisible" :title="t('coderepo.git.import')" :fullscreen="false">
    <ElForm
      ref="codeRepoDetailFormRef"
      status-icon
      label-position="top"
      :model="codeRepoDetailForm"
    >
      <ElFormItem>
        <ElSpace>
          <ElSelect
            @change="gitSelected"
            v-model="selectedGit"
            :placeholder="t('common.selectText')"
          >
            <template #prefix>{{ githost }}</template>
            <ElOptionGroup v-for="group in bindCodeRepoGroups" :key="group.id" :label="group.label">
              <ElOption
                v-for="item in group.options"
                :key="item.value"
                :label="combine_git_path(item)"
                :value="item.id"
              />
            </ElOptionGroup>
          </ElSelect>
          <ElButton type="primary"
            ><ElSpace><Icon icon="uil:import" />{{ t('coderepo.git.import') }}</ElSpace></ElButton
          ></ElSpace
        >
      </ElFormItem>
      <template #footer>
        <span>
          <ElButton @click="close(codeRepoDetailFormRef)">{{ t('common.cancel') }}</ElButton>
          <ElButton type="primary">{{ t('common.ok') }}</ElButton>
        </span>
      </template>
    </ElForm>
  </Dialog>
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
</template>

<style scoped></style>
