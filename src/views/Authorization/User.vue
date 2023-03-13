<script setup lang="ts">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Table } from '@/components/Table'
import { getAllMembersApi } from '@/api/login'
import { MemberData, OrgType } from '@/api/login/types'
import { ref, onMounted } from 'vue'
import { ElButton } from 'element-plus'
import { CirclePlus, Delete, Expand, MoreFilled, UserFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, FormRules } from 'element-plus/es'
import { RestfulResult } from '@/api/common/types'
import { useAxios } from '@/hooks/web/useAxios'
import { isEmpty, isRegExp } from '@/utils/is'

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

const close = () => {
  userDlgVisible.value = false
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
              await getOrgList().then(() => close())
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
onMounted(async () => {
  await getAllMembers()
})
</script>

<template>
  <ElDialog v-model="userDlgVisible" :fullscreen="false" :title="t('authz.user.detail')" height>
    <ElForm :model="currentUser" label-position="top" status-icon :rules="memberDataRules">
      <ElRow>
        <ElCol :span="10">
          <ElFormItem :label="t('authz.user.account')" prop="account">
            <ElInput
              v-model="currentUser.account"
              :readonly="!isCreate"
              :disabled="!isCreate"
              :placeholder="t('common.inputText') + t('authz.user.account')"
            />
          </ElFormItem>
        </ElCol> </ElRow
      ><ElRow>
        <ElCol :span="10">
          <ElFormItem :label="t('authz.user.username')" prop="name">
            <ElInput
              v-model="currentUser.name"
              :label="t('authz.user.username')"
              :placeholder="t('common.inputText') + t('authz.user.username')"
            />
          </ElFormItem>
        </ElCol> </ElRow
      ><ElRow>
        <ElCol :span="10">
          <ElFormItem :label="t('authz.user.email')" prop="email">
            <ElInput
              v-model="currentUser.email"
              :label="t('authz.user.email')"
              :placeholder="t('common.inputText') + t('authz.user.email')"
            />
          </ElFormItem>
        </ElCol> </ElRow
      ><ElRow>
        <ElCol :span="10">
          <ElFormItem :label="t('authz.user.mobile')" prop="mobile">
            <ElInput
              v-model="currentUser.mobile"
              :label="t('authz.user.mobile')"
              :placeholder="t('common.inputText') + t('authz.user.mobile')"
            />
          </ElFormItem>
        </ElCol> </ElRow
      ><ElRow>
        <ElCol :span="10">
          <ElFormItem v-if="isCreate" :label="t('authz.user.password')" prop="password">
            <ElInput
              minlength="6"
              show-password
              type="password"
              autocomplete="off"
              v-model="currentUser.password"
              :label="t('authz.user.mobile')"
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
    :title="t('authz.user.title')"
    :message="t('authz.user.message')"
    :button="showNewUserDlg"
    :button-text="t('authz.user.new')"
    :button-icon="CirclePlus"
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
