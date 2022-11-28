<script setup lang="ts">
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/hooks/web/useI18n'
import { useIcon } from '@/hooks/web/useIcon'

const { t } = useI18n()
const { path, params } = useRoute()
const { push } = useRouter()

const t01 = useIcon({ icon: 'material-symbols:filter-1', color: '#3385ff' })
const t02 = useIcon({ icon: 'material-symbols:filter-2', color: '#3385ff' })
const t03 = useIcon({ icon: 'material-symbols:filter-3', color: '#3385ff' })
const t04 = useIcon({ icon: 'material-symbols:filter-4', color: '#3385ff' })
const t05 = useIcon({ icon: 'material-symbols:filter-5', color: '#3385ff' })
const t06 = useIcon({ icon: 'material-symbols:filter-6', color: '#3385ff' })
const t07 = useIcon({ icon: 'material-symbols:filter-7', color: '#3385ff' })
const t08 = useIcon({ icon: 'material-symbols:filter-8', color: '#3385ff' })
const t09 = useIcon({ icon: 'material-symbols:filter-9', color: '#3385ff' })
const t10 = useIcon({ icon: 'material-symbols:filter-10', color: '#3385ff' })

const formPlan = reactive({
  name: '',
  region: '',
  type: ''
})
</script>

<template>
  <ElForm label-position="top" :model="formPlan">
    <ElTimeline>
      <ElTimelineItem size="large" :icon="t01" timestamp="计划" placement="top">
        <ElCard>
          <ElFormItem label="计划名称"> <ElInput v-model="formPlan.name" /> </ElFormItem>
        </ElCard> </ElTimelineItem
      ><ElTimelineItem size="large" :icon="t02" timestamp="代码" placement="top">
        <ElCard>
          <ElFormItem label="代码仓库"> <ElInput v-model="formPlan.name" /> </ElFormItem>
          <ElFormItem label="构建分支"> <ElInput v-model="formPlan.name" /> </ElFormItem>
        </ElCard> </ElTimelineItem
      ><ElTimelineItem size="large" :icon="t03" timestamp="质量" placement="top">
        <ElCard>
          <ElFormItem label="单元测试"> <ElInput v-model="formPlan.name" /> </ElFormItem>
          <ElFormItem label="Lint检测"> <ElInput v-model="formPlan.name" /> </ElFormItem>
        </ElCard> </ElTimelineItem
      ><ElTimelineItem size="large" :icon="t04" timestamp="镜像" placement="top">
        <ElCard>
          <ElFormItem label="Dockerfile"> <ElInput v-model="formPlan.name" /> </ElFormItem>
        </ElCard> </ElTimelineItem
      ><ElTimelineItem size="large" :icon="t05" timestamp="部署" placement="top">
        <ElCard>
          <ElFormItem label="Dockerfile"> <ElInput v-model="formPlan.name" /> </ElFormItem>
        </ElCard>
      </ElTimelineItem>
    </ElTimeline>
  </ElForm>
</template>
<style scoped></style>
