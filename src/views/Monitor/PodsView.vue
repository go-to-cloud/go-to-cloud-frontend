<script setup lang="ts">
import { ElButton, ElCard, FormInstance, FormRules } from 'element-plus'
import { Refresh, Delete, MoreFilled, Search } from '@element-plus/icons-vue'
import { ContentDetailWrap } from '@/components/ContentDetailWrap'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/hooks/web/useI18n'
import { onMounted, onUnmounted, reactive, ref } from 'vue'

const route = useRoute()
const reloadingPods = ref(false)

import { useAxios } from '@/hooks/web/useAxios'

import { PodDetail } from '@/api/monitor/types'
import { getPodsDetailApi } from '@/api/monitor'

const { t } = useI18n()
const { path, params } = useRoute()
const { push } = useRouter()
const request = useAxios()

const pods = ref<PodDetail[]>()
const getPodsDetail = async (force: boolean) => {
  let k8sRepoId = Number(params.id)
  let deploymentId = Number(route.query.from)
  await getPodsDetailApi(k8sRepoId, deploymentId, force).then((dat) => {})
}

const podsRefresher = ref<autoRefreshPods>()
class autoRefreshPods {
  intervalId: NodeJS.Timer | null = null

  startTimer() {
    this.intervalId = setInterval(() => {
      getPodsDetail(false)
    }, 5000)
  }

  stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}

onMounted(() => {
  getPodsDetail(true)
  podsRefresher.value = new autoRefreshPods()
  podsRefresher.value.startTimer()
})
onUnmounted(() => {
  podsRefresher.value!.stopTimer()
})
</script>
<template>
  <ContentDetailWrap
    :title="t('monitor.pods_detail')"
    @back="push('/monitor/apps?from=' + route.query.from)"
  >
    <ElRow justify="space-between">
      <ElCol :span="18">
        <ElSpace wrap>
          <span class="header_title">Pod</span>
          <ElDivider direction="vertical" />
          <ElInput
            v-model="filterKeywords"
            :placeholder="t('monitor.podName')"
            :suffix-icon="Search"
            clearable
          />
        </ElSpace>
      </ElCol>
      <ElCol :span="6" style="text-align: right">
        <ElButton
          :disabled="reloadingPods"
          :icon="Refresh"
          @click="repoSelected(true)"
          type="success"
          >{{ t('monitor.refreshPod') }}
        </ElButton>
      </ElCol>
    </ElRow>
    <ElDivider />
    <ElSpace wrap :size="30">
      <ElTable :data="pods" style="width: 100%">
        <ElTableColumn fixed prop="name" :label="t('monitor.podName')" width="250" />
        <ElTableColumn fixed prop="buildEnv" :label="t('monitor.container')" width="180" />
        <ElTableColumn fixed prop="branch" :label="t('monitor.restarts')" width="180" />
        <ElTableColumn :label="t('monitor.pod_age')" width="300">
          <template #default="scope">
            <span v-if="scope.row.lastBuildResult != 0"
              >{{ scope.row.lastBuildAt }} <ElDivider direction="vertical"
            /></span>
            <ElTag
              :type="buildResultType(scope.row.lastBuildResult)"
              :effect="buildResultEffect(scope.row.lastBuildResult)"
              >{{ buildResultText(scope.row.lastBuildResult) }}</ElTag
            >
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('monitor.pod_status')" width="160">
          <template #default="scope">
            <ElSpace>
              <ElTooltip
                v-if="scope.row.qa_enabled && scope.row.unit_test"
                :content="t('project.ci.unit_test')"
              >
                <Icon class="toolset" icon="file-icons:test-generic" />
              </ElTooltip>
              <ElTooltip
                v-if="scope.row.qa_enabled && scope.row.lint_check"
                :content="t('project.ci.lint_check')"
              >
                <Icon class="toolset" icon="file-icons:commitlint" />
              </ElTooltip>
              <ElTooltip v-if="scope.row.artifact_enabled" :content="t('project.toolset.artifact')">
                <Icon class="toolset" icon="cib:azure-artifacts" />
              </ElTooltip>
            </ElSpace>
          </template>
        </ElTableColumn>
        <ElTableColumn fixed="right" prop="id" :label="t('common.action')" width="80">
          <template #default="scope">
            <ElDropdown @command="actionHandler">
              <span class="el-dropdown-link">
                <ElButton :icon="MoreFilled" circle />
              </span>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem
                    v-if="!scope.row.buildingNow"
                    :command="{ id: scope.row.id, cmd: 'building' }"
                  >
                    <ElLink :underline="false">
                      <Icon icon="material-symbols:play-circle" />
                      {{ t('project.ci.build_now') }}
                    </ElLink>
                  </ElDropdownItem>
                  <ElDropdownItem v-if="scope.row.buildingNow">
                    <ElLink :underline="false">
                      <Icon size="20" icon="typcn:cancel" />
                      {{ t('project.ci.cancel_building') }}
                    </ElLink>
                  </ElDropdownItem>
                  <ElDropdownItem>
                    <ElLink :underline="false">
                      <Icon icon="icon-park-solid:history-query" />
                      {{ t('project.ci.build_history') }}</ElLink
                    >
                  </ElDropdownItem>
                  <ElDropdownItem divided :command="{ id: scope.row.id, cmd: 'del' }">
                    <ElLink :icon="Delete" :underline="false" type="danger">
                      {{ t('project.ci.delete_plan') }}
                    </ElLink>
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElSpace>
  </ContentDetailWrap>
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
