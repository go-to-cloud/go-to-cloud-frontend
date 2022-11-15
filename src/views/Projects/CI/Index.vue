<script setup lang="ts">
import { ElButton } from 'element-plus'
import { CirclePlus, Search } from '@element-plus/icons-vue'
import { ContentDetailWrap } from '@/components/ContentDetailWrap'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/hooks/web/useI18n'
import { Tpl } from './components'
import { ref } from 'vue'

const { t } = useI18n()
const { path, params } = useRoute()
const { push } = useRouter()

const tplDialogVisible = ref(false)
const showNewPlanDlg = () => {
  tplDialogVisible.value = true
}
</script>
<template>
  <ElDialog v-model="tplDialogVisible" fullscreen>
    <Tpl />
  </ElDialog>
  <ContentDetailWrap :title="t('project.toolset.ci')" @back="push('/projects/index')">
    <ElRow justify="space-between">
      <ElCol :span="18">
        <ElSpace wrap>
          <span class="header_title">{{ t('router.projects') }}</span>
          <ElDivider direction="vertical" />
          <ElInput
            v-model="filterKeywords"
            :placeholder="t('project.ci.plan')"
            :suffix-icon="Search"
            clearable
          />
        </ElSpace>
      </ElCol>
      <ElCol :span="6" style="text-align: right">
        <ElButton :icon="CirclePlus" @click="showNewPlanDlg" type="primary">
          {{ t('project.ci.new_plan') }}</ElButton
        >
      </ElCol>
    </ElRow>
    <ElDivider />
    <ElSpace wrap :size="30">
      <ElCard shadow="hover" v-for="i in 18" :key="i">
        <template #header>
          <div class="card-header">
            <span>Card name</span>
            <el-button class="button" text>Operation button</el-button>
          </div>
        </template>
        <div v-for="o in 4" :key="o" class="text item">{{ 'List item ' + o }}</div>
      </ElCard>
    </ElSpace>
  </ContentDetailWrap>
</template>

<style scoped></style>
