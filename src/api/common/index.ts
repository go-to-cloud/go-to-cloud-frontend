import { useAxios } from '@/hooks/web/useAxios'

const request = useAxios()

// 获取所有字典
export const getDictApi = async (): Promise<IResponse> => {
  const res = await request.get({ url: '/dict/list' })
  return res && res.data
}

// 模拟获取某个字典
export const getDictOneApi = async (): Promise<IResponse> => {
  const res = await request.get({ url: '/dict/one' })
  return res && res.data
}

export const getOrganizationsApi = async (): Promise<Map<string, string>> => {
  const res = await request.get({ url: '/user/info' })

  const obj = res && res.data && res.data.data && res.data.data.orgs

  return obj == null ? obj : new Map(Object.entries(obj))
}

// 获取可用节点
export const getAvailableNodesApi = async (): Promise<Map<number, number>> => {
  const res = await request.get({
    url: '/configure/builder/nodes/k8s/available'
  })

  const obj = res && res.data && res.data.data
  return obj == null ? obj : new Map(Object.entries(obj))
}
