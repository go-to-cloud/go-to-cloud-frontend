<script setup lang="ts">
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/hooks/web/useI18n'

const { t } = useI18n()
const { path, params } = useRoute()
const { push } = useRouter()

const formPlan = reactive({
  name: '',
  region: '',
  type: ''
})
</script>

<template>
  <ElForm label-position="top" :model="formPlan">
    <ElTimeline>
      <ElTimelineItem timestamp="abc" :icon="material-symbols:filter-1" placement="top">
        <ElCard>
          <ElFormItem label="计划名称"> <ElInput v-model="formPlan.name" /> </ElFormItem>
        </ElCard> </ElTimelineItem
      ><ElTimelineItem timestamp="def" placement="top">
        <ElCard>
          <ElFormItem label="代码仓库"> <ElInput v-model="formPlan.name" /> </ElFormItem>
          <ElFormItem label="构建分支"> <ElInput v-model="formPlan.name" /> </ElFormItem>
        </ElCard>
      </ElTimelineItem>
    </ElTimeline>
  </ElForm>
</template>

<style scoped></style>
