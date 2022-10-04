import { useAxios } from '@/hooks/web/useAxios'

const request = useAxios()

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
