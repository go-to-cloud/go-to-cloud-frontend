<script setup lang="ts">
import { useI18n } from '@/hooks/web/useI18n'
import { onMounted, ref } from 'vue'
import { ElButton, ElDivider, ElMessage, FormInstance, FormRules } from 'element-plus'
import {
  ArrowDown,
  CopyDocument,
  Delete,
  Expand,
  MoreFilled,
  Refresh,
  Search
} from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'
import { Error } from '@/components/Error'
import { Org } from '@/api/common/types'
import { isEmpty } from '@/utils/is'
import { getOrganizationsApi } from '@/api/common'
import {
  bindRepoApi,
  getArtifactRepoApi,
  removeRepoApi,
  testingRepoApi,
  updateRepoApi
} from '@/api/configure/artifact'
import { ElMessageBox } from 'element-plus/es'
import { ArtifactRepoType, ArtifactType, DeploymentNode, NodeType } from '@/api/configure/types'
import { getK8sRepoApi } from '@/api/configure/deploy'

const bindDialogVisible = ref(false)

const { t } = useI18n()

const loading = ref(true)
const keywords = ref('')
const Organizations = ref<Array<Org>>(new Array<Org>())
const dlgForCreate = ref(true)

const selectedRepoTab = ref('-1')
const repoSelected = async (name: string) => {
  for (let i = 0; i < deploymentNodes.value.length; i++) {
    if (deploymentNodes.value[i].id + '' == name) {
      const node = deploymentNodes.value[i]
      if (node.items === null) {
        await getK8sRepoApi(node.id).then((resp) => {
          node.items = resp
        })
      }
    }
  }
}

const removeRepo = async (repoId: number) => {
  await removeRepoApi(repoId).then((resp) => {
    if (resp.success) {
      getArtifactRepoList()
    }
  })
}
const testing = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    await testingRepoApi(artifactRepoForm.value)
      .then((resp) => {
        resp.success
          ? ElMessage({
              type: 'success',
              message: t('artifacts.testingPassed'),
              showClose: true,
              center: true
            })
          : ElMessage({
              type: 'error',
              message: t('artifacts.testingFailed'),
              showClose: true,
              center: true,
              grouping: true
            })
      })
      .catch(() => {
        ElMessage({
          type: 'error',
          message: t('artifacts.testingFailed'),
          showClose: true,
          center: true
        })
      })
  })
}
const submit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      await bindRepoApi(artifactRepoForm.value)
        .then((resp) => {
          if (resp.success) {
            bindDialogVisible.value = false
            resetForm()
            getArtifactRepoList()
          }
          resp.success
            ? ElMessage({
                type: 'success',
                message: t('coderepo.bindSuccess'),
                showClose: true,
                center: true
              })
            : ElMessage({
                type: 'error',
                message: t('coderepo.bindFailure'),
                showClose: true,
                center: true,
                grouping: true
              })
        })
        .catch(() => {
          ElMessage({
            type: 'error',
            message: t('coderepo.bindFailure'),
            showClose: true,
            center: true
          })
        })
    }
  })
}
const save = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      await updateRepoApi(artifactRepoForm.value)
        .then((resp) => {
          if (resp.success) {
            bindDialogVisible.value = false
            resetForm()
            getArtifactRepoList()
          }
          resp.success
            ? ElMessage({
                type: 'success',
                message: t('artifacts.updateSuccess'),
                showClose: true,
                center: true
              })
            : ElMessage({
                type: 'error',
                message: t('artifacts.updateFailure'),
                showClose: true,
                center: true,
                grouping: true
              })
        })
        .catch(() => {
          ElMessage({
            type: 'error',
            message: t('artifacts.updateFailure'),
            showClose: true,
            center: true
          })
        })
    }
  })
}

const close = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  bindDialogVisible.value = false
  resetForm()
  getOrganizations()
}

const deploymentNodes = ref<DeploymentNode[]>([])

const getArtifactRepoList = async (params?: any) => {
  await getArtifactRepoApi(params).then(async (resp) => {
    deploymentNodes.value = new Array<DeploymentNode>()

    for (let i = 0; i < resp.length; i++) {
      deploymentNodes.value.push({
        id: resp[i].id,
        enabled: true,
        nodeName: resp[i].name,
        isSecurity: resp[i].isSecurity,
        nodeType: resp[i].type,
        items: null
      })
    }
    if (resp.length > 0 && selectedRepoTab.value === '-1') {
      selectedRepoTab.value = '0'
      await repoSelected(deploymentNodes.value.at(0)!.Id + '')
    }
  })
}

const getOrganizations = async () => {
  await getOrganizationsApi().then((resp) => {
    if (resp!) {
      artifactRepoForm.value.orgs = new Array<number>()
      Organizations.value = new Array<Org>()
      for (let entry of resp.entries()) {
        Organizations.value.push({
          id: Number(entry[0]),
          name: entry[1]
        })
        artifactRepoForm.value.orgs.push(Number(entry[0]))
      }
    }
  })
}

const nodeHover = ref(0)
const nodeTabHover = ref(0)
const nodeTabSelected = ref(-1)

const artifactRepoFormRule = ref<FormRules>({
  name: [
    {
      required: true,
      message: '',
      trigger: 'blur',
      validator: (rule, value) => !isEmpty(value)
    }
  ],
  url: [
    {
      required: true,
      message: '',
      trigger: 'blur',
      validator: (rule, value) => !isEmpty(value)
    }
  ],
  user: [
    {
      required: true,
      message: '',
      trigger: 'blur',
      validator: (rule, value) => !isEmpty(value)
    }
  ],
  password: [
    {
      required: true,
      message: '',
      trigger: 'blur',
      validator: (rule, value) => !isEmpty(value)
    }
  ],
  orgs: [
    {
      required: true,
      message: t('at_least_one_org'),
      trigger: 'blur',
      validator: (rule, value) => {
        return (value as Array<Org>).length > 0
      }
    }
  ]
})
const artifactRepoFormRef = ref<FormInstance>()
const artifactRepoForm = ref({
  id: 0,
  name: '',
  type: ArtifactRepoType.Docker,
  isSecurity: true,
  url: '',
  user: '',
  password: '',
  remark: '',
  orgs: ref(Array<number>())
})

const IconKube = 'skill-icons:kubernetes'

function GetTypeName(node: DeploymentNode) {
  switch (node.nodeType) {
    case NodeType.K8s:
      return 'K8S'
    default:
      return 'K8S'
  }
}

function GetIcon(nodeType: NodeType) {
  switch (nodeType) {
    case NodeType.K8s:
      return [IconKube, null]
    default:
      return [IconKube, null]
  }
}

const supportedArtifactTypes: Array<ArtifactType> = [
  {
    Id: 1,
    Enabled: true,
    RepoName: '',
    IsSecurity: true,
    Type: ArtifactRepoType.Docker,
    Items: null,
    Data: null
  },
  {
    Id: 2,
    Enabled: false,
    RepoName: '',
    IsSecurity: true,
    Type: ArtifactRepoType.Nuget,
    Items: null,
    Data: null
  },
  {
    Id: 3,
    Enabled: false,
    RepoName: '',
    IsSecurity: true,
    Type: ArtifactRepoType.Maven,
    Items: null,
    Data: null
  },
  {
    Id: 4,
    Enabled: false,
    RepoName: '',
    IsSecurity: true,
    Type: ArtifactRepoType.Npm,
    Items: null,
    Data: null
  },
  {
    Id: 5,
    Enabled: false,
    RepoName: '',
    IsSecurity: true,
    Type: ArtifactRepoType.OSS,
    Items: null,
    Data: null
  },
  {
    Id: 6,
    Enabled: false,
    RepoName: '',
    IsSecurity: true,
    Type: ArtifactRepoType.S3,
    Items: null,
    Data: null
  }
]

interface HandlerCommand {
  id: number
  cmd: string
  form: ArtifactType
}

const actionHandler = (command: HandlerCommand) => {
  switch (command.cmd) {
    case 'view':
      dlgForCreate.value = false
      bindDialogVisible.value = true
      let orgIds: Array<number> = []
      for (let i = 0; i < command.form.Data!.orgLites.length; i++) {
        orgIds.push(command.form.Data!.orgLites[i].orgId)
      }
      artifactRepoForm.value = {
        id: command.form.Data!.id,
        name: command.form.Data!.name,
        type: command.form.Data!.type,
        isSecurity: command.form.Data!.isSecurity,
        url: command.form.Data!.url,
        user: command.form.Data!.user,
        password: command.form.Data!.password,
        remark: command.form.Data!.remark,
        orgs: orgIds
      }
      break
    case 'refresh':
      let i = 0
      for (; i < deploymentNodes.value.length; i++) {
        if (deploymentNodes.value[i].Id === command.id) {
          deploymentNodes.value[i].Items = null
          break
        }
      }
      console.log(i)

      repoSelected(i + '')
      break
    case 'remove':
      ElMessageBox.confirm(t('artifacts.removeConfirm'), t('common.confirmMsgTitle'), {
        confirmButtonText: t('common.ok'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }).then(() => {
        removeRepo(command.id)
      })
      break
  }
}
function isFirstTabInit(a: DeploymentNode): boolean {
  return (
    (a === deploymentNodes.value[0] && selectedRepoTab.value === '0') ||
    a.id === nodeTabHover.value ||
    a.id === nodeTabSelected.value
  )
}

onMounted(() => {
  getOrganizations()
  getArtifactRepoList()
})
</script>

<template>
  <Error
    v-if="deploymentNodes.length == 0"
    type="artifactrepo_empty"
    @error-click="
      () => {
        dlgForCreate = true
        bindDialogVisible = true
      }
    "
  />
  <ElRow justify="space-between" v-if="deploymentNodes.length > 0">
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
      <ElButton :icon="Refresh" type="success">{{ t('monitor.refresh') }} </ElButton>
    </ElCol>
  </ElRow>
  <ElTabs
    v-if="deploymentNodes.length > 0"
    class="nodes-tabs"
    tab-position="left"
    @tab-change="repoSelected"
    v-model="selectedRepoTab"
  >
    <ElTabPane v-for="node in deploymentNodes" :key="node.id" style="padding: 20px">
      <template #label>
        <div
          @mouseover="nodeTabHover = node.id"
          @mouseleave="nodeTabHover = 0"
          @click="nodeTabSelected = node.id"
          :class="isFirstTabInit(node) ? 'artifact-tab-focus' : ''"
        >
          <ElSpace :size="10" alignment="center" style="width: 200px">
            <Icon
              style="margin-top: 0"
              :icon="GetIcon(node.nodeType)[0]"
              :color="GetIcon(node.nodeType)[1]"
              width="40"
              height="40"
            />
            <div style="height: 80px; margin-top: 4px">
              <div style="margin: -15px 0 0 5px; height: 40px; text-align: left">{{
                node.nodeName
              }}</div>
              <div style="margin: -10px 0 0 5px; height: 40px; font-size: 12px; color: #606c80">
                <span>{{ GetTypeName(node) }} {{ t('common.repo') }} </span>
                <ElDivider direction="vertical" />
                <ElDropdown class="tab-action" @command="actionHandler">
                  <span>
                    {{ t('common.action')
                    }}<ElIcon class="el-icon--right"> <ArrowDown /> </ElIcon></span
                  ><template #dropdown>
                    <ElDropdownMenu>
                      <ElDropdownItem :command="{ id: node.Id, cmd: 'view', form: node }"
                        ><ElLink :icon="Expand" :underline="false">
                          {{ t('common.edit') }}
                        </ElLink></ElDropdownItem
                      >
                      <ElDropdownItem :command="{ id: node.Id, cmd: 'refresh', form: node }"
                        ><ElLink :icon="Refresh" :underline="false">
                          {{ t('common.reload') }}
                        </ElLink></ElDropdownItem
                      >
                      <ElDropdownItem divided :command="{ id: node.Id, cmd: 'remove', form: node }">
                        <ElLink :icon="Delete" :underline="false" type="danger">
                          {{ t('artifacts.docker.remove') }}
                        </ElLink>
                      </ElDropdownItem>
                    </ElDropdownMenu>
                  </template></ElDropdown
                ></div
              >
            </div>
          </ElSpace>
        </div>
      </template>
      <ElSpace :size="10" direction="vertical" alignment="start" fill fill-ratio="100">
        <span class="header_title">{{ node.RepoName }}</span>
        <div v-if="node.Type === ArtifactRepoType.Docker">
          <ElTable :data="node.Items" style="width: 100%">
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
