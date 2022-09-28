<script setup lang="ts">
import { useI18n } from '@/hooks/web/useI18n'
import { CodeRepoData, getCodeRepoApi } from '@/api/configure/coderepo'
import { ref } from 'vue'
import { ElButton, ElDivider } from 'element-plus'
import { Dialog } from '@/components/Dialog'
import { Connection, Search } from '@element-plus/icons-vue'
import { Icon } from '@iconify/vue'

const bindDialogVisible = ref(false)

interface Params {
  pageIndex?: number
  pageSize?: number
}

const { t } = useI18n()

const columns: TableColumn[] = [
  {
    field: 'name',
    label: t('coderepo.name'),
    width: '150'
  },
  {
    field: 'origin',
    label: t('coderepo.origin'),
    width: '300'
  },
  {
    field: 'projects',
    label: t('coderepo.projects'),
    width: '200'
  },
  {
    field: 'remark',
    label: t('coderepo.remark'),
    width: '300'
  },
  {
    field: 'action',
    label: t('coderepo.action')
  }
]

const loading = ref(true)

let codeRepoDataList = ref<CodeRepoData[]>([])

const getCodeRepoList = async (params?: Params) => {
  const res = await getCodeRepoApi(
    params || {
      pageIndex: 1,
      pageSize: 20
    }
  )
    .catch(() => {})
    .finally(() => {
      loading.value = false
    })

  if (res) {
    codeRepoDataList.value = res.data.data
  }
}

getCodeRepoList()

const keywords = ref('')
const origin = ref('Gitlab')
const isOriginPublic = ref(false)
const remark = ref('')
const address = ref('')
const name = ref('')
</script>

<template>
  <ElRow justify="space-between">
    <ElCol :span="6">
      <ElSpace wrap>
        <span class="header_title">{{ t('router.artifacts') }}</span>
        <ElDivider direction="vertical" />
        <ElInput
          v-model="keywords"
          :placeholder="t('artifacts.name')"
          :suffix-icon="Search"
          clearable
        />
      </ElSpace>
    </ElCol>
    <ElCol :span="6">
      <ElButton :icon="Connection" type="primary" @click="bindDialogVisible = true">{{
        t('artifacts.bind')
      }}</ElButton>
    </ElCol>
  </ElRow>
  <ElTabs class="artifact-tabs" tab-position="left">
    <ElTabPane>
      <template #label>
        <ElSpace wrap :size="10">
          <span>短的仓库</span>
          <Icon icon="vscode-icons:file-type-nuget" width="32" height="32" />
        </ElSpace>
      </template>
      nuget
    </ElTabPane>
    <ElTabPane>
      <template #label>
        <ElSpace wrap :size="10">
          <ElRow>长的仓库名称</ElRow>
          <Icon icon="vscode-icons:file-type-maven" width="32" height="32" />
        </ElSpace>
      </template>
      maven
    </ElTabPane>
    <ElTabPane>
      <template #label>
        <ElSpace wrap :size="10">
          <ElRow>一个很长的仓库名</ElRow>
          <Icon icon="vscode-icons:file-type-docker2" width="32" height="32" />
        </ElSpace>
      </template>
      docker
    </ElTabPane>
  </ElTabs>
  <Dialog v-model="bindDialogVisible" :title="t('artifacts.bind')" :fullscreen="false">
    <ElForm label-position="top">
      <ElRow>
        <ElCol :span="10">
          <ElFormItem required :label="t('artifacts.name')">
            <ElInput
              v-model="name"
              :label="t('artifacts.name')"
              :placeholder="t('common.inputText') + t('artifacts.name')"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElFormItem :label="t('artifacts.origin')">
          <ElSpace :size="10" wrap>
            <div style="border: solid 1px #06f; width: 80px; height: 80px">Docker</div>
            <div style="border: solid 1px #dadfe6; width: 80px; height: 80px">as</div>
            <div style="border: solid 1px #dadfe6; width: 80px; height: 80px">as</div>
            <div style="border: solid 1px #dadfe6; width: 80px; height: 80px">as</div>
            <div style="border: solid 1px #dadfe6; width: 80px; height: 80px">as</div>
            <div style="border: solid 1px #dadfe6; width: 80px; height: 80px">as</div>
            <div style="border: solid 1px #dadfe6; width: 80px; height: 80px">as</div>
            <div style="border: solid 1px #dadfe6; width: 80px; height: 80px">as</div>
            <div style="border: solid 1px #dadfe6; width: 80px; height: 80px">as</div>
            <div style="border: solid 1px #dadfe6; width: 80px; height: 80px">as</div>
          </ElSpace>
        </ElFormItem>
      </ElRow>
      <ElRow>
        <ElFormItem :label="t('artifacts.type')">
          <ElSwitch
            v-model="isOriginPublic"
            :inactive-text="t('coderepo.private')"
            :active-text="t('coderepo.public')"
        /></ElFormItem>
      </ElRow>
      <ElRow>
        <ElCol :span="18">
          <ElFormItem required :label="t('coderepo.address')">
            <ElInput
              v-model="address"
              :placeholder="t('common.inputText') + t('coderepo.address')"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow v-if="isOriginPublic === false && origin === 'Gitlab'">
        <ElCol :span="10">
          <ElFormItem :label="t('coderepo.user')">
            <ElInput :placeholder="t('common.inputText') + t('coderepo.address')" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow v-if="isOriginPublic === false">
        <ElCol :span="10">
          <ElFormItem :label="t('coderepo.token')">
            <ElInput :placeholder="t('common.inputText') + t('coderepo.token')" />
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="18">
          <ElFormItem :label="t('coderepo.remark')">
            <ElInput v-model="remark" show-word-limit maxlength="200" type="textarea" />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <span>
        <el-button
          :disabled="address === ''"
          type="success"
          style="position: absolute; left: 10px"
          >{{ t('common.testing') }}</el-button
        >
        <el-button @click="bindDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="dialogFormVisible = false">Confirm</el-button>
      </span>
    </template>
  </Dialog>
</template>

<style scoped>
.header_title {
  font-size: 18px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}
.artifact-tabs {
  margin: 10px;
  height: 800px;
}
</style>
