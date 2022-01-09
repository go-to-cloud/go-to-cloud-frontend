<script setup lang="ts">
import { reactive, ref, unref } from 'vue'
import { Form } from '@/components/Form'
import { useI18n } from '@/hooks/web/useI18n'
import { ElButton, ElCheckbox, ElLink } from 'element-plus'
import { required } from '@/utils/formRules'
import { useForm } from '@/hooks/web/useForm'
import { loginApi } from '@/api/login'
import type { UserLoginType } from '@/api/login/types'

const { t } = useI18n()

const rules = {
  username: [required],
  password: [required]
}

const schema = reactive<FormSchema[]>([
  {
    field: 'title',
    colProps: {
      span: 24
    }
  },
  {
    field: 'username',
    label: t('login.username'),
    value: 'admin',
    component: 'Input',
    colProps: {
      span: 24
    }
  },
  {
    field: 'password',
    label: t('login.password'),
    value: 'admin',
    component: 'InputPassword',
    colProps: {
      span: 24
    },
    componentProps: {
      style: {
        width: '100%'
      }
    }
  },
  {
    field: 'tool',
    colProps: {
      span: 24
    }
  },
  {
    field: 'login',
    colProps: {
      span: 24
    }
  },
  {
    field: 'other',
    component: 'Divider',
    label: t('login.otherLogin'),
    componentProps: {
      contentPosition: 'center'
    }
  },
  {
    field: 'otherIcon',
    colProps: {
      span: 24
    }
  }
])

const iconSize = 30

const remember = ref(false)

const { register, elFormRef, methods } = useForm()

const loading = ref(false)

// 登录
async function signIn() {
  const formRef = unref(elFormRef)
  const validate = await formRef?.validate()?.catch(() => {})
  if (validate) {
    loading.value = true
    const { getFormData } = methods
    const formData = (await getFormData()) as UserLoginType
    const res = await loginApi(formData)
      .catch(() => {})
      .finally(() => (loading.value = false))
    console.log(res)
  }
}
</script>

<template>
  <Form
    :schema="schema"
    :rules="rules"
    label-position="top"
    hide-required-asterisk
    size="large"
    @register="register"
  >
    <template #title>
      <h2 class="text-2xl font-bold text-center w-[100%]">{{ t('login.login') }}</h2>
    </template>

    <template #tool>
      <div class="flex justify-between items-center w-[100%]">
        <ElCheckbox v-model="remember" :label="t('login.remember')" size="small" />
        <ElLink type="primary" :underline="false">{{ t('login.forgetPassword') }}</ElLink>
      </div>
    </template>

    <template #login>
      <ElButton :loading="loading" type="primary" class="w-[100%]" @click="signIn">
        {{ t('login.login') }}
      </ElButton>
    </template>

    <template #otherIcon>
      <div class="flex justify-between w-[100%]">
        <Icon icon="ant-design:github-filled" :size="iconSize" class="cursor-pointer anticon" />
        <Icon icon="ant-design:wechat-filled" :size="iconSize" class="cursor-pointer anticon" />
        <Icon
          icon="ant-design:alipay-circle-filled"
          :size="iconSize"
          class="cursor-pointer anticon"
        />
        <Icon
          icon="ant-design:weibo-circle-filled"
          :size="iconSize"
          class="cursor-pointer anticon"
        />
      </div>
    </template>
  </Form>
</template>

<style lang="less" scoped>
:deep(.anticon) {
  &:hover {
    color: var(--el-color-primary) !important;
  }
}
</style>