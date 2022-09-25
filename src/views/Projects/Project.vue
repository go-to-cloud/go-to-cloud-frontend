<script setup lang="ts">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Table } from '@/components/Table'
import { getProjectsApi } from '@/api/projects/index'
import { ProjectData } from '@/api/projects/types'
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
    label: t('project.name'),
    width: '450'
  },
  {
    field: 'id',
    label: t('project.modules'),
    width: '300'
  },
  {
    field: 'action',
    label: t('project.action')
  }
]

const loading = ref(true)

let projectDataList = ref<ProjectData[]>([])

const getProjectList = async (params?: Params) => {
  const res = await getProjectsApi(
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
    projectDataList.value = res.data.data
  }
}

getProjectList()

const actionFn = (data: any) => {
  console.log(data)
}
</script>

<template>
  <ContentWrap :title="t('project.title')" :message="t('project.desc')">
    <Table :columns="columns" :data="projectDataList" :loading="loading">
      <template #action="data">
        <ElButton type="primary" @click="actionFn(data)">
          {{ t('tableDemo.action') }}
        </ElButton>
      </template>
    </Table>
  </ContentWrap>
</template>
