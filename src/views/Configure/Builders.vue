<script setup lang="ts">
import { useI18n } from '@/hooks/web/useI18n'
import { ref } from 'vue'
import { ElButton, ElDivider } from 'element-plus'
import { Connection, InfoFilled, Search } from '@element-plus/icons-vue'
import { Error } from '@/components/Error'
import { NewBuilderNodes } from '@/api/configure/types'

const bindDialogVisible = ref(false)

const { t } = useI18n()

const builderNodes = ref<NewBuilderNodes[]>([])

// TODO: 当前仅作为mock使用
builderNodes.value.push({
  id: 1,
  name: null,
  maxWorker: 1,
  workspace: 'gotocloud-agent', // 工作空间，等同于k8s的namespace
  kubeConfig: null
})

const newBuilderNode = ref<NewBuilderNodes>({
  id: null,
  name: null,
  maxWorker: 1,
  workspace: '', // 工作空间，等同于k8s的namespace
  kubeConfig: null
})

const submit = function () {
  console.log(newBuilderNode.value)
  bindDialogVisible.value = false
}
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
            <ElIcon style="cursor: pointer"><InfoFilled /></ElIcon>
          </ElTooltip>
        </template>
        <ElForm label-position="top" :model="newBuilderNode">
          <ElFormItem :label="t('builder.node_type.k8s.node_name')">
            <ElInput v-model="newBuilderNode.name" />
          </ElFormItem>
          <ElFormItem :label="t('builder.node_type.k8s.max_worker')">
            <ElInputNumber :min="1" controls-position="right" v-model="newBuilderNode.maxWorker" />
          </ElFormItem>
          <ElFormItem>
            <template #label>
              {{ t('builder.node_type.k8s.namespace') }}
              <ElTooltip>
                <template #content> {{ t('builder.introduce.what_is_namespace') }}</template>
                <ElIcon style="cursor: pointer"><InfoFilled /></ElIcon>
              </ElTooltip>
            </template>
            <ElInput placeholder="gotocloud-agent" v-model="newBuilderNode.workspace" />
          </ElFormItem>
          <ElFormItem>
            <template #label>
              KubeConfig
              <ElTooltip>
                <template #content> {{ t('builder.introduce.where_is_kubeconfig') }}</template>
                <ElIcon style="cursor: pointer"><InfoFilled /></ElIcon>
              </ElTooltip>
            </template>
            <ElInput
              type="textarea"
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
            <ElIcon style="cursor: pointer"><InfoFilled /></ElIcon>
          </ElTooltip>
        </template>
      </ElTabPane>
      <ElTabPane disabled>
        <template #label>
          Linux
          <ElTooltip :content="t('builder.introduce.install_on_linux')">
            <ElIcon style="cursor: pointer"><InfoFilled /></ElIcon>
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
</template>
<style scoped></style>
