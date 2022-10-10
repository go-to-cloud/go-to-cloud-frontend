import { RepoCreationSubmitResult, TestingResult } from '@/api/configure/types'
import { useAxios } from '@/hooks/web/useAxios'

const request = useAxios()

export const testingRepoApi = async (params: any): Promise<TestingResult> => {
  const res = await request.post<IResponse<TestingResult>>({
    url: '/configure/artifact/testing',
    data: params
  })
  return res && res.data && res.data.data
}

export const bindRepoApi = async (params: any): Promise<RepoCreationSubmitResult> => {
  const res = await request.post<IResponse<RepoCreationSubmitResult>>({
    url: '/configure/artifact/bind',
    data: params
  })
  return res && res.data && res.data.data
}
