<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import {
  bindRepoApi,
  getCodeRepoApi,
  removeRepoApi,
  testingRepoApi,
  updateRepoApi
} from '@/api/configure/coderepo'
import { getOrganizationsApi } from '@/api/common'
import { CodeRepoData, Params, ScmType } from '@/api/configure/types'
import { ElButton, ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Error } from '@/components/Error'
import { Dialog } from '@/components/Dialog'
import { Connection, Delete, Expand, MagicStick, MoreFilled, Search } from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'
import { Org } from '@/api/common/types'
import { useVisibilityStore } from '@/store/modules/visibility'
import { AuthCodes } from '@/api/constants/auths'

const bindDialogVisible = ref(false)

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
    label: t('common.organization'),
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
  Enabled: boolean
}

const codeRepoDetailFormRef = ref<FormInstance>()
const codeRepoDetailForm = ref({
  id: 0,
  name: '',
  origin: ScmType.Gitlab,
  isPublic: false,
  user: '',
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
    user: '',
    url: '',
    token: '',
    remark: '',
    orgs: []
  }
}

function isUrl(url) {
  // const pattern =
  //   '^(https|http)://' +
  //   "(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" + //user:password@
  //   '(([0-9]{1,3}.){3}[0-9]{1,3}' + // ip
  //   '|' + // or
  //   "([0-9a-z_!~*'()-]+.)*" + // domain
  //   '([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].' + // sub domain
  //   '[a-z]{2,6})' + // first level domain- .com and etc
  //   '(:[0-9]{1,4})?' + // port
  //   '((/?)|' + // a slash isn't required if there is no file name
  //   "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$"

  if (codeRepoDetailForm.value.origin === ScmType.Github) {
    url = hostGithub + url
  } else if (codeRepoDetailForm.value.origin === ScmType.Gitee) {
    url = hostGitee + url
  }
  return url.startsWith('http://') || url.startsWith('https://')
  // return new RegExp(pattern).test(url)
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
      message: t('coderepo.at_least_one_org'),
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
    Items: null,
    Enabled: true
  },
  {
    RepoName: 'Gitea',
    Type: ScmType.Gitea,
    Items: null,
    Enabled: true
  },
  {
    RepoName: 'Github',
    Type: ScmType.Github,
    Items: null,
    Enabled: true
  },
  {
    RepoName: 'Gitee',
    Type: ScmType.Gitee,
    Items: null,
    Enabled: false
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

const visibilityStore = useVisibilityStore()
const auth = computed(() => visibilityStore.getAuthCodes)

// 防止手动页面刷新后状态丢失
watchEffect(async () => {
  await visibilityStore.setAuthCodes()
})
</script>

<template>
  <Error v-if="codeRepoDataList.length === 0" type="coderepo_empty" @error-click="errorClick" />
  <ElRow v-if="codeRepoDataList.length > 0" justify="space-between">
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
    <ElCol
      v-if="auth.includes(AuthCodes.ResConfigureCodeRepoBind)"
      :span="6"
      style="text-align: right"
    >
      <ElButton
        :icon="Connection"
        type="primary"
        @click="
          () => {
            dlgForCreate = true
            bindDialogVisible = true
          }
        "
        >{{ t('coderepo.bind') }}
      </ElButton>
    </ElCol>
  </ElRow>
  <ElTabs v-if="codeRepoDataList.length > 0">
    <ElTabPane :label="t('coderepo.all')">
      <ElTable :data="codeRepoDataList" style="width: 100%">
        <ElTableColumn :label="t('coderepo.name')" prop="name" width="350">
          <template #default="scope">
            <ElSpace>
              <Icon
                :color="GetIcon(scope.row.origin)[1]"
                :icon="GetIcon(scope.row.origin)[0]"
                height="24"
                width="24"
              />
              <span>{{ scope.row.name }}</span>
            </ElSpace>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('common.organization')" prop="orgLites">
          <template #default="scope">
            <ElSpace>
              <ElTag
                v-for="item in scope.row.orgLites"
                :key="item.orgId"
                :closable="false"
                style="cursor: default"
                >{{ item.orgName }}
              </ElTag>
            </ElSpace>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('common.remark')" prop="remark" width="300" />
        <ElTableColumn :label="t('coderepo.updatedAt')" prop="updatedAt" width="200" />
        <ElTableColumn :label="t('coderepo.action')" fixed="right" prop="id" width="80">
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
                  <ElDropdownItem
                    v-if="auth.includes(AuthCodes.ResConfigureCodeRepoRemove)"
                    :command="{ id: scope.row.id, cmd: 'del' }"
                    divided
                  >
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
    :fullscreen="false"
    :title="t('coderepo.bind')"
    @close="close(codeRepoDetailFormRef)"
  >
    <ElForm
      ref="codeRepoDetailFormRef"
      :model="codeRepoDetailForm"
      :rules="codeRepoDetailFormRule"
      label-position="top"
      status-icon
    >
      <ElRow>
        <ElCol :span="10">
          <ElFormItem :label="t('coderepo.name')" prop="name">
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
              :class="
                type.Type === codeRepoTypeHover || type.Type === codeRepoDetailForm.origin
                  ? type.Enabled
                    ? 'radio-sel-hover'
                    : 'radio-sel-hover-disabled'
                  : ''
              "
              class="radio-sel"
              @click="type.Enabled ? (codeRepoDetailForm.origin = type.Type) : true"
              @mouseleave="codeRepoTypeHover = -1"
              @mouseover="codeRepoTypeHover = type.Type"
            >
              <Icon
                :color="GetIcon(type.Type)[1]"
                :icon="GetIcon(type.Type)[0]"
                height="44"
                width="44"
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
          <ElFormItem :label="t('common.organization')" prop="orgs">
            <ElSelect v-model="codeRepoDetailForm.orgs" multiple style="width: 100%">
              <ElOption
                v-for="org in Organizations"
                :key="org.id"
                :label="org.name"
                :value="org.id"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElFormItem :label="t('coderepo.type')">
          <ElSwitch
            v-model="codeRepoDetailForm.isPublic"
            :active-text="t('visibility.public')"
            :inactive-text="t('visibility.private')"
            disabled
          />
        </ElFormItem>
      </ElRow>
      <ElRow>
        <ElCol :span="18">
          <ElFormItem :label="t('coderepo.url')" prop="url">
            <ElInput
              v-model="codeRepoDetailForm.url"
              :placeholder="t('common.inputText') + t('coderepo.url')"
            >
              <template v-if="codeRepoDetailForm.origin === ScmType.Github" #prepend
                >{{ hostGithub }}
              </template>
              <template v-else-if="codeRepoDetailForm.origin === ScmType.Gitee" #prepend>
                {{ hostGitee }}
              </template>
            </ElInput>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow v-if="false">
        <ElCol :span="18">
          <ElFormItem :label="t('authz.user.account')" prop="user">
            <ElInput
              v-model="codeRepoDetailForm.user"
              :placeholder="t('common.inputText') + t('authz.user.account')"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow v-if="!codeRepoDetailForm.isPublic">
        <ElCol :span="10">
          <ElFormItem :label="t('coderepo.token')">
            <ElInput
              v-model="codeRepoDetailForm.token"
              :placeholder="t('common.inputText') + t('coderepo.token')"
              autocomplete="off"
              show-password
              type="password"
            >
              <template #append>
                <ElIcon>
                  <MagicStick />
                </ElIcon>
              </template>
            </ElInput>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="18">
          <ElFormItem :label="t('common.remark')">
            <ElInput
              v-model="codeRepoDetailForm.remark"
              maxlength="200"
              show-word-limit
              type="textarea"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <span>
        <ElButton
          :disabled="!isUrl(codeRepoDetailForm.url)"
          style="position: absolute; left: 10px"
          type="success"
          @click="testing(codeRepoDetailFormRef)"
          >{{ t('common.testing') }}</ElButton
        >
        <ElButton @click="close(codeRepoDetailFormRef)">{{ t('common.close') }}</ElButton>
        <ElButton
          v-if="dlgForCreate && auth.includes(AuthCodes.ResConfigureCodeRepoBind)"
          type="primary"
          @click="submit(codeRepoDetailFormRef)"
          >{{ t('common.ok') }}</ElButton
        >
        <ElButton
          v-if="!dlgForCreate && auth.includes(AuthCodes.ResConfigureCodeRepoUpdate)"
          type="primary"
          @click="save(codeRepoDetailFormRef)"
          >{{ t('common.update') }}</ElButton
        >
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
