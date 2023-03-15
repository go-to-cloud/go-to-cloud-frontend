<script lang="ts" setup>
import { ElDropdown, ElDropdownItem, ElDropdownMenu, ElMessageBox } from 'element-plus'
import { useI18n } from '@/hooks/web/useI18n'
import { useCache } from '@/hooks/web/useCache'
import { resetRouter } from '@/router'
import { useRouter } from 'vue-router'
import { loginOutApi } from '@/api/login'
import { useDesign } from '@/hooks/web/useDesign'
import { useTagsViewStore } from '@/store/modules/tagsView'

import { useAxios } from '@/hooks/web/useAxios'
import { onMounted, ref } from 'vue'
import { PasswordResetResult } from '@/api/login/types'
import { ElMessage, ElNotification } from 'element-plus/es'

const request = useAxios()

const tagsViewStore = useTagsViewStore()

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('user-info')

const { t } = useI18n()

const { wsCache } = useCache()

const { replace } = useRouter()

const userName = ref<string>('')

const pwdDlgVisible = ref<boolean>(false)
const newPassword = ref<string>('')
const oldPassword = ref<string>('')

const getUserInfo = async () => {
  const res = await request.get({ url: '/user/info' })
  if (res && res.data && res.data.data) {
    userName.value = res.data.data.userName
  }
}

onMounted(async () => {
  await getUserInfo()
})

const resetPassword = async () => {
  await request
    .put<IResponse<PasswordResetResult>>({
      url: '/user/0/password/reset',
      data: { oldPassword: oldPassword.value, newPassword: newPassword.value }
    })
    .then(async (r) => {
      if (r.data.code == '200') {
        ElNotification({
          title: t('common.success'),
          message: t('authz.user.resetSuccess'),
          type: 'success'
        })
      } else {
        ElNotification({
          title: t('common.success'),
          message: t('authz.user.resetFailure'),
          type: 'error'
        })
      }
    })
    .catch((r) => {
      ElMessage({
        type: 'error',
        message: t('authz.user.resetFailure'),
        showClose: true,
        center: true
      })
    })
}
const show = () => {
  pwdDlgVisible.value = true
}
const loginOut = () => {
  ElMessageBox.confirm(t('common.loginOutMessage'), t('common.reminder'), {
    confirmButtonText: t('common.ok'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  })
    .then(async () => {
      const res = await loginOutApi().catch(() => {})
      if (res) {
        wsCache.clear()
        tagsViewStore.delAllViews()
        resetRouter() // 重置静态路由表
        replace('/login')
      }
    })
    .catch(() => {})
}

const toDocument = () => {
  window.open('https://docs.gotocloud.vip')
}

const close = () => {
  pwdDlgVisible.value = false
}
</script>

<template>
  <ElDialog
    v-model="pwdDlgVisible"
    :fullscreen="false"
    :title="t('authz.user.reset_password')"
    height
    width="30%"
  >
    <ElForm label-position="top" status-icon>
      <ElRow>
        <ElCol :span="18">
          <ElFormItem :label="t('authz.user.old_password')" prop="password">
            <ElInput
              v-model="oldPassword"
              :label="t('authz.user.password')"
              autocomplete="off"
              minlength="6"
              show-password
              type="password"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="18">
          <ElFormItem :label="t('authz.user.new_password')" prop="password">
            <ElInput
              v-model="newPassword"
              :label="t('authz.user.password')"
              autocomplete="off"
              minlength="6"
              show-password
              type="password"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <span>
        <ElButton @click="close">{{ t('common.cancel') }}</ElButton>
        <ElButton type="primary" @click="resetPassword">{{ t('common.update') }}</ElButton>
      </span>
    </template>
  </ElDialog>
  <ElDropdown :class="prefixCls">
    <div class="flex items-center" style="padding-right: 20px; cursor: pointer">
      <img
        alt=""
        class="w-[calc(var(--logo-height)-5px)] rounded-[50%]"
        src="@/assets/imgs/avatar.png"
      />
      <span class="<lg:hidden text-14px pl-[5px] text-[var(--top-header-text-color)]">{{
        userName
      }}</span>
    </div>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem>
          <Icon icon="fluent:key-reset-20-filled" />
          <ElLink :underline="false" style="margin-left: -2px" @click="show">
            {{ t('authz.user.reset_password') }}
          </ElLink>
        </ElDropdownItem>
        <ElDropdownItem>
          <Icon icon="ion:help-buoy-sharp" />
          <ElLink :underline="false" style="margin-left: -2px" @click="toDocument">{{
            t('common.document')
          }}</ElLink>
        </ElDropdownItem>
        <ElDropdownItem divided>
          <Icon icon="majesticons:door-exit" />
          <ElLink :underline="false" style="margin-left: -2px" @click="loginOut">{{
            t('common.loginOut')
          }}</ElLink>
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>
