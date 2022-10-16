<script setup lang="ts">
import pageError from '@/assets/svgs/404.svg'
import networkError from '@/assets/svgs/500.svg'
import empty_repo from '@/assets/svgs/empty_repo.svg'
import noPermission from '@/assets/svgs/403.svg'
import { propTypes } from '@/utils/propTypes'
import { useI18n } from '@/hooks/web/useI18n'
import { ElButton } from 'element-plus'

interface ErrorMap {
  url: string
  message: string
  buttonText: string
  width: number
}

const { t } = useI18n()

const errorMap: {
  [key: string]: ErrorMap
} = {
  '404': {
    url: pageError,
    message: t('error.pageError'),
    buttonText: t('error.returnToHome'),
    width: 350
  },
  '500': {
    url: networkError,
    message: t('error.networkError'),
    buttonText: t('error.returnToHome'),
    width: 350
  },
  '403': {
    url: noPermission,
    message: t('error.noPermission'),
    buttonText: t('error.returnToHome'),
    width: 350
  },
  coderepo_empty: {
    url: empty_repo,
    message: t('error.repoEmpty'),
    buttonText: t('coderepo.bind'),
    width: 128
  },
  artifactrepo_empty: {
    url: empty_repo,
    message: t('error.repoEmpty'),
    buttonText: t('artifacts.bind'),
    width: 128
  },
  k8srepo_empty: {
    url: empty_repo,
    message: t('error.repoEmpty'),
    buttonText: t('k8s.bind'),
    width: 128
  }
}

const props = defineProps({
  type: propTypes.string.validate((v: string) => ['404', '500', '403'].includes(v)).def('404')
})

const emit = defineEmits(['errorClick'])

const btnClick = () => {
  emit('errorClick', props.type)
}
</script>

<template>
  <div class="flex justify-center">
    <div class="text-center">
      <img
        :width="errorMap[type].width"
        :src="errorMap[type].url"
        alt=""
        style="padding: 10px; margin: 0 auto"
      />
      <div class="text-14px text-[var(--el-color-info)]">{{ errorMap[type].message }}</div>
      <div class="mt-20px">
        <ElButton type="primary" @click="btnClick">{{ errorMap[type].buttonText }}</ElButton>
      </div>
    </div>
  </div>
</template>
