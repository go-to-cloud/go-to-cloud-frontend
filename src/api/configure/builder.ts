import { useAxios } from '@/hooks/web/useAxios'

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
