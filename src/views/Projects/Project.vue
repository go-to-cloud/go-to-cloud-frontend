<script setup lang="ts">
import { useI18n } from '@/hooks/web/useI18n'
import { Table } from '@/components/Table'
import { getProjectsApi } from '@/api/projects'
import { ProjectData } from '@/api/projects/types'
import { ref } from 'vue'
import { ElButton } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'

const keywords = ref('')

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
  <ElRow justify="space-between">
    <ElCol :span="6">
      <ElSpace wrap>
        <span class="header_title">{{ t('router.projects') }}</span>
        <ElDivider direction="vertical" />
        <ElInput
          v-model="keywords"
          :placeholder="t('project.name')"
          :suffix-icon="Search"
          clearable
        />
      </ElSpace>
    </ElCol>
    <ElCol :span="6">
      <ElButton :icon="Plus" type="primary">{{ t('project.create') }}</ElButton>
    </ElCol>
  </ElRow>
  <ElTabs>
    <ElTabPane :label="t('project.all')">
      <Table :columns="columns" :data="projectDataList" :loading="loading" />
    </ElTabPane>
    <ElTabPane :label="t('project.archived')">
      <span>DFDFDF</span>
    </ElTabPane>
  </ElTabs>
</template>

<style scoped>
.header_title {
  font-size: 18px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}
</style>
