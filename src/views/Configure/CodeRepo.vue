<script setup lang="ts">
import { useI18n } from '@/hooks/web/useI18n'
import { Table } from '@/components/Table'
import { CodeRepoData, getCodeRepoApi } from '@/api/configure/coderepo'
import { ref } from 'vue'
import { ElButton } from 'element-plus'
import { Dialog } from '@/components/Dialog'
import { Connection, Search } from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'

const bindDialogVisible = ref(false)

interface Params {
  pageIndex?: number
  pageSize?: number
}

const { t } = useI18n()

const columns: TableColumn[] = [
  {
    field: 'name',
    label: t('coderepo.name'),
    width: '150'
  },
  {
    field: 'origin',
    label: t('coderepo.origin'),
    width: '300'
  },
  {
    field: 'projects',
    label: t('coderepo.projects'),
    width: '200'
  },
  {
    field: 'remark',
    label: t('coderepo.remark'),
    width: '300'
  },
  {
    field: 'action',
    label: t('coderepo.action')
  }
]

const loading = ref(true)

const codeRepoTypeHover = ref(0)
const codeRepoSelected = ref(1)

enum ScmType {
  Gitlab = 0,
  Github = 1,
  Gitee = 2,
  Gitea = 3
}
interface CodeRepoType {
  Id: number
  RepoName: string
  Type: ScmType
  Items: Array<any> | null
}

function GetIcon(codeRepo: CodeRepoType) {
  switch (codeRepo.Type) {
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

const supportedCodeRepoTypes: Array<CodeRepoType> = [
  {
    Id: 1,
    RepoName: 'Gitlab',
    Type: ScmType.Gitlab,
    Items: null
  },
  {
    Id: 2,
    RepoName: 'Github',
    Type: ScmType.Github,
    Items: null
  },
  {
    Id: 3,
    RepoName: 'Gitee',
    Type: ScmType.Gitee,
    Items: null
  },
  {
    Id: 4,
    RepoName: 'Gitea',
    Type: ScmType.Gitea,
    Items: null
  }
]

let codeRepoDataList = ref<CodeRepoData[]>([])

const getCodeRepoList = async (params?: Params) => {
  const res = await getCodeRepoApi(
    params || {
      pageIndex: 1,
      pageSize: 20
    }
  )
    .catch(() => {})
    .finally(() => {
      loading.value = false
    })

  if (res) {
    codeRepoDataList.value = res.data.data
  }
}

getCodeRepoList()

const keywords = ref('')
const origin = ref('Gitlab')
const isOriginPublic = ref(false)
const remark = ref('')
const address = ref('')
const name = ref('')
</script>

<template>
  <ElRow justify="space-between">
    <ElCol :span="18">
      <ElSpace wrap>
        <span class="header_title">{{ t('router.coderepo') }}</span>
        <ElDivider direction="vertical" />
        <ElInput
          v-model="keywords"
          :placeholder="t('coderepo.name')"
          :suffix-icon="Search"
          clearable
        />
      </ElSpace>
    </ElCol>
    <ElCol :span="6" style="text-align: right">
      <ElButton :icon="Connection" type="primary" @click="bindDialogVisible = true">{{
        t('coderepo.bind')
      }}</ElButton>
    </ElCol>
  </ElRow>
  <ElTabs>
    <ElTabPane :label="t('coderepo.all')">
      <Table :columns="columns" :data="codeRepoDataList" :loading="loading" />
    </ElTabPane>
  </ElTabs>
  <Dialog v-model="bindDialogVisible" :title="t('coderepo.bind')" :fullscreen="false">
    <ElForm label-position="top">
      <ElRow>
        <ElCol :span="10">
          <ElFormItem required :label="t('coderepo.name')">
            <ElInput
              v-model="name"
              :label="t('coderepo.name')"
              :placeholder="t('common.inputText') + t('coderepo.name')"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElFormItem :label="t('coderepo.origin')">
          <ElSpace :size="10" wrap>
            <div
              v-for="type in supportedCodeRepoTypes"
              :key="type.Id"
              @mouseover="codeRepoTypeHover = type.Id"
              @mouseleave="codeRepoTypeHover = 0"
              @click="codeRepoSelected = type.Id"
              class="radio-sel"
              :class="
                type.Id === codeRepoTypeHover || type.Id === codeRepoSelected
                  ? 'radio-sel-hover'
                  : 'radio-sel-hover-disabled'
              "
            >
              <Icon :icon="GetIcon(type)[0]" :color="GetIcon(type)[1]" width="44" height="44" />
              {{ type.RepoName }}
              <div :class="type.Id === codeRepoSelected ? 'radio-sel-selected' : ''"></div>
            </div>
          </ElSpace>
        </ElFormItem>
      </ElRow>
      <ElRow>
        <ElFormItem :label="t('coderepo.type')">
          <ElSwitch
            v-model="isOriginPublic"
            :inactive-text="t('coderepo.private')"
            :active-text="t('coderepo.public')"
        /></ElFormItem>
      </ElRow>
      <ElRow>
        <ElCol :span="18">
          <ElFormItem required :label="t('coderepo.address')">
            <ElInput
              v-model="address"
              :placeholder="t('common.inputText') + t('coderepo.address')"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow v-if="isOriginPublic === false && origin === 'Gitlab'">
        <ElCol :span="10">
          <ElFormItem :label="t('coderepo.user')">
            <ElInput :placeholder="t('common.inputText') + t('coderepo.address')" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow v-if="isOriginPublic === false">
        <ElCol :span="10">
          <ElFormItem :label="t('coderepo.token')">
            <ElInput :placeholder="t('common.inputText') + t('coderepo.token')" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="18">
          <ElFormItem :label="t('coderepo.remark')">
            <ElInput v-model="remark" show-word-limit maxlength="200" type="textarea" />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <span>
        <el-button
          :disabled="address === ''"
          type="success"
          style="position: absolute; left: 10px"
          >{{ t('common.testing') }}</el-button
        >
        <el-button @click="bindDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="dialogFormVisible = false">Confirm</el-button>
      </span>
    </template>
  </Dialog>
</template>

<style scoped>
.header_title {
  font-size: 18px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.radio-sel {
  border: solid 1px #dadfe6;
  text-align: center;
  display: inline-block;
  width: 80px;
  height: 80px;
  position: relative;
}

.radio-sel > svg {
  margin: 6px 18px 0 18px;
}

.radio-sel-hover {
  border: solid 1px #06f;
  cursor: pointer;
}

.radio-sel-hover-disabled {
  cursor: not-allowed;
}

.radio-sel-selected::before {
  content: '';
  position: absolute;
  display: inline-block;
  top: -16px;
  right: -16px;
  border: solid 16px transparent;
  border-bottom-color: #06f;
  transform: rotate(45deg);
}

.radio-sel-selected::after {
  content: '';
  position: absolute;
  display: inline-block;
  right: 0;
  top: 0;
  width: 12px;
  height: 12px;
  background: url(data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjE4IiB3aWR0aD0iMTgiIGZpbGw9IiNmZmYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE2LjAzMSAzLjM0aC0xLjIyOGEuNTYuNTYgMCAwMC0uNDQyLjIxNGwtNy4yNDcgOS4xODEtMy40NzUtNC40MDNhLjU2Mi41NjIgMCAwMC0uNDQyLS4yMTRIMS45N2EuMTQuMTQgMCAwMC0uMTExLjIyNmw0LjgxNSA2LjFhLjU2NC41NjQgMCAwMC44ODQgMGw4LjU4NS0xMC44OGEuMTQuMTQgMCAwMC0uMTEtLjIyNHoiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==)
    no-repeat 50%/100%;
}
</style>
