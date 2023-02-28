import { K8sRepoData } from '@/api/configure/types'

export type AppData = {
  id: number
  name: string
  org: string
  orgId: number
  remark: string
}

export type K8sRepoWithAppData = K8sRepoData & {
  items: AppData[] | null
}
