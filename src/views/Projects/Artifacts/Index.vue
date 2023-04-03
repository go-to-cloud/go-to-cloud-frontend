<script setup lang="ts">
import { useI18n } from '@/hooks/web/useI18n'
import { computed, onMounted, ref, watchEffect } from 'vue'
import { ElNotification, ElButton, ElDivider, ElMessage } from 'element-plus'
import useClipboard from 'vue-clipboard3'
import { ContentDetailWrap } from '@/components/ContentDetailWrap'

import {
  ArrowDown,
  CopyDocument,
  Expand,
  MoreFilled,
  Refresh,
  Search
} from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'
import {
  ArtifactHistory,
  ArtifactRepoData,
  ArtifactRepoItem,
  ArtifactRepoType,
  ArtifactType
} from '@/api/configure/types'
import { useRoute, useRouter } from 'vue-router'
import { useAxios } from '@/hooks/web/useAxios'
import { useVisibilityStore } from '@/store/modules/visibility'
import { AuthCodes } from '@/api/constants/auths'

const { path, params } = useRoute()
const artifactHistoryVisible = ref(false)
const currentArtifactHistory = ref<Array<ArtifactHistory>>()

const { t } = useI18n()
const { toClipboard } = useClipboard()
const { push } = useRouter()
const request = useAxios()

const loading = ref(true)

const getRepoItemApi = async (artifactId: number): Promise<ArtifactRepoItem[]> => {
  let projectId = Number(params.id)
  const res = await request.get<IResponse<ArtifactRepoItem[]>>({
    url: '/projects/' + projectId + '/artifact/' + artifactId
  })
  return res && res.data && res.data.data
}

const artifactTypes = ref<Array<ArtifactType>>([])

const getArtifactRepoApi = async (): Promise<ArtifactRepoData[]> => {
  let projectId = Number(params.id)
  const res = await request.get<IResponse<ArtifactRepoData[]>>({
    url: '/projects/' + projectId + '/artifact'
  })
  return res && res.data && res.data.data
}

const currentArtifacts = ref<ArtifactRepoItem[]>([])

const repoSelected = async (name: string) => {
  let artifactId = Number(name)
  let artifact = artifactTypes.value.filter((r) => r.Id === artifactId).at(0)

  await getRepoItemApi(artifactId).then((resp) => {
    artifact!.Items = resp
    currentArtifacts.value = resp
  })
}

const getArtifactRepoList = async () => {
  await getArtifactRepoApi().then(async (resp) => {
    artifactTypes.value = new Array<ArtifactType>()
    for (let i = 0; i < resp.length; i++) {
      if (i == 0) {
        artifactTabSelected.value = resp[i].id
      }
      artifactTypes.value.push({
        Id: resp[i].id,
        Enabled: true,
        RepoName: resp[i].name,
        IsSecurity: resp[i].isSecurity,
        Type: resp[i].type,
        Items: null,
        Data: resp[i]
      })
    }
    if (resp.length > 0) {
      await repoSelected(artifactTypes.value.at(0)!.Id + '')
    }
  })
}

const artifactTabHover = ref(0)
const artifactTabSelected = ref(-1)

const IconOSS = 'ant-design:aliyun-outlined'
const IconDocker = 'logos:docker-icon'
const IconNuget = 'vscode-icons:file-type-nuget'
const IconMaven = 'vscode-icons:file-type-maven'
const IconNpm = 'logos:npm-icon'
const IconS3 = 'logos:aws-s3'

function GetTypeName(artifact: ArtifactType) {
  switch (artifact.Type) {
    case ArtifactRepoType.Docker:
      return 'Docker'
    case ArtifactRepoType.OSS:
      return 'Ali-OSS'
    case ArtifactRepoType.Nuget:
      return 'Nuget'
    case ArtifactRepoType.Maven:
      return 'Maven'
    case ArtifactRepoType.Npm:
      return 'Npm'
    case ArtifactRepoType.S3:
      return 'S3'
    default:
      return IconOSS
  }
}

function GetIcon(artifact: ArtifactType) {
  switch (artifact.Type) {
    case ArtifactRepoType.Docker:
      return [IconDocker, null]
    case ArtifactRepoType.OSS:
      return [IconOSS, '#E47037']
    case ArtifactRepoType.Nuget:
      return [IconNuget, null]
    case ArtifactRepoType.Maven:
      return [IconMaven, null]
    case ArtifactRepoType.Npm:
      return [IconNpm, null]
    case ArtifactRepoType.S3:
      return [IconS3, null]
    default:
      return [IconOSS, '#E47037']
  }
}

interface HandlerCommand {
  id: number
  cmd: string
  form: ArtifactType
  item: ArtifactRepoItem
}

const actionHandler = (command: HandlerCommand) => {
  switch (command.cmd) {
    case 'refresh':
      repoSelected(command.id + '')
      break
    ////// for artifact below /////
    case 'view_artifact_history':
      artifactHistoryVisible.value = true
      currentArtifactHistory.value = command.item.tags
      break

    case 'copy_latest_image':
      copyToClipboard(command.item.fullName)
      break
  }
}
function isFirstTabInit(a: ArtifactType): boolean {
  return a.Id === artifactTabHover.value || a.Id === artifactTabSelected.value
}

const copyToClipboard = (content: string) => {
  toClipboard(content).then((v: any) => {
    ElNotification({
      title: t('common.success'),
      message: t('common.copied'),
      type: 'success'
    })
  })
}

onMounted(() => {
  getArtifactRepoList()
})

const filterKeywords = ref('')
const filterData = computed(() => {
  if (currentArtifacts.value) {
    return currentArtifacts.value.filter(
      (data) =>
        !filterKeywords.value ||
        data.fullName.toLowerCase().includes(filterKeywords.value.toLowerCase())
    )
  } else {
    return []
  }
})
</script>

<template>
  <ContentDetailWrap :title="t('project.toolset.artifact')" @back="push('/projects/index')">
    <ElRow justify="space-between">
      <ElCol :span="18">
        <ElSpace wrap>
          <span class="header_title">{{ t('router.artifacts') }}</span>
          <ElDivider direction="vertical" />
          <ElInput
            v-model="filterKeywords"
            :placeholder="t('artifacts.docker.list')"
            :suffix-icon="Search"
            clearable
          />
        </ElSpace>
      </ElCol>
    </ElRow>
    <ElTabs
      class="artifact-tabs"
      tab-position="left"
      @tab-change="repoSelected(artifactTabSelected + '')"
    >
      <ElTabPane v-for="type in artifactTypes" :key="type.Id" style="padding: 20px">
        <template #label>
          <div
            @mouseover="artifactTabHover = type.Id"
            @mouseleave="artifactTabHover = 0"
            @click="artifactTabSelected = type.Id"
            :class="isFirstTabInit(type) ? 'artifact-tab-focus' : ''"
          >
            <ElSpace :size="10" alignment="center" style="width: 200px">
              <Icon
                style="margin-top: 0"
                :icon="GetIcon(type)[0]"
                :color="GetIcon(type)[1]"
                width="40"
                height="40"
              />
              <div style="height: 80px; margin-top: 4px">
                <div style="margin: -15px 0 0 5px; height: 40px; text-align: left">{{
                  type.RepoName
                }}</div>
                <div style="margin: -10px 0 0 5px; height: 40px; font-size: 12px; color: #606c80">
                  <span>{{ GetTypeName(type) }} {{ t('common.repo') }} </span>
                  <ElDivider direction="vertical" />
                  <ElDropdown class="tab-action" @command="actionHandler">
                    <span>
                      {{ t('common.action')
                      }}<ElIcon class="el-icon--right"> <ArrowDown /> </ElIcon></span
                    ><template #dropdown>
                      <ElDropdownMenu>
                        <ElDropdownItem :command="{ id: type.Id, cmd: 'refresh', form: type }"
                          ><ElLink :icon="Refresh" :underline="false">
                            {{ t('common.reload') }}
                          </ElLink></ElDropdownItem
                        >
                      </ElDropdownMenu>
                    </template></ElDropdown
                  ></div
                >
              </div>
            </ElSpace>
          </div>
        </template>
        <ElSpace :size="10" direction="vertical" alignment="start" fill fill-ratio="100">
          <span class="header_title">{{ type.RepoName }}</span>
          <div v-if="type.Type === ArtifactRepoType.Docker">
            <ElTable :data="filterData" style="width: 100%">
              <ElTableColumn fixed prop="name" :label="t('artifacts.docker.list')" width="250">
                <template #default="scope">
                  <ElLink :underline="false"
                    >{{ scope.row.name }}
                    <ElTooltip placement="right" :content="t('artifacts.docker.copy_latest_image')">
                      <ElIcon @click="copyToClipboard(scope.row.fullName)" style="left: 5px"
                        ><CopyDocument
                      /></ElIcon> </ElTooltip
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
                  <ElLink type="info" :underline="false">{{ scope.row.tags?.length }}</ElLink>
                </template>
              </ElTableColumn>
              <ElTableColumn
                fixed="right"
                prop="id"
                :label="t('artifacts.docker.action')"
                width="80"
              >
                <template #default="scope">
                  <ElDropdown @command="actionHandler">
                    <span class="el-dropdown-link">
                      <ElButton :icon="MoreFilled" circle />
                    </span>
                    <template #dropdown>
                      <ElDropdownMenu>
                        <ElDropdownItem
                          :command="{
                            id: scope.row.id,
                            cmd: 'view_artifact_history',
                            item: scope.row
                          }"
                        >
                          <ElLink :icon="Expand" :underline="false">
                            {{ t('artifacts.docker.view_artifact_history') }}
                          </ElLink>
                        </ElDropdownItem>
                        <ElDropdownItem
                          :command="{
                            id: scope.row.id,
                            cmd: 'copy_latest_image',
                            item: scope.row
                          }"
                        >
                          <ElLink :icon="CopyDocument" :underline="false">
                            {{ t('artifacts.docker.copy_latest_image') }}</ElLink
                          >
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
  </ContentDetailWrap>
  <ElDialog v-model="artifactHistoryVisible" :title="t('artifacts.docker.title_artifact_history')">
    <ElTable :data="currentArtifactHistory">
      <ElTableColumn :label="t('artifacts.docker.tag_version')">
        <template #default="scope">
          <ElBadge :hidden="!scope.row.isLatest" value="new" style="margin-top: 8px">
            <ElTag v-if="scope.row.isLatest" type="success">
              {{ scope.row.tags }}
            </ElTag>
          </ElBadge>
          <ElTag v-if="!scope.row.isLatest" type="info"> {{ scope.row.tags }}</ElTag>
        </template></ElTableColumn
      >
      <ElTableColumn :label="t('artifacts.docker.push_at')">
        <template #default="scope">
          {{ scope.row.publishedAt }}
        </template>
      </ElTableColumn>
      <ElTableColumn>
        <template #default="scope">
          <ElTooltip :content="t('artifacts.docker.copy_image')">
            <ElButton
              type="primary"
              :icon="CopyDocument"
              circle
              @click="copyToClipboard(scope.row.fullName)"
          /></ElTooltip>
        </template>
      </ElTableColumn>
    </ElTable>
  </ElDialog>
</template>
<style scoped>
.artifact-history-dlg-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
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

.artifact-tabs {
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
.artifact-tab-focus {
  background-color: rgb(245, 247, 250);
  margin: 0 -18px 0 -20px;
  padding: 0 18px 0 20px;
  border-bottom-color: #fff;
}
</style>
