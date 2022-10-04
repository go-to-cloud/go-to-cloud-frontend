import { useAxios } from '@/hooks/web/useAxios'
import { CodeRepoCreationSubmitResult, TestingResult } from '@/api/configure/types'

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

export const bindRepoApi = async (params: any): Promise<CodeRepoCreationSubmitResult> => {
  const res = await request.post<IResponse<CodeRepoCreationSubmitResult>>({
    url: '/configure/coderepo/bind',
    data: params
  })
  return res && res.data && res.data.data
}
