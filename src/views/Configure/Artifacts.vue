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
    <ElTabPane v-for="type in artifactTypes" :key="type.Id">
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
                <span>{{ type.Name }} {{ t('common.repo') }} </span>
                <ElDivider direction="vertical" />
                <span>{{ visibilityText(type.Visibility) }}</span></div
              >
            </div>
          </ElSpace>
        </div>
      </template>
      <div v-if="type.Type === ArtifactRepoType.Docker">
        <ElPageHeader style="padding: 20px">
          <template #content>
            <span>Title</span>
          </template>
        </ElPageHeader>
      </div>
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
              v-for="type in artifactTypes"
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
              {{ type.Name }}
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
import { Connection, Search } from '@element-plus/icons-vue'
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
  Npm = 4
}

const IconOSS = 'logos:aws-s3'
const IconDocker = 'logos:docker-icon'
const IconNuget = 'vscode-icons:file-type-nuget'
const IconMaven = 'vscode-icons:file-type-maven'
const IconNpm = 'logos:npm-icon'

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
  Name: string
  Enabled: boolean
  RepoName: string
  Visibility: ArtifactVisibility
  Type: ArtifactRepoType
  Items: Array<any> | null
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
    default:
      return IconOSS
  }
}

const artifactTypes: Array<ArtifactType> = [
  {
    Id: 1,
    Name: 'Docker',
    Enabled: true,
    RepoName: '用户自定名称',
    Visibility: ArtifactVisibility.Private,
    Type: ArtifactRepoType.Docker,
    Items: ['a']
  },
  {
    Id: 2,
    Name: 'Nuget',
    Enabled: true,
    RepoName: 'User Name',
    Visibility: ArtifactVisibility.Private,
    Type: ArtifactRepoType.Nuget,
    Items: ['b', 'c']
  },
  {
    Id: 3,
    Name: 'Maven',
    Enabled: false,
    RepoName: '随机',
    Visibility: ArtifactVisibility.Public,
    Type: ArtifactRepoType.Maven,
    Items: [1, 2, 3]
  },
  {
    Id: 4,
    Name: 'npm',
    Enabled: false,
    RepoName: '好名称',
    Visibility: ArtifactVisibility.Internal,
    Type: ArtifactRepoType.Npm,
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
  margin: 10px;
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
