<script setup lang="ts">
import { useI18n } from '@/hooks/web/useI18n'
import { getProjectsApi } from '@/api/projects'
import { ProjectData } from '@/api/projects/types'
import { ref } from 'vue'
import { ElButton } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import Icon from '@/components/Icon/src/Icon.vue'
import { useRouter } from 'vue-router'

const { push } = useRouter()

const keywords = ref('')
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

interface Params {
  pageIndex?: number
  pageSize?: number
}

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

const tableData = [
  {
    date: '2016-05-03',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Home'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Office'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Home'
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Office'
  }
]

const toolsetClicked = (type: string, id: number) => {
  push('/projects/' + type + '/' + id)
}
</script>

<template>
  <ElRow justify="space-between">
    <ElCol :span="18">
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
    <ElCol :span="6" style="text-align: right">
      <ElButton :icon="Plus" type="primary">{{ t('project.create') }}</ElButton>
    </ElCol>
  </ElRow>
  <ElTabs>
    <ElTabPane :label="t('project.all')">
      <ElTable :data="projectDataList">
        <ElTableColumn prop="name" :label="t('project.name')" width="450" />
        <ElTableColumn prop="id" :label="t('project.modules')" width="300">
          <template #default="scope">
            <ElSpace>
              <ElTooltip :content="t('project.toolset.code')">
                <ElLink @click="toolsetClicked('codes', scope.row.id)" :underline="false">
                  <Icon class="toolset" icon="mdi:code-braces-box" />
                </ElLink>
              </ElTooltip>
              <ElTooltip :content="t('project.toolset.ci')">
                <ElLink @click="toolsetClicked('ci', scope.row.id)" :underline="false">
                  <Icon class="toolset" icon="ant-design:ci-circle-filled" />
                </ElLink>
              </ElTooltip>
              <ElTooltip v-if="false" :content="t('project.toolset.delivery')">
                <ElLink @click="toolsetClicked('delivery', scope.row.id)" :underline="false">
                  <Icon class="toolset" icon="mdi:truck-delivery" />
                </ElLink>
              </ElTooltip>
              <ElTooltip :content="t('project.toolset.cd')">
                <ElLink @click="toolsetClicked('cd', scope.row.id)" :underline="false">
                  <Icon class="toolset" icon="ic:round-rocket-launch" />
                </ElLink>
              </ElTooltip>
              <ElTooltip :content="t('project.toolset.artifact')">
                <ElLink @click="toolsetClicked('artifacts', scope.row.id)" :underline="false">
                  <Icon class="toolset" icon="cib:azure-artifacts" />
                </ElLink>
              </ElTooltip>
            </ElSpace>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="action" :label="t('project.modules')" width="300" />
      </ElTable>
    </ElTabPane>
    <ElTabPane :label="t('project.archived')">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column fixed prop="date" label="Date" width="150" />
        <el-table-column prop="name" label="Name" width="120" />
        <el-table-column prop="state" label="State" width="120" />
        <el-table-column prop="city" label="City" width="120" />
        <el-table-column prop="address" label="Address" width="600" />
        <el-table-column prop="zip" label="Zip" width="120" />
        <el-table-column fixed="right" label="Operations" width="120">
          <template #default>
            <el-button link type="primary" size="small" @click="handleClick">Detail</el-button>
            <el-button link type="primary" size="small">Edit</el-button>
          </template>
        </el-table-column>
      </el-table>
    </ElTabPane>
  </ElTabs>
</template>

<style scoped>
.header_title {
  font-size: 18px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.toolset {
  cursor: pointer;
  margin-top: 3px;
}
</style>
