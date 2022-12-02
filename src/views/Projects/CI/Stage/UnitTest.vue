<template>
  <ElTimelineItem size="large" :icon="t02" placement="top">
    <ElCard :header="t('project.ci.code_repo_header')">
      <ElFormItem :label="t('project.ci.code_repo')">
        <ElSelect
          v-model="formPlan.source_code_id"
          @change="gitSelected"
          :placeholder="t('common.selectText')"
        >
          <ElOption
            v-for="item in sourceCodeList"
            :key="item.id"
            :label="item.url"
            :value="item.id"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="t('project.ci.code_branch')">
        <ElSelect v-model="formPlan.branch" :placeholder="t('common.selectText')">
          <ElOption
            v-for="item in branchList"
            :key="item.Path"
            :label="item.Name"
            :value="item.Path"
          />
        </ElSelect>
      </ElFormItem>
    </ElCard>
  </ElTimelineItem>
</template>

<script lang="ts"></script>

<style scoped></style>
