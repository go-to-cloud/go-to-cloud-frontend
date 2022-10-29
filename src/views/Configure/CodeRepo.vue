<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import {
  bindRepoApi,
  getCodeRepoApi,
  removeRepoApi,
  testingRepoApi,
  updateRepoApi
} from '@/api/configure/coderepo'
import { getOrganizationsApi } from '@/api/common'
import { CodeRepoData, ScmType } from '@/api/configure/types'
import { ElButton, ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Error } from '@/components/Error'
import { Dialog } from '@/components/Dialog'
import { Connection, Delete, Expand, MagicStick, MoreFilled, Search } from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'
import { Org } from '@/api/common/types'

const bindDialogVisible = ref(false)

interface Params {
  pageIndex?: number
  pageSize?: number
}

const Organizations = ref<Array<Org>>(new Array<Org>())

const getOrganizations = async () => {
  await getOrganizationsApi().then((resp) => {
    if (resp!) {
      codeRepoDetailForm.value.orgs = new Array<number>()
      Organizations.value = new Array<Org>()
      for (let entry of resp.entries()) {
        Organizations.value.push({
          id: Number(entry[0]),
          name: entry[1]
        })
        codeRepoDetailForm.value.orgs.push(Number(entry[0]))
      }
    }
  })
}

getOrganizations()

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
    field: 'orgs',
    label: t('coderepo.orgs'),
    width: '200'
  },
  {
    field: 'remark',
    label: t('common.remark'),
    width: '300'
  },
  {
    field: 'action',
    label: t('coderepo.action')
  }
]

const codeRepoTypeHover = ref(0)

interface CodeRepoType {
  RepoName: string
  Type: ScmType
  Items: Array<any> | null
}

const codeRepoDetailFormRef = ref<FormInstance>()
const codeRepoDetailForm = ref({
  id: 0,
  name: '',
  origin: ScmType.Gitlab,
  isPublic: false,
  url: '',
  token: '',
  remark: '',
  orgs: ref(Array<number>())
})

function resetForm() {
  codeRepoDetailForm.value = {
    id: 0,
    name: '',
    origin: ScmType.Gitlab,
    isPublic: false,
    url: '',
    token: '',
    remark: '',
    orgs: []
  }
}

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

  if (codeRepoDetailForm.value.origin === ScmType.Github) {
    url = hostGithub + url
  } else if (codeRepoDetailForm.value.origin === ScmType.Gitee) {
    url = hostGitee + url
  }
  return new RegExp(pattern).test(url)
}

const codeRepoDetailFormRule = ref<FormRules>({
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
  ],
  orgs: [
    {
      required: true,
      message: t('at_least_one_org'),
      trigger: 'blur',
      validator: (rule, value) => {
        return (value as Array<Org>).length > 0
      }
    }
  ]
})

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
  await getCodeRepoApi(
    params || {
      pageIndex: 1,
      pageSize: 20
    }
  ).then((resp) => {
    codeRepoDataList.value = resp
  })
}

getCodeRepoList()

const keywords = ref('')

const testing = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    await testingRepoApi(codeRepoDetailForm.value)
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
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      await bindRepoApi(codeRepoDetailForm.value)
        .then((resp) => {
          if (resp.success) {
            bindDialogVisible.value = false
            resetForm()
            getCodeRepoList()
          }
          resp.success
            ? ElMessage({
                type: 'success',
                message: t('coderepo.bindSuccess'),
                showClose: true,
                center: true
              })
            : ElMessage({
                type: 'error',
                message: t('coderepo.bindFailure'),
                showClose: true,
                center: true,
                grouping: true
              })
        })
        .catch(() => {
          ElMessage({
            type: 'error',
            message: t('coderepo.bindFailure'),
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
      await updateRepoApi(codeRepoDetailForm.value)
        .then((resp) => {
          if (resp.success) {
            bindDialogVisible.value = false
            resetForm()
            getCodeRepoList()
          }
          resp.success
            ? ElMessage({
                type: 'success',
                message: t('coderepo.updateSuccess'),
                showClose: true,
                center: true
              })
            : ElMessage({
                type: 'error',
                message: t('coderepo.updateFailure'),
                showClose: true,
                center: true,
                grouping: true
              })
        })
        .catch(() => {
          ElMessage({
            type: 'error',
            message: t('coderepo.updateFailure'),
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
  getOrganizations()
}

interface HandlerCommand {
  id: number
  cmd: string
  form: CodeRepoData
}

const dlgForCreate = ref(true)

const removeRepo = async (repoId: number) => {
  await removeRepoApi(repoId).then((resp) => {
    if (resp.success) {
      getCodeRepoList()
    }
  })
}

const actionHandler = (command: HandlerCommand) => {
  switch (command.cmd) {
    case 'del': {
      ElMessageBox.confirm(t('coderepo.removeConfirm'), t('common.confirmMsgTitle'), {
        confirmButtonText: t('common.ok'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }).then(() => {
        removeRepo(command.id)
      })
      break
    }
    case 'view': {
      dlgForCreate.value = false
      bindDialogVisible.value = true
      let orgIds: Array<number> = []
      for (let i = 0; i < command.form.orgLites.length; i++) {
        orgIds.push(command.form.orgLites[i].orgId)
      }
      if (command.form.origin == ScmType.Github) {
        if (command.form.url.startsWith(hostGithub)) {
          command.form.url = command.form.url.substring(hostGithub.length)
        }
      } else if (command.form.origin == ScmType.Gitee) {
        if (command.form.url.startsWith(hostGitee)) {
          command.form.url = command.form.url.substring(hostGitee.length)
        }
      }
      codeRepoDetailForm.value = {
        id: command.form.id,
        name: command.form.name,
        origin: command.form.origin,
        isPublic: command.form.isPublic,
        url: command.form.url,
        token: command.form.token,
        remark: command.form.remark,
        orgs: orgIds
      }
      break
    }
  }
}

function errorClick() {
  dlgForCreate.value = true
  bindDialogVisible.value = true
}
</script>

<template>
  <Error type="coderepo_empty" @error-click="errorClick" v-if="codeRepoDataList.length == 0" />
  <ElRow justify="space-between" v-if="codeRepoDataList.length > 0">
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
      <ElButton
        :icon="Connection"
        type="primary"
        @click="
          () => {
            dlgForCreate = true
            bindDialogVisible = true
          }
        "
        >{{ t('coderepo.bind') }}</ElButton
      >
    </ElCol>
  </ElRow>
  <ElTabs v-if="codeRepoDataList.length > 0">
    <ElTabPane :label="t('coderepo.all')">
      <ElTable style="width: 100%" :data="codeRepoDataList">
        <ElTableColumn prop="name" :label="t('coderepo.name')" width="350">
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
        <ElTableColumn :label="t('coderepo.orgs')" prop="orgLites">
          <template #default="scope">
            <ElSpace>
              <ElTag
                style="cursor: default"
                v-for="item in scope.row.orgLites"
                :key="item.orgId"
                :closable="false"
                >{{ item.orgName }}</ElTag
              >
            </ElSpace></template
          >
        </ElTableColumn>
        <ElTableColumn prop="remark" :label="t('common.remark')" width="300" />
        <ElTableColumn prop="updatedAt" :label="t('coderepo.updatedAt')" width="200" />
        <ElTableColumn fixed="right" prop="id" :label="t('coderepo.action')" width="80">
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
    </ElTabPane>
  </ElTabs>
  <Dialog
    v-model="bindDialogVisible"
    :title="t('coderepo.bind')"
    @close="close(codeRepoDetailFormRef)"
    :fullscreen="false"
  >
    <ElForm
      ref="codeRepoDetailFormRef"
      status-icon
      :rules="codeRepoDetailFormRule"
      label-position="top"
      :model="codeRepoDetailForm"
    >
      <ElRow>
        <ElCol :span="10">
          <ElFormItem prop="name" :label="t('coderepo.name')">
            <ElInput
              v-model="codeRepoDetailForm.name"
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
              @click="codeRepoDetailForm.origin = type.Type"
              class="radio-sel"
              :class="
                type.Type === codeRepoTypeHover || type.Type === codeRepoDetailForm.origin
                  ? 'radio-sel-hover'
                  : 'radio-sel-hover-disabled'
              "
            >
              <Icon
                :icon="GetIcon(type.Type)[0]"
                :color="GetIcon(type.Type)[1]"
                width="44"
                height="44"
              />
              {{ type.RepoName }}
              <div
                :class="type.Type === codeRepoDetailForm.origin ? 'radio-sel-selected' : ''"
              ></div>
            </div>
          </ElSpace>
        </ElFormItem>
      </ElRow>
      <ElRow>
        <ElCol :span="18">
          <ElFormItem prop="orgs" :label="t('common.organization')">
            <ElSelect multiple v-model="codeRepoDetailForm.orgs" style="width: 100%">
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
        <ElFormItem :label="t('coderepo.type')">
          <ElSwitch
            v-model="codeRepoDetailForm.isPublic"
            :inactive-text="t('visibility.private')"
            :active-text="t('visibility.public')"
        /></ElFormItem>
      </ElRow>
      <ElRow>
        <ElCol :span="18">
          <ElFormItem prop="url" :label="t('coderepo.url')">
            <ElInput
              v-model="codeRepoDetailForm.url"
              :placeholder="t('common.inputText') + t('coderepo.url')"
            >
              <template v-if="codeRepoDetailForm.origin === ScmType.Github" #prepend>{{
                hostGithub
              }}</template>
              <template v-else-if="codeRepoDetailForm.origin === ScmType.Gitee" #prepend>
                {{ hostGitee }}
              </template>
            </ElInput>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow v-if="!codeRepoDetailForm.isPublic">
        <ElCol :span="10">
          <ElFormItem :label="t('coderepo.token')">
            <ElInput
              type="password"
              show-password
              autocomplete="off"
              v-model="codeRepoDetailForm.token"
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
          <ElFormItem :label="t('common.remark')">
            <ElInput
              v-model="codeRepoDetailForm.remark"
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
        <ElButton
          @click="testing(codeRepoDetailFormRef)"
          :disabled="!isUrl(codeRepoDetailForm.url)"
          type="success"
          style="position: absolute; left: 10px"
          >{{ t('common.testing') }}</ElButton
        >
        <ElButton @click="close(codeRepoDetailFormRef)">{{ t('common.cancel') }}</ElButton>
        <ElButton v-if="dlgForCreate" type="primary" @click="submit(codeRepoDetailFormRef)">{{
          t('common.ok')
        }}</ElButton>
        <ElButton v-if="!dlgForCreate" type="primary" @click="save(codeRepoDetailFormRef)">{{
          t('common.update')
        }}</ElButton>
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
