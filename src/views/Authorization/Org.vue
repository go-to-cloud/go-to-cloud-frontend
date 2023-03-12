<script lang="ts" setup>
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Table } from '@/components/Table'
import { getOrgListApi } from '@/api/login'
import { OrgType } from '@/api/login/types'
import { h, ref } from 'vue'

import { Delete, Expand, MoreFilled } from '@element-plus/icons-vue'

const { t } = useI18n()

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

getOrgList()

interface HandlerCommand {
  data: OrgType
  cmd: string
}

const isCreate = ref<boolean>(false)
const bindDialogVisible = ref<boolean>(false)

const currentOrg = ref({
  id: 0,
  name: '',
  remark: ''
})

const close = () => {
  bindDialogVisible.value = false
  currentOrg.value.id = 0
  currentOrg.value.name = ''
  currentOrg.value.remark = ''
}
const actionHandler = (command: HandlerCommand) => {
  switch (command.cmd) {
    case 'view':
      currentOrg.value.id = command.data.id
      currentOrg.value.name = command.data.name
      currentOrg.value.remark = command.data.remark
      bindDialogVisible.value = true
      break
    case 'del':
      break
  }
}
</script>

<template>
  <ElDialog v-model="bindDialogVisible" :fullscreen="false" height>
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
        <ElButton v-if="isCreate" type="primary" @click="submit(newProjectFormRef)">{{
          t('common.ok')
        }}</ElButton>
        <ElButton v-if="!isCreate" type="primary" @click="save(newProjectFormRef)">{{
          t('common.update')
        }}</ElButton>
      </span>
    </template>
  </ElDialog>
  <ContentWrap :message="t('authz.org.message')" :title="t('authz.org.title')">
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
              <ElDropdownItem :command="{ data: scope.row, cmd: 'del' }" divided>
                <ElLink :icon="Delete" :underline="false" type="danger">
                  {{ t('builder.uninstall') }}
                </ElLink>
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </template>
    </Table>
  </ContentWrap>
</template>
