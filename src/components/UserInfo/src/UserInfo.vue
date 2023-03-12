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

const request = useAxios()

const tagsViewStore = useTagsViewStore()

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('user-info')

const { t } = useI18n()

const { wsCache } = useCache()

const { replace } = useRouter()

const userName = ref<string>('')

const getUserInfo = async () => {
  const res = await request.get({ url: '/user/info' })
  if (res && res.data && res.data.data) {
    userName.value = res.data.data.userName
  }
}

onMounted(async () => {
  await getUserInfo()
})
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
</script>

<template>
  <ElDropdown :class="prefixCls" trigger="click">
    <div class="flex items-center">
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
          <div @click="toDocument">{{ t('common.document') }}</div>
        </ElDropdownItem>
        <ElDropdownItem divided>
          <div @click="loginOut">{{ t('common.loginOut') }}</div>
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>
