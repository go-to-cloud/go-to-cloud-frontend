import { useAxios } from '@/hooks/web/useAxios'
import {
  NodeType,
  RemoveRepoResult,
  RepoCreationSubmitResult,
  TestingResult
} from '@/api/configure/types'
import { K8sRepoWithAppData } from '@/api/monitor/types'

const request = useAxios()

export const getK8sRepoApi = async (): Promise<K8sRepoWithAppData[]> => {
  const res = await request.get<IResponse<K8sRepoWithAppData[]>>({ url: '/configure/deploy/k8s' })
  const rlt = res && res.data && res.data.data
  for (let i = 0; i < rlt.length; i++) {
    rlt[i].type = NodeType.K8s
  }
  return rlt
}

export const testingK8sApi = async (params: any): Promise<TestingResult> => {
  const res = await request.post<IResponse<TestingResult>>({
    url: '/configure/deploy/k8s/testing',
    data: params
  })
  return res && res.data && res.data.data
}

export const bindK8sApi = async (params: any): Promise<RepoCreationSubmitResult> => {
  const res = await request.post<IResponse<RepoCreationSubmitResult>>({
    url: '/configure/deploy/k8s/bind',
    data: params
  })
  return res && res.data && res.data.data
}

export const updateK8sApi = async (params: any): Promise<RepoCreationSubmitResult> => {
  const res = await request.put<IResponse<RepoCreationSubmitResult>>({
    url: '/configure/deploy/k8s',
    data: params
  })
  return res && res.data && res.data.data
}

export const removeK8sApi = async (params: number): Promise<RemoveRepoResult> => {
  const res = await request.delete<IResponse<RemoveRepoResult>>({
    url: '/configure/deploy/k8s/' + params
  })
  return res && res.data && res.data.data
}
