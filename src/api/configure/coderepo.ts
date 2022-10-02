import { useAxios } from '@/hooks/web/useAxios'
import { TestingResult } from '@/api/configure/types'

export type CodeRepoData = {
  id: number
  name: string
  origin: string
  projects: number
  remark: string
}

const request = useAxios()

export const GetCodeRepoApi = async (params: any): Promise<IResponse> => {
  const res = await request.get({ url: '/configure/coderepo', params })
  return res && res.data
}

export const testingRepoApi = async (params: any): Promise<TestingResult> => {
  const res = await request.post<IResponse<TestingResult>>({
    url: '/configure/coderepo/testing',
    data: params
  })
  return res && res.data && res.data.data
}
