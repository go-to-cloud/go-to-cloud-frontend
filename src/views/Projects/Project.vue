<script setup lang="ts">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Table } from '@/components/Table'
import { getTableListApi } from '@/api/table'
import { TableData } from '@/api/table/types'
import { ref, h } from 'vue'
import { ElTag, ElButton } from 'element-plus'

interface Params {
  pageIndex?: number
  pageSize?: number
}

const { t } = useI18n()

const columns: TableColumn[] = [
  {
    field: 'name',
    label: t('projects.name'),
    width: '500'
  },
  {
    field: 'modules',
    label: t('projects.modules'),
    width: '300'
  },
  {
    field: 'action',
    label: t('projects.action')
  }
]

const loading = ref(true)

let tableDataList = ref<TableData[]>([])

const getTableList = async (params?: Params) => {
  const res = await getTableListApi(
    params || {
      pageIndex: 1,
      pageSize: 10
    }
  )
    .catch(() => {})
    .finally(() => {
      loading.value = false
    })
  if (res) {
    tableDataList.value = res.data.list
  }
}

getTableList()

const acitonFn = (data: TableSlotDefault) => {
  console.log(data)
}
</script>

<template>
  <ContentWrap :title="t('projects.title')" :message="t('projects.desc')">
    <Table :columns="columns" :data="tableDataList" :loading="loading">
      <template #action="data">
        <ElButton type="primary" @click="acitonFn(data as TableSlotDefault)">
          {{ t('tableDemo.action') }}
        </ElButton>
      </template>
    </Table>
  </ContentWrap>
</template>
