<script lang="ts" setup>
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Table } from '@/components/Table'
import {
  getAllMembersApi,
  getJoinedMemberApi,
  getOrgListApi,
  saveJoinedMembersApi
} from '@/api/login'
import { MemberData, OrgType } from '@/api/login/types'
import { h, onMounted, ref } from 'vue'
import { Delete, Expand, MoreFilled, Connection, UserFilled } from '@element-plus/icons-vue'
import { useAxios } from '@/hooks/web/useAxios'
import { DeleteResult } from '@/api/monitor/types'
import { RestfulResult } from '@/api/common/types'
import { ElMessage } from 'element-plus'
import { ElMessageBox } from 'element-plus/es'

const { t } = useI18n()
const request = useAxios()

const columns: TableColumn[] = [
  {
    field: 'index',
    label: t('authz.index'),
    type: 'index'
  },
  {
    field: 'name',
    label: t('authz.org.name')
  },
  {
    field: 'created_at',
    label: t('authz.created_at')
  },
  {
    field: 'member_count',
    label: t('authz.org.member_count')
  },
  {
    field: 'remark',
    label: t('authz.remark'),
    formatter: (row: OrgType) => {
      return h('span', row.remark)
    }
  },
  {
    field: 'action',
    label: t('common.action')
  }
]

const loading = ref(true)

let orgList = ref<OrgType[]>([])

const getOrgList = async () => {
  const res = await getOrgListApi()
    .catch(() => {})
    .finally(() => {
      loading.value = false
    })
  if (res) {
    orgList.value = res
  }
}

const getAllMembers = async () => {
  const res = await getAllMembersApi()
    .catch(() => {})
    .finally(() => {
      loading.value = false
    })
  if (res) {
    allMembers.value = res
  }
}

const allMembers = ref<MemberData[]>([])
const joinedMembers = ref<number[]>([])

onMounted(async () => {
  await getOrgList()
  await getAllMembers()
})

interface HandlerCommand {
  data: OrgType
  cmd: string
}

const isCreate = ref<boolean>(false)
const bindDialogVisible = ref<boolean>(false)
const memberDialogVisible = ref<boolean>(false)

const currentOrg = ref({
  id: 0,
  name: '',
  remark: ''
})

const close = () => {
  bindDialogVisible.value = false
  memberDialogVisible.value = false
  currentOrg.value.id = 0
  currentOrg.value.name = ''
  currentOrg.value.remark = ''
}
const saveMembers = async () => {
  await saveJoinedMembersApi(currentOrg.value.id, joinedMembers.value).then((resp) => {
    if (resp.code == '200') {
      joinedMembers.value = []
      memberDialogVisible.value = false
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
const showJoinedMembers = async (orgId: number) => {
  joinedMembers.value = []
  currentOrg.value.id = orgId
  await getJoinedMemberApi(orgId).then((r) => {
    joinedMembers.value = r
    memberDialogVisible.value = true
  })
}
const actionHandler = async (command: HandlerCommand) => {
  switch (command.cmd) {
    case 'view':
      isCreate.value = false
      currentOrg.value.id = command.data.id
      currentOrg.value.name = command.data.name
      currentOrg.value.remark = command.data.remark
      bindDialogVisible.value = true
      break
    case 'member':
      await showJoinedMembers(command.data.id)
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

const save = async () => {
  await request
    .put<IResponse<RestfulResult>>({
      url: '/user/org',
      data: currentOrg.value
    })
    .then(async (r) => {
      if (r.data.code == '200') {
        ElMessage({
          type: 'success',
          message: t('authz.org.updateSuccess'),
          showClose: true,
          center: true
        })
        await getOrgList().then(() => close())
      }
    })
    .catch((r) => {
      ElMessage({
        type: 'error',
        message: t('authz.org.updateFailure'),
        showClose: true,
        center: true
      })
    })
}
const submit = async () => {
  await request
    .post<IResponse<RestfulResult>>({
      url: '/user/org',
      data: currentOrg.value
    })
    .then(async (r) => {
      if (r.data.code == '200') {
        ElMessage({
          type: 'success',
          message: t('authz.org.createSuccess'),
          showClose: true,
          center: true
        })
        await getOrgList().then(() => close())
      }
    })
    .catch((r) => {
      ElMessage({
        type: 'error',
        message: t('authz.org.createFailure'),
        showClose: true,
        center: true
      })
    })
}
const showNewOrgDlg = () => {
  currentOrg.value.id = 0
  isCreate.value = true
  currentOrg.value.name = ''
  currentOrg.value.remark = ''
  bindDialogVisible.value = true
}
</script>

<template>
  <ElDialog v-model="memberDialogVisible" :title="t('authz.org.member')" draggable width="810px">
    <ElTransfer
      :data="allMembers"
      v-model="joinedMembers"
      :titles="[t('authz.org.allMember'), t('authz.org.joinedMember')]"
      style="text-align: left; display: inline-block"
      filterable
      :filter-placeholder="t('authz.org.member_filter_placeholder')"
    >
      <template #default="{ option }">
        <span>{{ option.name }} ({{ option.account }})</span>
      </template>
    </ElTransfer>
    <template #footer>
      <span>
        <ElButton @click="close()">{{ t('common.cancel') }}</ElButton>
        <ElButton type="primary" @click="saveMembers">{{ t('common.update') }}</ElButton>
      </span>
    </template>
  </ElDialog>
  <ElDialog v-model="bindDialogVisible" :fullscreen="false" :title="t('authz.org.detail')" height>
    <ElForm :model="currentOrg" label-position="top" status-icon>
      <ElRow>
        <ElCol :span="10">
          <ElFormItem :label="t('authz.org.name')" prop="name">
            <ElInput
              v-model="currentOrg.name"
              :label="t('authz.org.nam')"
              :placeholder="t('common.inputText') + t('authz.org.name')"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="18">
          <ElFormItem :label="t('common.remark')">
            <ElInput v-model="currentOrg.remark" maxlength="200" show-word-limit type="textarea" />
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
    :message="t('authz.org.message')"
    :title="t('authz.org.title')"
    :button="showNewOrgDlg"
    :button-text="t('authz.org.new')"
    :button-icon="Connection"
  >
    <Table :columns="columns" :data="orgList" :loading="loading" :selection="false">
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
              <ElDropdownItem :command="{ data: scope.row, cmd: 'member' }">
                <ElLink :icon="UserFilled" :underline="false">
                  {{ t('authz.org.member') }}
                </ElLink>
              </ElDropdownItem>
              <ElDropdownItem :command="{ data: scope.row, cmd: 'del' }" divided>
                <ElLink :icon="Delete" :underline="false" type="danger">
                  {{ t('authz.org.delete') }}
                </ElLink>
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </template>
    </Table>
  </ContentWrap>
</template>

<style scoped>
.el-transfer {
  --el-transfer-panel-width: 300px;
}
</style>
