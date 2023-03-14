<script lang="ts" setup>
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Table } from '@/components/Table'
import {
  getAllMembersApi,
  getJoinedOrgsApi,
  getOrgListApi,
  saveJoinedMembersApi,
  saveJoinedOrgsApi
} from '@/api/login'
import { MemberData, OrgType } from '@/api/login/types'
import { onMounted, ref } from 'vue'
import { ElButton } from 'element-plus'
import { CirclePlus, Delete, Expand, MoreFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, FormRules } from 'element-plus/es'
import { RestfulResult } from '@/api/common/types'
import { useAxios } from '@/hooks/web/useAxios'
import { isEmpty } from '@/utils/is'

const { t } = useI18n()
const request = useAxios()

const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const mobilePattern = /^1[3-9]\d{9}$/
const isEmail = (exp: string): boolean => {
  return emailPattern.test(exp)
}
const isMobile = (exp: string): boolean => {
  return mobilePattern.test(exp)
}
const memberDataRules = ref<FormRules>({
  account: [
    {
      required: true,
      message: '',
      trigger: 'blur'
    }
  ],
  name: [
    {
      required: true,
      message: '',
      trigger: 'blur'
    }
  ],
  email: [
    {
      required: false,
      message: '',
      trigger: 'blur',
      validator: (rule, value) => isEmail(value) || isEmpty(value)
    }
  ],
  mobile: [
    {
      message: '',
      trigger: 'blur',
      validator: (rule, value) => isMobile(value) || isEmpty(value)
    }
  ]
})

const columns: TableColumn[] = [
  {
    field: 'index',
    label: t('authz.index'),
    type: 'index'
  },
  {
    field: 'name',
    label: t('authz.user.username')
  },
  {
    field: 'belong_count',
    label: t('authz.user.belongs')
  },
  {
    field: 'email',
    label: t('authz.user.email')
  },
  {
    field: 'mobile',
    label: t('authz.user.mobile')
  },
  {
    field: 'action',
    label: t('common.action')
  }
]

const loading = ref(true)
const isCreate = ref<boolean>(false)
const memberList = ref<MemberData[]>([])
const userDlgVisible = ref<boolean>(false)
const orgsDlgVisible = ref<boolean>(false)

const close = () => {
  userDlgVisible.value = false
  orgsDlgVisible.value = false
  currentUser.value = {
    id: 0,
    key: 0,
    belong_count: 0,
    name: '',
    email: '',
    mobile: '',
    account: '',
    pinyin: '',
    pinyin_init: ''
  }
}
const showNewUserDlg = () => {
  isCreate.value = true
  userDlgVisible.value = true
  currentUser.value = {
    id: 0,
    key: 0,
    belong_count: 0,
    name: '',
    email: '',
    mobile: '',
    account: '',
    pinyin: '',
    pinyin_init: ''
  }
}

const getAllMembers = async () => {
  const res = await getAllMembersApi()
    .catch(() => {})
    .finally(() => {
      loading.value = false
    })
  if (res) {
    memberList.value = res
  }
}

const currentUser = ref<MemberData>({
  id: 0,
  key: 0,
  belong_count: 0,
  name: '',
  email: '',
  mobile: '',
  account: '',
  pinyin: '',
  pinyin_init: ''
})

interface HandlerCommand {
  data: MemberData
  cmd: string
}

const joinedOrgs = ref<number[]>([])

const showJoinedOrgs = async (memberId: number) => {
  joinedOrgs.value = []
  currentUser.value!.id = memberId
  await getJoinedOrgsApi(memberId).then((r) => {
    joinedOrgs.value = r
    orgsDlgVisible.value = true
  })
}

let orgList = ref<OrgType[]>([])

const getAllOrgs = async () => {
  const res = await getOrgListApi().catch(() => {})
  if (res) {
    orgList.value = res
  }
}

const actionHandler = async (command: HandlerCommand) => {
  switch (command.cmd) {
    case 'view':
      console.log(command.data)
      isCreate.value = false
      userDlgVisible.value = true
      currentUser.value!.id = command.data.id
      currentUser.value!.name = command.data.name
      currentUser.value!.key = command.data.key
      currentUser.value!.account = command.data.account
      currentUser.value!.email = command.data.email
      currentUser.value!.mobile = command.data.mobile
      break
    case 'belongs':
      await showJoinedOrgs(command.data.id)
      break
    case 'del':
      ElMessageBox.confirm(t('authz.org.deleteConfirm'), t('common.confirmMsgTitle'), {
        confirmButtonText: t('common.ok'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }).then(async () => {
        await request
          .delete<IResponse<RestfulResult>>({
            url: '/user/org/' + command.data.id
          })
          .then(async (r) => {
            if (r.data.code == '200') {
              ElMessage({
                type: 'success',
                message: t('authz.org.deleteSuccess'),
                showClose: true,
                center: true
              })
              await getAllOrgs().then(() => close())
            }
          })
          .catch((r) => {
            ElMessage({
              type: 'error',
              message: t('authz.org.deleteFailure'),
              showClose: true,
              center: true
            })
          })
      })
      break
  }
}

const saveJoinedOrgs = async () => {
  await saveJoinedOrgsApi(currentUser.value!.id, joinedOrgs.value).then(async (resp) => {
    if (resp.code == '200') {
      joinedOrgs.value = []
      orgsDlgVisible.value = false
      await getAllMembers()
    } else {
      ElMessage({
        type: 'error',
        message: t('authz.org.joinFailed'),
        showClose: true,
        center: true
      })
    }
  })
}
onMounted(async () => {
  await getAllOrgs()
  await getAllMembers()
})
</script>

<template>
  <ElDialog v-model="orgsDlgVisible" :title="t('authz.org.title')" draggable width="810px">
    <ElTransfer
      v-model="joinedOrgs"
      :data="orgList"
      :filter-placeholder="t('authz.org.member_filter_placeholder')"
      :titles="[t('authz.user.allOrg'), t('authz.user.belongs')]"
      filterable
      style="text-align: left; display: inline-block"
    >
      <template #default="{ option }">
        <span>{{ option.name }}</span>
      </template>
    </ElTransfer>
    <template #footer>
      <span>
        <ElButton @click="close()">{{ t('common.cancel') }}</ElButton>
        <ElButton type="primary" @click="saveJoinedOrgs">{{ t('common.update') }}</ElButton>
      </span>
    </template>
  </ElDialog>
  <ElDialog v-model="userDlgVisible" :fullscreen="false" :title="t('authz.user.detail')" height>
    <ElForm :model="currentUser" :rules="memberDataRules" label-position="top" status-icon>
      <ElRow>
        <ElCol :span="10">
          <ElFormItem :label="t('authz.user.account')" prop="account">
            <ElInput
              v-model="currentUser.account"
              :disabled="!isCreate"
              :placeholder="t('common.inputText') + t('authz.user.account')"
              :readonly="!isCreate"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="10">
          <ElFormItem :label="t('authz.user.username')" prop="name">
            <ElInput
              v-model="currentUser.name"
              :label="t('authz.user.username')"
              :placeholder="t('common.inputText') + t('authz.user.username')"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="10">
          <ElFormItem :label="t('authz.user.email')" prop="email">
            <ElInput
              v-model="currentUser.email"
              :label="t('authz.user.email')"
              :placeholder="t('common.inputText') + t('authz.user.email')"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="10">
          <ElFormItem :label="t('authz.user.mobile')" prop="mobile">
            <ElInput
              v-model="currentUser.mobile"
              :label="t('authz.user.mobile')"
              :placeholder="t('common.inputText') + t('authz.user.mobile')"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="10">
          <ElFormItem v-if="isCreate" :label="t('authz.user.password')" prop="password">
            <ElInput
              v-model="currentUser.password"
              :label="t('authz.user.mobile')"
              autocomplete="off"
              minlength="6"
              show-password
              type="password"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <span>
        <ElButton @click="close()">{{ t('common.cancel') }}</ElButton>
        <ElButton v-if="isCreate" type="primary" @click="submit()">{{ t('common.save') }}</ElButton>
        <ElButton v-if="!isCreate" type="primary" @click="save()">{{
          t('common.update')
        }}</ElButton>
      </span>
    </template>
  </ElDialog>
  <ContentWrap
    :button="showNewUserDlg"
    :button-icon="CirclePlus"
    :button-text="t('authz.user.new')"
    :message="t('authz.user.message')"
    :title="t('authz.user.title')"
  >
    <Table :columns="columns" :data="memberList" :loading="loading" :selection="false">
      <template #action="scope">
        <ElDropdown @command="actionHandler">
          <span class="el-dropdown-link">
            <ElButton :icon="MoreFilled" circle />
          </span>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem :command="{ data: scope.row, cmd: 'view' }">
                <ElLink :icon="Expand" :underline="false">
                  {{ t('common.viewDetail') }}
                </ElLink>
              </ElDropdownItem>
              <ElDropdownItem :command="{ data: scope.row, cmd: 'belongs' }">
                <Icon icon="material-symbols:group" />
                <ElLink :underline="false" style="margin-left: -2px">
                  {{ t('authz.user.belongs') }}
                </ElLink>
              </ElDropdownItem>
              <ElDropdownItem :command="{ data: scope.row, cmd: 'del' }" divided>
                <ElLink :icon="Delete" :underline="false" type="danger">
                  {{ t('authz.user.delete') }}
                </ElLink>
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </template>
    </Table>
  </ContentWrap>
</template>
