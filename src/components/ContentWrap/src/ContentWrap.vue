<script setup lang="ts">
import { ElCard, ElTooltip } from 'element-plus'
import { propTypes } from '@/utils/propTypes'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('content-wrap')

defineProps({
  title: propTypes.string.def(''),
  message: propTypes.string.def(''),
  button: propTypes.func.def(),
  buttonText: propTypes.string.def(),
  buttonIcon: propTypes.string.def()
})
</script>

<template>
  <ElCard :class="[prefixCls, 'mb-20px']" shadow="never">
    <template v-if="title" #header>
      <ElRow justify="space-between" align="middle">
        <ElCol :span="18">
          <div class="flex items-center">
            <span class="text-16px font-700">{{ title }}</span>
            <ElTooltip v-if="message" effect="dark" placement="right">
              <template #content>
                <div class="max-w-200px">{{ message }}</div>
              </template>
              <Icon class="ml-5px" icon="bi:question-circle-fill" :size="14" />
            </ElTooltip> </div
        ></ElCol>
        <ElCol v-if="button" :span="3">
          <ElButton @click="button" :icon="buttonIcon" type="primary">
            {{ buttonText }}</ElButton
          ></ElCol
        ></ElRow
      >
    </template>
    <div>
      <slot></slot>
    </div>
  </ElCard>
</template>
