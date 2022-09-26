export type CodeRepoData = {
  id: number
  name: string
  origin: string
  projects: number
  remark: string
}

import { useAxios } from '@/hooks/web/useAxios'

const request = useAxios()

export const getCodeRepoApi = async (params: any): Promise<IResponse> => {
  const res = await request.get({ url: '/configure/coderepo/list', params })
  return res && res.data
}
