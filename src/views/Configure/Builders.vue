<script setup lang="ts">
import { useI18n } from '@/hooks/web/useI18n'
import { ref } from 'vue'
import { ElButton, ElDivider } from 'element-plus'
import { Connection, Search } from '@element-plus/icons-vue'
import { Error } from '@/components/Error'
import { BuilderNodes } from '@/api/configure/types'

const bindDialogVisible = ref(false)

const { t } = useI18n()

const builderNodes = ref<BuilderNodes[]>([])

// TODO: 当前仅作为mock使用
builderNodes.value.push({
  id: 1,
  name: 'string',
  maxWorker: 1,
  workspace: 'string', // 工作空间，等同于k8s的namespace
  agentEndpoint: 'string' // 构建节点agent服务地址
})
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
    <ElForm label-position="top">
      <ElFormItem label="节点名称">
        <ElInput />
      </ElFormItem>
      <ElFormItem label="同时构建数量">
        <ElInput />
      </ElFormItem>
      <ElFormItem label="节点配置（构建节点以客户端形式部署）">
        <ElInput />
      </ElFormItem>
    </ElForm>
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
