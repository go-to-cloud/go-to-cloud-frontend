<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { Error } from '@/components/Error'
import { ElButton, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Dialog } from '@/components/Dialog'
import { isEmpty } from '@/utils/is'
import { Org } from '@/api/common/types'
import { ElMessage } from 'element-plus/es'
import {
  bindK8sApi,
  getK8sRepoApi,
  removeK8sApi,
  testingK8sApi,
  updateK8sApi
} from '@/api/configure/deploy'
import { getOrganizationsApi } from '@/api/common'
import { K8sRepoData } from '@/api/configure/types'
import { Connection, Delete, Expand, MoreFilled, Search } from '@element-plus/icons-vue'
import { useVisibilityStore } from '@/store/modules/visibility'
import { AuthCodes } from '@/api/constants/auths'

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

interface Params {
  pageIndex?: number
  pageSize?: number
}

const Organizations = ref<Array<Org>>(new Array<Org>())

const getOrganizations = async () => {
  await getOrganizationsApi().then((resp) => {
    if (resp!) {
      clusterDetailForm.value.orgs = new Array<number>()
      Organizations.value = new Array<Org>()
      for (let entry of resp.entries()) {
        Organizations.value.push({
          id: Number(entry[0]),
          name: entry[1]
        })
        clusterDetailForm.value.orgs.push(Number(entry[0]))
      }
    }
  })
}

getOrganizations()

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

const k8sDataList = ref<K8sRepoData[]>([])

const getClusterList = async (params?: Params) => {
  await getK8sRepoApi().then((resp) => {
    // params || {
    //   pageIndex: 1,
    //   pageSize: 20
    // }
    k8sDataList.value = resp
  })
}

getClusterList()

function resetForm() {
  clusterDetailForm.value = {
    id: 0,
    name: '',
    kubeconfig: '',
    remark: '',
    orgs: []
  }
}

const removeRepo = async (repoId: number) => {
  await removeK8sApi(repoId).then((resp) => {
    if (resp.success) {
      getClusterList()
    }
  })
}
const testing = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    await testingK8sApi(clusterDetailForm.value)
      .then((resp) => {
        resp.success
          ? ElMessage({
              type: 'success',
              message: t('k8s.testingPassed'),
              showClose: true,
              center: true
            })
          : ElMessage({
              type: 'error',
              message: t('k8s.testingFailed'),
              showClose: true,
              center: true,
              grouping: true
            })
      })
      .catch(() => {
        ElMessage({
          type: 'error',
          message: t('k8s.testingFailed'),
          showClose: true,
          center: true
        })
      })
  })
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
      await bindK8sApi(clusterDetailForm.value)
        .then((resp) => {
          if (resp.success) {
            bindDialogVisible.value = false
            resetForm()
            getClusterList()
          }
          resp.success
            ? ElMessage({
                type: 'success',
                message: t('k8s.bindSuccess'),
                showClose: true,
                center: true
              })
            : ElMessage({
                type: 'error',
                message: t('k8s.bindFailure'),
                showClose: true,
                center: true,
                grouping: true
              })
        })
        .catch(() => {
          ElMessage({
            type: 'error',
            message: t('k8s.bindFailure'),
            showClose: true,
            center: true
          })
        })
    }
  })
}

const save = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      await updateK8sApi(clusterDetailForm.value)
        .then((resp) => {
          if (resp.success) {
            bindDialogVisible.value = false
            resetForm()
            getClusterList()
          }
          resp.success
            ? ElMessage({
                type: 'success',
                message: t('k8s.updateSuccess'),
                showClose: true,
                center: true
              })
            : ElMessage({
                type: 'error',
                message: t('k8s.updateFailure'),
                showClose: true,
                center: true,
                grouping: true
              })
        })
        .catch(() => {
          ElMessage({
            type: 'error',
            message: t('k8s.updateFailure'),
            showClose: true,
            center: true
          })
        })
    }
  })
}

interface HandlerCommand {
  id: number
  cmd: string
  form: K8sRepoData
}

const actionHandler = (command: HandlerCommand) => {
  switch (command.cmd) {
    case 'del': {
      ElMessageBox.confirm(t('k8s.removeConfirm'), t('common.confirmMsgTitle'), {
        confirmButtonText: t('common.ok'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }).then(() => {
        removeRepo(command.id)
      })
      break
    }
    case 'view': {
      dlgForCreate.value = false
      bindDialogVisible.value = true
      let orgIds: Array<number> = []
      for (let i = 0; i < command.form.orgLites.length; i++) {
        orgIds.push(command.form.orgLites[i].orgId)
      }
      clusterDetailForm.value = {
        id: command.form.id,
        name: command.form.name,
        kubeconfig: command.form.kubeconfig,
        remark: command.form.remark,
        orgs: orgIds
      }
      break
    }
  }
}

function errorClick() {
  dlgForCreate.value = true
  bindDialogVisible.value = true
}

const visibilityStore = useVisibilityStore()
const auth = computed(() => visibilityStore.getAuthCodes)

// 防止手动页面刷新后状态丢失
watchEffect(async () => {
  await visibilityStore.setAuthCodes()
})
</script>

<template>
  <Error v-if="k8sDataList.length === 0" type="k8srepo_empty" @error-click="errorClick" />
  <ElRow v-if="k8sDataList.length > 0" justify="space-between">
    <ElCol :span="18">
      <ElSpace wrap>
        <span class="header_title">{{ t('router.k8s') }}</span>
        <ElDivider direction="vertical" />
        <ElInput v-model="keywords" :placeholder="t('k8s.name')" :suffix-icon="Search" clearable />
      </ElSpace>
    </ElCol>
    <ElCol
      v-if="auth.includes(AuthCodes.ResConfigureDeployBind)"
      :span="6"
      style="text-align: right"
    >
      <ElButton
        :icon="Connection"
        type="primary"
        @click="
          () => {
            dlgForCreate = true
            bindDialogVisible = true
          }
        "
        >{{ t('k8s.bind') }}
      </ElButton>
    </ElCol>
  </ElRow>
  <ElTabs v-if="k8sDataList.length > 0">
    <ElTabPane :label="t('k8s.all')">
      <ElTable :data="k8sDataList" style="width: 100%">
        <ElTableColumn :label="t('k8s.name')" prop="name" width="350">
          <template #default="scope">
            <ElSpace>
              <span>{{ scope.row.name }}</span>
            </ElSpace>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('common.organization')" prop="orgLites">
          <template #default="scope">
            <ElSpace>
              <ElTag
                v-for="item in scope.row.orgLites"
                :key="item.orgId"
                :closable="false"
                style="cursor: default"
                >{{ item.orgName }}
              </ElTag>
            </ElSpace>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('k8s.serverVer')" prop="serverVersion" width="150" />
        <ElTableColumn :label="t('common.remark')" prop="remark" width="300" />
        <ElTableColumn :label="t('k8s.updatedAt')" prop="updatedAt" width="200" />
        <ElTableColumn :label="t('k8s.action')" fixed="right" prop="id" width="80">
          <template #default="scope">
            <ElDropdown @command="actionHandler">
              <span class="el-dropdown-link">
                <ElButton :icon="MoreFilled" circle />
              </span>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem :command="{ id: scope.row.id, cmd: 'view', form: scope.row }">
                    <ElLink :icon="Expand" :underline="false">
                      {{ t('common.viewDetail') }}
                    </ElLink>
                  </ElDropdownItem>
                  <ElDropdownItem
                    v-if="auth.includes(AuthCodes.ResConfigureDeployRemove)"
                    :command="{ id: scope.row.id, cmd: 'del' }"
                    divided
                  >
                    <ElLink :icon="Delete" :underline="false" type="danger">
                      {{ t('k8s.remove') }}
                    </ElLink>
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElTabPane>
  </ElTabs>
  <Dialog
    v-model="bindDialogVisible"
    :fullscreen="false"
    :title="t('k8s.bind')"
    @close="close(clusterDetailFormRef)"
  >
    <ElForm
      ref="clusterDetailFormRef"
      :model="clusterDetailForm"
      :rules="clusterDetailFormRule"
      label-position="top"
      status-icon
    >
      <ElRow>
        <ElCol :span="10">
          <ElFormItem :label="t('k8s.name')" prop="name">
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
          <ElFormItem :label="t('common.organization')" prop="orgs">
            <ElSelect v-model="clusterDetailForm.orgs" multiple style="width: 100%">
              <ElOption
                v-for="org in Organizations"
                :key="org.id"
                :label="org.name"
                :value="org.id"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow>
        <ElCol :span="18">
          <ElFormItem :label="t('k8s.kubeconfig')">
            <ElInput
              v-model="clusterDetailForm.kubeconfig"
              :autosize="{ minRows: 6, maxRows: 9 }"
              :disabled="!dlgForCreate"
              :readonly="!dlgForCreate"
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
              maxlength="200"
              show-word-limit
              type="textarea"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <span>
        <ElButton
          :disabled="isEmpty(clusterDetailForm.kubeconfig)"
          style="position: absolute; left: 10px"
          type="success"
          @click="testing(clusterDetailFormRef)"
          >{{ t('common.testing') }}</ElButton
        >
        <ElButton @click="close(clusterDetailFormRef)">{{ t('common.close') }}</ElButton>
        <ElButton
          v-if="dlgForCreate && auth.includes(AuthCodes.ResConfigureDeployBind)"
          type="primary"
          @click="submit(clusterDetailFormRef)"
          >{{ t('common.ok') }}</ElButton
        >
        <ElButton
          v-if="!dlgForCreate && auth.includes(AuthCodes.ResConfigureDeployUpdate)"
          type="primary"
          @click="save(clusterDetailFormRef)"
          >{{ t('common.update') }}</ElButton
        >
      </span>
    </template>
  </Dialog>
</template>

<style scoped></style>
