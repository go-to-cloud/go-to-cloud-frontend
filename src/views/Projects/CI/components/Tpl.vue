<template>
  <ElSpace />
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/hooks/web/useI18n'

const { t } = useI18n()
const { path, params } = useRoute()
const { push } = useRouter()
</script>

<style scoped></style>
