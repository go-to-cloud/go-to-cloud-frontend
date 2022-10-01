<template>
  <ElRow justify="space-between">
    <ElCol :span="18">
      <ElSpace wrap>
        <span class="header_title">{{ t('router.artifacts') }}</span>
        <ElDivider direction="vertical" />
        <ElInput
          v-model="keywords"
          :placeholder="t('artifacts.name')"
          :suffix-icon="Search"
          clearable
        />
      </ElSpace>
    </ElCol>
    <ElCol :span="6" style="text-align: right">
      <ElButton :icon="Connection" type="primary" @click="bindDialogVisible = true"
        >{{ t('artifacts.bind') }}
      </ElButton>
    </ElCol>
  </ElRow>
  <ElTabs class="artifact-tabs" tab-position="left">
    <ElTabPane v-for="type in artifactTypes" :key="type.Id" style="padding: 20px">
      <template #label>
        <div
          @mouseover="artifactTabHover = type.Id"
          @mouseleave="artifactTabHover = 0"
          @click="artifactTabSelected = type.Id"
          :class="
            type.Id === artifactTabHover || type.Id === artifactTabSelected
              ? 'artifact-tab-focus'
              : ''
          "
        >
          <ElSpace :size="10" alignment="center" style="width: 200px">
            <Icon style="margin-top: 0" :icon="GetIcon(type)" width="40" height="40" />
            <div style="height: 80px; margin-top: 4px">
              <div style="margin: -15px 0 0 5px; height: 40px; text-align: left">{{
                type.RepoName
              }}</div>
              <div style="margin: -10px 0 0 5px; height: 40px; font-size: 12px; color: #606c80">
                <span>{{ GetTypeName(type) }} {{ t('common.repo') }} </span>
                <ElDivider direction="vertical" />
                <span>{{ visibilityText(type.Visibility) }}</span></div
              >
            </div>
          </ElSpace>
        </div>
      </template>
      <ElSpace :size="10" direction="vertical" alignment="start" fill fill-ratio="100">
        <span class="header_title">{{ type.RepoName }}</span>
        <div v-if="type.Type === ArtifactRepoType.Docker">
          <ElTable :data="type.Items" style="width: 100%">
            <ElTableColumn fixed prop="name" :label="t('artifacts.docker.list')" width="250">
              <template #default="scope">
                <ElLink :underline="false"
                  >{{ scope.row.name }} <ElIcon style="left: 5px"><CopyDocument /></ElIcon
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
                <ElLink type="info" :underline="false">{{ scope.row.publishCounter }}</ElLink>
              </template>
            </ElTableColumn>
            <ElTableColumn fixed="right" prop="id" :label="t('artifacts.docker.action')" width="80">
              <template #default>
                <el-dropdown>
                  <span class="el-dropdown-link">
                    <ElButton :icon="MoreFilled" circle />
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
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
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
      </ElSpace>
    </ElTabPane>
  </ElTabs>
  <Dialog v-model="bindDialogVisible" :title="t('artifacts.bind')" :fullscreen="false">
    <ElForm label-position="top">
      <ElRow>
        <ElCol :span="10">
          <ElFormItem required :label="t('artifacts.name')">
            <ElInput
              v-model="name"
              :label="t('artifacts.name')"
              :placeholder="t('common.inputText') + t('artifacts.name')"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElFormItem :label="t('artifacts.origin')">
          <ElSpace :size="10" wrap>
            <div
              v-for="type in supportedArtifactTypes"
              :key="type.Id"
              @mouseover="artifactTypeHover = type.Id"
              @mouseleave="artifactTypeHover = 0"
              @click="type.Enabled ? (artifactSelected = type.Id) : true"
              class="radio-sel"
              :class="
                type.Id === artifactTypeHover || type.Id === artifactSelected
                  ? type.Enabled
                    ? 'radio-sel-hover'
                    : 'radio-sel-hover-disabled'
                  : ''
              "
            >
              <Icon :icon="GetIcon(type)" width="44" height="44" />
              {{ GetTypeName(type) }}
              <div
                :class="type.Id === artifactSelected && type.Enabled ? 'radio-sel-selected' : ''"
              ></div>
            </div>
          </ElSpace>
        </ElFormItem>
      </ElRow>
      <ElRow>
        <ElFormItem :label="t('artifacts.type')">
          <ElSwitch
            v-model="isOriginPublic"
            :inactive-text="t('coderepo.private')"
            :active-text="t('coderepo.public')"
          />
        </ElFormItem>
      </ElRow>
      <ElRow>
        <ElCol :span="18">
          <ElFormItem required :label="t('coderepo.address')">
            <ElInput
              v-model="address"
              :placeholder="t('common.inputText') + t('coderepo.address')"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow v-if="isOriginPublic === false && origin === 'Gitlab'">
        <ElCol :span="10">
          <ElFormItem :label="t('coderepo.user')">
            <ElInput :placeholder="t('common.inputText') + t('coderepo.address')" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow v-if="isOriginPublic === false">
        <ElCol :span="10">
          <ElFormItem :label="t('coderepo.token')">
            <ElInput :placeholder="t('common.inputText') + t('coderepo.token')" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="18">
          <ElFormItem :label="t('coderepo.remark')">
            <ElInput v-model="remark" show-word-limit maxlength="200" type="textarea" />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <span>
        <el-button
          :disabled="address === ''"
          type="success"
          style="position: absolute; left: 10px"
          >{{ t('common.testing') }}</el-button
        >
        <el-button @click="bindDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="bindDialogVisible = false">Confirm</el-button>
      </span>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { useI18n } from '@/hooks/web/useI18n'
import { ref } from 'vue'
import { ElButton, ElDivider } from 'element-plus'
import { Dialog } from '@/components/Dialog'
import {
  Connection,
  CopyDocument,
  Delete,
  Expand,
  MoreFilled,
  Search
} from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'

const bindDialogVisible = ref(false)

const { t } = useI18n()

const loading = ref(true)

const keywords = ref('')
const origin = ref('Gitlab')
const isOriginPublic = ref(false)
const remark = ref('')
const address = ref('')
const name = ref('')

const artifactTypeHover = ref(0)
const artifactSelected = ref(1)
const artifactTabHover = ref(0)
const artifactTabSelected = ref(1)

enum ArtifactVisibility {
  Private = 0,
  Internal = 1,
  Public = 2
}

enum ArtifactRepoType {
  OSS = 0,
  Docker = 1,
  Nuget = 2,
  Maven = 3,
  Npm = 4,
  S3 = 5
}

const IconOSS = 'ant-design:aliyun-outlined'
const IconDocker = 'logos:docker-icon'
const IconNuget = 'vscode-icons:file-type-nuget'
const IconMaven = 'vscode-icons:file-type-maven'
const IconNpm = 'logos:npm-icon'
const IconS3 = 'logos:aws-s3'

const visibilityText = (v: ArtifactVisibility) => {
  switch (v) {
    case ArtifactVisibility.Internal:
      return t('artifacts.visibility.internal')
    case ArtifactVisibility.Private:
      return t('artifacts.visibility.private')
    default:
      return t('artifacts.visibility.public')
  }
}

interface ArtifactType {
  Id: number
  Enabled: boolean
  RepoName: string
  Visibility: ArtifactVisibility
  Type: ArtifactRepoType
  Items: Array<any> | null
}

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
      return IconDocker
    case ArtifactRepoType.OSS:
      return IconOSS
    case ArtifactRepoType.Nuget:
      return IconNuget
    case ArtifactRepoType.Maven:
      return IconMaven
    case ArtifactRepoType.Npm:
      return IconNpm
    case ArtifactRepoType.S3:
      return IconS3
    default:
      return IconOSS
  }
}

const supportedArtifactTypes: Array<ArtifactType> = [
  {
    Id: 1,
    Enabled: true,
    RepoName: '',
    Visibility: ArtifactVisibility.Private,
    Type: ArtifactRepoType.Docker,
    Items: null
  },
  {
    Id: 2,
    Enabled: false,
    RepoName: '',
    Visibility: ArtifactVisibility.Private,
    Type: ArtifactRepoType.Nuget,
    Items: null
  },
  {
    Id: 3,
    Enabled: false,
    RepoName: '',
    Visibility: ArtifactVisibility.Public,
    Type: ArtifactRepoType.Maven,
    Items: null
  },
  {
    Id: 4,
    Enabled: false,
    RepoName: '',
    Visibility: ArtifactVisibility.Internal,
    Type: ArtifactRepoType.Npm,
    Items: null
  },
  {
    Id: 5,
    Enabled: false,
    RepoName: '',
    Visibility: ArtifactVisibility.Internal,
    Type: ArtifactRepoType.OSS,
    Items: null
  },
  {
    Id: 6,
    Enabled: false,
    RepoName: '',
    Visibility: ArtifactVisibility.Internal,
    Type: ArtifactRepoType.S3,
    Items: null
  }
]

const artifactTypes: Array<ArtifactType> = [
  {
    Id: 1,
    Enabled: true,
    RepoName: '用户自定名称',
    Visibility: ArtifactVisibility.Private,
    Type: ArtifactRepoType.Docker,
    Items: [
      {
        name: 'Hello',
        latestVersion: 'latest',
        publishedAt: '2022-01-01',
        publishCounter: 3
      }
    ]
  },
  {
    Id: 2,
    Enabled: true,
    RepoName: 'dotnet',
    Visibility: ArtifactVisibility.Private,
    Type: ArtifactRepoType.Nuget,
    Items: null
  }
]
</script>
<style scoped>
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
