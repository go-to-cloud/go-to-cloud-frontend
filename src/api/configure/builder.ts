import { useAxios } from '@/hooks/web/useAxios'
import { BuilderNodesOnk8s, Params } from '@/api/configure/types'

const request = useAxios()

export type CommonResult = {
  success: boolean
}
export const installBuilderNodeOnK8s = async (params: any): Promise<CommonResult> => {
  const res = await request.post<IResponse<CommonResult>>({
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

export const uninstallBuildNodeApi = async (params: number): Promise<CommonResult> => {
  const res = await request.delete<IResponse<CommonResult>>({
    url: '/configure/builder/node/' + params
  })
  return res && res.data && res.data.data
}

export const updateBuildNodeApi = async (params: any): Promise<CommonResult> => {
  const res = await request.put<IResponse<CommonResult>>({
    url: '/configure/builder/node',
    data: params
  })
  return res && res.data && res.data.data
}
