<script setup lang="ts">
import { useI18n } from '@/hooks/web/useI18n'
import { onMounted, ref } from 'vue'
import { ElButton, ElDivider } from 'element-plus'
import { CopyDocument, Delete, Expand, MoreFilled, Refresh, Search } from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'
import { Error } from '@/components/Error'
import { Org } from '@/api/common/types'
import { getOrganizationsApi } from '@/api/common'
import { ArtifactRepoType, NodeType } from '@/api/configure/types'
import { getK8sRepoApi } from '@/api/configure/deploy'
import { getAppsApi } from '@/api/monitor'
import { K8sRepoWithAppData } from '@/api/monitor/types'

const { t } = useI18n()

const loading = ref(true)
const keywords = ref('')
const Organizations = ref<Array<Org>>(new Array<Org>())

const selectedRepoTab = ref('-1')
const k8sWithApp = ref<K8sRepoWithAppData[]>([])
const repoSelected = async () => {
  for (let i = 0; i < k8sWithApp.value.length; i++) {
    if (k8sWithApp.value[i].id == nodeTabSelected.value) {
      const node = k8sWithApp.value[i]
      if (node.items == null) {
        await getAppsApi(node.id).then((resp) => {
          node.items = resp
        })
      }
      break
    }
  }
}

const getK8sRepoList = async () => {
  await getK8sRepoApi().then(async (resp) => {
    k8sWithApp.value = resp
    if (resp.length > 0 && selectedRepoTab.value === '-1') {
      selectedRepoTab.value = '0'
      nodeTabSelected.value = resp[0].id
      await repoSelected()
    }
  })
}

const getOrganizations = async () => {
  await getOrganizationsApi().then((resp) => {
    if (resp!) {
      Organizations.value = new Array<Org>()
      for (let entry of resp.entries()) {
        Organizations.value.push({
          id: Number(entry[0]),
          name: entry[1]
        })
      }
    }
  })
}

const nodeTabHover = ref(0)
const nodeTabSelected = ref(-1)

const IconKube = 'skill-icons:kubernetes'

function GetIcon(nodeType: NodeType) {
  switch (nodeType) {
    case NodeType.K8s:
      return [IconKube, null]
    default:
      return [IconKube, null]
  }
}

function isFirstTabInit(a: K8sRepoWithAppData): boolean {
  return (
    (a === k8sWithApp.value[0] && selectedRepoTab.value === '0') ||
    a.id === nodeTabHover.value ||
    a.id === nodeTabSelected.value
  )
}

onMounted(() => {
  getOrganizations()
  getK8sRepoList()
})
</script>

<template>
  <Error v-if="k8sWithApp.length == 0" type="k8srepo_empty" @error-click="() => {}" />
  <ElRow justify="space-between" v-if="k8sWithApp.length > 0">
    <ElCol :span="18">
      <ElSpace wrap>
        <span class="header_title">{{ t('router.monitor') }}</span>
        <ElDivider direction="vertical" />
        <ElInput
          v-model="keywords"
          :placeholder="t('monitor.appName')"
          :suffix-icon="Search"
          clearable
        />
      </ElSpace>
    </ElCol>
    <ElCol :span="6" style="text-align: right">
      <ElButton :icon="Refresh" @click="repoSelected" type="success"
        >{{ t('monitor.refresh') }}
      </ElButton>
    </ElCol>
  </ElRow>
  <ElTabs
    v-if="k8sWithApp.length > 0"
    class="nodes-tabs"
    tab-position="left"
    @tab-change="repoSelected"
    v-model="selectedRepoTab"
  >
    <ElTabPane v-for="node in k8sWithApp" :key="node.id" style="padding: 20px">
      <template #label>
        <div
          @mouseover="nodeTabHover = node.id"
          @mouseleave="nodeTabHover = 0"
          @click="nodeTabSelected = node.id"
          :class="isFirstTabInit(node) ? 'node-tab-focus' : ''"
        >
          <ElSpace :size="10" alignment="center" style="width: 200px">
            <Icon
              style="margin-top: 0"
              :icon="GetIcon(node.type)[0]"
              :color="GetIcon(node.type)[1]"
              width="40"
              height="40"
            />
            <div style="height: 80px; margin-top: 4px">
              <div style="margin: -15px 0 0 5px; height: 40px; text-align: left">{{
                node.name
              }}</div>
              <div
                style="
                  margin: -10px 0 0 5px;
                  height: 40px;
                  font-size: 12px;
                  color: #606c80;
                  text-align: left;
                "
              >
                <span>ver: {{ node.serverVersion }} </span></div
              >
            </div>
          </ElSpace>
        </div>
      </template>
      <ElSpace :size="10" direction="vertical" alignment="start" fill fill-ratio="100">
        <span class="header_title">{{ node.name }}</span>
        <div v-if="node.type === NodeType.K8s">
          <ElTable :data="node.items" style="width: 100%">
            <ElTableColumn fixed prop="name" :label="t('artifacts.docker.list')" width="250">
              <template #default="scope">
                <ElLink :underline="false"
                  >{{ scope.row.name }}
                  <ElTooltip placement="right" :content="t('artifacts.docker.copy_latest_image')">
                    <ElIcon style="left: 5px"><CopyDocument /></ElIcon> </ElTooltip
                ></ElLink>
              </template>
            </ElTableColumn>
            <ElTableColumn
              fixed
              prop="latestVersion"
              :label="t('artifacts.docker.latest_version')"
              width="180"
            >
              <template #default="scope">
                <ElTag round type="success">
                  {{ scope.row.latestVersion }}
                </ElTag>
              </template></ElTableColumn
            >
            <ElTableColumn
              fixed
              prop="publishedAt"
              :label="t('artifacts.docker.latest_push_at')"
              width="180"
            />
            <ElTableColumn
              prop="publishCounter"
              :label="t('artifacts.docker.publish_counter')"
              width="160"
            >
              <template #default="scope">
                <ElLink type="info" :underline="false">{{ scope.row.tags.length }}</ElLink>
              </template>
            </ElTableColumn>
            <ElTableColumn fixed="right" prop="id" :label="t('artifacts.docker.action')" width="80">
              <template #default>
                <ElDropdown>
                  <span class="el-dropdown-link">
                    <ElButton :icon="MoreFilled" circle />
                  </span>
                  <template #dropdown>
                    <ElDropdownMenu>
                      <ElDropdownItem>
                        <ElLink :icon="Expand" :underline="false">
                          {{ t('common.viewDetail') }}
                        </ElLink>
                      </ElDropdownItem>
                      <ElDropdownItem>
                        <ElLink :icon="CopyDocument" :underline="false">
                          {{ t('artifacts.docker.copy_latest_image') }}</ElLink
                        >
                      </ElDropdownItem>
                      <ElDropdownItem divided>
                        <ElLink :icon="Delete" :underline="false" type="danger">
                          {{ t('artifacts.docker.delete_latest_image') }}
                        </ElLink>
                      </ElDropdownItem>
                      <ElDropdownItem divided>
                        <ElLink :icon="Delete" :underline="false" type="danger">
                          {{ t('artifacts.docker.delete_all_images') }}
                        </ElLink>
                      </ElDropdownItem>
                    </ElDropdownMenu>
                  </template>
                </ElDropdown>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
      </ElSpace>
    </ElTabPane>
  </ElTabs>
</template>
<style scoped>
.tab-action {
  position: relative;
  top: 32px;
  cursor: pointer;
  font-size: 12px;
  color: rgb(96, 108, 128);
}
.header_title {
  font-size: 18px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.nodes-tabs {
  background-color: #fff;
  margin: 10px 0 10px 0;
  height: 800px;
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

.el-tabs {
  --el-tabs-header-height: 80px;
}
.node-tab-focus {
  background-color: rgb(245, 247, 250);
  margin: 0 -18px 0 -20px;
  padding: 0 18px 0 20px;
  border-bottom-color: #fff;
}
</style>
