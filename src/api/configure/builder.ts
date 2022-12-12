import { useAxios } from '@/hooks/web/useAxios'
import { BuilderNodesOnk8s, Params } from '@/api/configure/types'

const request = useAxios()

export type BuilderNodeInstallResult = {
  success: boolean
}
export const installBuilderNodeOnK8s = async (params: any): Promise<BuilderNodeInstallResult> => {
  const res = await request.post<IResponse<BuilderNodeInstallResult>>({
    url: '/configure/builder/install/k8s',
    data: params
  })
  return res && res.data && res.data.data
}

export const getBuilderNodesOnK8sApi = async (params: Params): Promise<BuilderNodesOnk8s[]> => {
  const res = await request.get<IResponse<BuilderNodesOnk8s[]>>({
    url: '/configure/builder/nodes/k8s',
    params
  })
  return res && res.data && res.data.data
}
