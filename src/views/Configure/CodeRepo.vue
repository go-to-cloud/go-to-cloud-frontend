<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { Table } from '@/components/Table'
import { CodeRepoData, GetCodeRepoApi, testingRepoApi } from '@/api/configure/coderepo'
import { ElButton, ElMessage, FormInstance, FormRules } from 'element-plus'
import { Dialog } from '@/components/Dialog'
import { Connection, MagicStick, Search } from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'

const bindDialogVisible = ref(false)

interface Params {
  pageIndex?: number
  pageSize?: number
}

const { t } = useI18n()

const hostGithub = 'https://github.com/'
const hostGitee = 'https://gitee.com/'

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

enum ScmType {
  Gitlab = 0,
  Github = 1,
  Gitee = 2,
  Gitea = 3
}

const loading = ref(true)

const codeRepoTypeHover = ref(0)

interface CodeRepoType {
  RepoName: string
  Type: ScmType
  Items: Array<any> | null
}

const codeRepoCreateFormRef = ref<FormInstance>()
const codeRepoCreateForm = ref({
  name: '',
  origin: ScmType.Gitlab,
  isPublic: false,
  url: '',
  token: null,
  remark: ''
})

function isUrl(url) {
  const pattern =
    '^(https|http)://' +
    "(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" + //user:password@
    '(([0-9]{1,3}.){3}[0-9]{1,3}' + // ip
    '|' + // or
    "([0-9a-z_!~*'()-]+.)*" + // domain
    '([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].' + // sub domain
    '[a-z]{2,6})' + // first level domain- .com and etc
    '(:[0-9]{1,4})?' + // port
    '((/?)|' + // a slash isn't required if there is no file name
    "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$"

  if (codeRepoCreateForm.value.origin === ScmType.Github) {
    url = hostGithub + url
  } else if (codeRepoCreateForm.value.origin === ScmType.Gitee) {
    url = hostGitee + url
  }
  return new RegExp(pattern).test(url)
}

const codeRepoCreateFormRule = ref<FormRules>({
  name: [
    {
      required: true,
      message: '',
      trigger: 'blur'
    }
  ],
  url: [
    {
      required: true,
      message: '',
      trigger: 'blur',
      validator: (rule, value) => isUrl(value)
    }
  ]
})

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
    RepoName: 'Gitlab',
    Type: ScmType.Gitlab,
    Items: null
  },
  {
    RepoName: 'Github',
    Type: ScmType.Github,
    Items: null
  },
  {
    RepoName: 'Gitee',
    Type: ScmType.Gitee,
    Items: null
  },
  {
    RepoName: 'Gitea',
    Type: ScmType.Gitea,
    Items: null
  }
]

const codeRepoDataList = ref<CodeRepoData[]>([])

const getCodeRepoList = async (params?: Params) => {
  const res = await GetCodeRepoApi(
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

const testing = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    const res = await testingRepoApi(codeRepoCreateForm.value)
      .then((resp) => {
        resp.success
          ? ElMessage({
              type: 'success',
              message: t('coderepo.testingPassed'),
              showClose: true,
              center: true
            })
          : ElMessage({
              type: 'error',
              message: t('coderepo.testingFailed'),
              showClose: true,
              center: true,
              grouping: true
            })
      })
      .catch(() => {
        ElMessage({
          type: 'error',
          message: t('coderepo.testingFailed'),
          showClose: true,
          center: true
        })
      })
  })
}
const submit = async (formEl: FormInstance | undefined) => {
  console.log(codeRepoCreateForm.value)
  //bindDialogVisible.value = false
}
const close = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
  bindDialogVisible.value = false
}
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
    <ElForm
      ref="codeRepoCreateFormRef"
      status-icon
      :rules="codeRepoCreateFormRule"
      label-position="top"
      :model="codeRepoCreateForm"
    >
      <ElRow>
        <ElCol :span="10">
          <ElFormItem prop="name" :label="t('coderepo.name')">
            <ElInput
              v-model="codeRepoCreateForm.name"
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
              :key="type.Type"
              @mouseover="codeRepoTypeHover = type.Type"
              @mouseleave="codeRepoTypeHover = -1"
              @click="codeRepoCreateForm.origin = type.Type"
              class="radio-sel"
              :class="
                type.Type === codeRepoTypeHover || type.Type === codeRepoCreateForm.origin
                  ? 'radio-sel-hover'
                  : 'radio-sel-hover-disabled'
              "
            >
              <Icon :icon="GetIcon(type)[0]" :color="GetIcon(type)[1]" width="44" height="44" />
              {{ type.RepoName }}
              <div
                :class="type.Type === codeRepoCreateForm.origin ? 'radio-sel-selected' : ''"
              ></div>
            </div>
          </ElSpace>
        </ElFormItem>
      </ElRow>
      <ElRow>
        <ElFormItem :label="t('coderepo.type')">
          <ElSwitch
            v-model="codeRepoCreateForm.isPublic"
            :inactive-text="t('coderepo.private')"
            :active-text="t('coderepo.public')"
        /></ElFormItem>
      </ElRow>
      <ElRow>
        <ElCol :span="18">
          <ElFormItem prop="url" :label="t('coderepo.url')">
            <ElInput
              v-model="codeRepoCreateForm.url"
              :placeholder="t('common.inputText') + t('coderepo.url')"
            >
              <template v-if="codeRepoCreateForm.origin === ScmType.Github" #prepend>{{
                hostGithub
              }}</template>
              <template v-else-if="codeRepoCreateForm.origin === ScmType.Gitee" #prepend>
                {{ hostGitee }}
              </template>
            </ElInput>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow v-if="!codeRepoCreateForm.isPublic">
        <ElCol :span="10">
          <ElFormItem :label="t('coderepo.token')">
            <ElInput
              type="password"
              show-password
              autocomplete="off"
              v-model="codeRepoCreateForm.token"
              :placeholder="t('common.inputText') + t('coderepo.token')"
            >
              <template #append
                ><ElIcon><MagicStick /> </ElIcon
              ></template>
            </ElInput>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="18">
          <ElFormItem :label="t('coderepo.remark')">
            <ElInput
              v-model="codeRepoCreateForm.remark"
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
        <el-button
          @click="testing(codeRepoCreateFormRef)"
          :disabled="!isUrl(codeRepoCreateForm.url)"
          type="success"
          style="position: absolute; left: 10px"
          >{{ t('common.testing') }}</el-button
        >
        <el-button @click="close(codeRepoCreateFormRef)">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="submit(codeRepoCreateFormRef)">{{
          t('common.ok')
        }}</el-button>
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
