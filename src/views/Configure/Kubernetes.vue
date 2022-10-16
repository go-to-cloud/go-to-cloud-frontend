<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { Error } from '@/components/Error'
import { ElButton, FormInstance, FormRules } from 'element-plus'
import { Dialog } from '@/components/Dialog'
import { isEmpty } from '@/utils/is'
import { Org } from '@/api/common/types'

const { t } = useI18n()

const bindDialogVisible = ref(false)
const dlgForCreate = ref(true)
const clusterDetailFormRef = ref<FormInstance>()
const clusterDetailForm = ref({
  id: 0,
  name: '',
  kubeconfig: '',
  remark: '',
  orgs: ref(Array<number>())
})

const clusterDetailFormRule = ref<FormRules>({
  name: [
    {
      required: true,
      message: '',
      trigger: 'blur',
      validator: (rule, value) => !isEmpty(value)
    }
  ],
  kubeconfig: [
    {
      required: true,
      message: '',
      trigger: 'blur',
      validator: (rule, value) => !isEmpty(value)
    }
  ],
  orgs: [
    {
      required: true,
      message: t('at_least_one_org'),
      trigger: 'blur',
      validator: (rule, value) => {
        return (value as Array<Org>).length > 0
      }
    }
  ]
})
const clusterList = ref<Array<number>>([])

const getClusterList = async (params?: any) => {}

function resetForm() {
  clusterDetailForm.value = {
    id: 0,
    name: '',
    kubeconfig: '',
    remark: '',
    orgs: []
  }
}
const close = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  bindDialogVisible.value = false
  resetForm()
  getClusterList()
}

const submit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
    }
  })
}

const save = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
    }
  })
}
</script>

<template>
  <Error
    v-if="clusterList.length === 0"
    type="k8srepo_empty"
    @error-click="
      () => {
        dlgForCreate = true
        bindDialogVisible = true
      }
    "
  />

  <Dialog
    v-model="bindDialogVisible"
    :title="t('k8s.bind')"
    @close="close(clusterDetailFormRef)"
    :fullscreen="false"
  >
    <ElForm
      ref="clusterDetailFormRef"
      status-icon
      :rules="clusterDetailFormRule"
      label-position="top"
      :model="clusterDetailForm"
    >
      <ElRow>
        <ElCol :span="10">
          <ElFormItem prop="name" :label="t('k8s.name')">
            <ElInput
              v-model="clusterDetailForm.name"
              :label="t('k8s.name')"
              :placeholder="t('common.inputText') + t('k8s.name')"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="18">
          <ElFormItem prop="orgs" :label="t('common.organization')">
            <ElSelect multiple v-model="clusterDetailForm.orgs" style="width: 100%">
              <ElOption
                v-for="org in Organizations"
                :key="org.id"
                :label="org.name"
                :value="org.id"
              /> </ElSelect
          ></ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="18">
          <ElFormItem :label="t('k8s.kubeconfig')">
            <ElInput
              :autosize="{ minRows: 8, maxRows: 12 }"
              v-model="clusterDetailForm.kubeconfig"
              show-word-limit
              type="textarea"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="18">
          <ElFormItem :label="t('common.remark')">
            <ElInput
              v-model="clusterDetailForm.remark"
              show-word-limit
              maxlength="200"
              type="textarea"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <span>
        <ElButton
          @click="testing(clusterDetailFormRef)"
          :disabled="isEmpty(clusterDetailForm.kubeconfig)"
          type="success"
          style="position: absolute; left: 10px"
          >{{ t('common.testing') }}</ElButton
        >
        <ElButton @click="close(clusterDetailFormRef)">{{ t('common.cancel') }}</ElButton>
        <ElButton v-if="dlgForCreate" type="primary" @click="submit(clusterDetailFormRef)">{{
          t('common.ok')
        }}</ElButton>
        <ElButton v-if="!dlgForCreate" type="primary" @click="save(clusterDetailFormRef)">{{
          t('common.update')
        }}</ElButton>
      </span>
    </template>
  </Dialog>
</template>

<style scoped></style>
