<script setup lang="ts">
import { useI18n } from '@/hooks/web/useI18n'
import { ref } from 'vue'
import { ElButton, ElDivider, ElMessage, FormInstance, FormRules } from 'element-plus'
import { Connection, InfoFilled, Search } from '@element-plus/icons-vue'
import { Error } from '@/components/Error'
import { BuilderNodesOnk8s, NewBuilderNodes, Params } from '@/api/configure/types'
import { getBuilderNodesOnK8sApi, installBuilderNodeOnK8s } from '@/api/configure/builder'
import { Org } from '@/api/common/types'
import { getOrganizationsApi } from '@/api/common'

const bindDialogVisible = ref(false)

const { t } = useI18n()

const builderNodes = ref<NewBuilderNodes[]>([])

const Organizations = ref<Array<Org>>(new Array<Org>())

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

getOrganizations()

// TODO: 当前仅作为mock使用
builderNodes.value.push({
  name: null,
  maxWorker: 1,
  workspace: 'gotocloud-agent', // 工作空间，等同于k8s的namespace
  kubeConfig: null,
  orgs: null
})

const newBuilderNodeRef = ref<FormInstance>()
const newBuilderNode = ref<NewBuilderNodes>({
  name: null,
  maxWorker: 1,
  workspace: '', // 工作空间，等同于k8s的namespace
  kubeConfig: null,
  orgs: null
})

function resetForm() {
  newBuilderNode.value = {
    name: null,
    maxWorker: 1,
    workspace: '', // 工作空间，等同于k8s的namespace
    kubeConfig: null,
    orgs: null
  }
}

const builderNodesOnK8s = ref<BuilderNodesOnk8s[]>()
const getBuilderNodes = async function (params?: Params) {
  await getBuilderNodesOnK8sApi(
    params || {
      pageIndex: 1,
      pageSize: 20
    }
  ).then((resp) => {
    builderNodesOnK8s.value = resp
  })
}
getBuilderNodes()

const submit = async () => {
  if (!newBuilderNodeRef.value) return
  await newBuilderNodeRef.value.validate(async (valid, fields) => {
    if (valid) {
      await installBuilderNodeOnK8s(newBuilderNode.value)
        .then((resp) => {
          if (resp.success) {
            bindDialogVisible.value = false
            resetForm()
            getBuilderNodes()
          }
          resp.success
            ? ElMessage({
                type: 'success',
                message: t('builder.install_success'),
                showClose: true,
                center: true
              })
            : ElMessage({
                type: 'error',
                message: t('builder.install_failure'),
                showClose: true,
                center: true,
                grouping: true
              })
        })
        .catch(() => {
          ElMessage({
            type: 'error',
            message: t('builder.install_failure'),
            showClose: true,
            center: true
          })
        })
    }
  })
}

const newBuilderNodeRule = ref<FormRules>({
  name: [
    {
      required: true,
      message: '',
      trigger: 'blur'
    }
  ],
  workspace: [
    {
      required: true,
      message: '',
      trigger: 'blur'
    }
  ],
  orgs: [
    {
      required: true,
      message: t('coderepo.at_least_one_org'),
      trigger: 'blur',
      validator: (rule, value) => {
        return (value as Array<Org>).length > 0
      }
    }
  ]
})

const kubeconfig_demo =
  'apiVersion: v1\n' +
  'clusters:\n' +
  '- cluster:\n' +
  '    certificate-authority-data: DATA+OMITTED\n' +
  '    server: https://host:port\n' +
  '  name: default\n' +
  'contexts:\n' +
  '- context:\n' +
  '    cluster: default\n' +
  '    user: default\n' +
  '  name: default\n' +
  'current-context: default\n' +
  'kind: Config\n' +
  'preferences: {}\n' +
  'users:\n' +
  '- name: default\n' +
  '  user:\n' +
  '    client-certificate-data: REDACTED\n' +
  '    client-key-data: REDACTED'
</script>

<template>
  <Error
    v-if="builderNodes.length === 0"
    type="builder_empty"
    @error-click="
      () => {
        bindDialogVisible = true
      }
    "
  />
  <ElDialog
    v-model="bindDialogVisible"
    :title="t('builder.install')"
    :fullscreen="false"
    :draggable="true"
  >
    <ElTabs type="border-card">
      <ElTabPane>
        <template #label>
          K8S
          <ElTooltip :content="t('builder.introduce.install_on_k8s')">
            <ElIcon style="cursor: pointer">
              <InfoFilled />
            </ElIcon>
          </ElTooltip>
        </template>
        <ElForm
          label-position="top"
          :model="newBuilderNode"
          ref="newBuilderNodeRef"
          :rules="newBuilderNodeRule"
        >
          <ElFormItem :label="t('builder.node_type.k8s.node_name')" prop="name">
            <ElInput v-model="newBuilderNode.name" />
          </ElFormItem>
          <ElFormItem prop="orgs" :label="t('common.organization')">
            <ElSelect multiple v-model="newBuilderNode.orgs" style="width: 100%">
              <ElOption
                v-for="org in Organizations"
                :key="org.id"
                :label="org.name"
                :value="org.id"
              /> </ElSelect
          ></ElFormItem>
          <ElFormItem :label="t('builder.node_type.k8s.max_worker')">
            <ElInputNumber :min="1" controls-position="right" v-model="newBuilderNode.maxWorker" />
          </ElFormItem>
          <ElFormItem prop="workspace">
            <template #label>
              {{ t('builder.node_type.k8s.namespace') }}
              <ElTooltip>
                <template #content> {{ t('builder.introduce.what_is_namespace') }}</template>
                <ElIcon style="cursor: pointer">
                  <InfoFilled />
                </ElIcon>
              </ElTooltip>
            </template>
            <ElInput placeholder="gotocloud-agent" v-model="newBuilderNode.workspace" />
          </ElFormItem>
          <ElFormItem prop="kubeconfig">
            <template #label>
              KubeConfig
              <ElTooltip>
                <template #content> {{ t('builder.introduce.where_is_kubeconfig') }}</template>
                <ElIcon style="cursor: pointer">
                  <InfoFilled />
                </ElIcon>
              </ElTooltip>
            </template>
            <ElInput
              type="textarea"
              :placeholder="kubeconfig_demo"
              v-model="newBuilderNode.kubeConfig"
              :autosize="{ minRows: 6, maxRows: 9 }"
            />
          </ElFormItem>
        </ElForm>
      </ElTabPane>
      <ElTabPane disabled>
        <template #label>
          Windows
          <ElTooltip :content="t('builder.introduce.install_on_windows')">
            <ElIcon style="cursor: pointer">
              <InfoFilled />
            </ElIcon>
          </ElTooltip>
        </template>
      </ElTabPane>
      <ElTabPane disabled>
        <template #label>
          Linux
          <ElTooltip :content="t('builder.introduce.install_on_linux')">
            <ElIcon style="cursor: pointer">
              <InfoFilled />
            </ElIcon>
          </ElTooltip>
        </template>
      </ElTabPane>
    </ElTabs>
    <template #footer>
      <span>
        <ElButton @click="bindDialogVisible = false">{{ t('common.cancel') }}</ElButton>
        <ElButton type="primary" @click="submit()">{{ t('common.install') }}</ElButton>
      </span>
    </template>
  </ElDialog>
  <ElRow justify="space-between" v-if="builderNodes.length > 0">
    <ElCol :span="18">
      <ElSpace wrap>
        <span class="header_title">{{ t('router.builders') }}</span>
        <ElDivider direction="vertical" />
        <ElInput
          v-model="keywords"
          :placeholder="t('builder.name')"
          :suffix-icon="Search"
          clearable
        />
      </ElSpace>
    </ElCol>
    <ElCol :span="6" style="text-align: right">
      <ElButton :icon="Connection" type="primary" @click="bindDialogVisible = true"
        >{{ t('builder.install') }}
      </ElButton>
    </ElCol>
  </ElRow>
  <ElTabs v-if="builderNodes.length > 0" />
</template>
<style scoped></style>
