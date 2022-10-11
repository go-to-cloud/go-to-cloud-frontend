import { useAxios } from '@/hooks/web/useAxios'
import {
  CodeRepoData,
  RemoveRepoResult,
  RepoCreationSubmitResult,
  TestingResult
} from '@/api/configure/types'

const request = useAxios()

export const getCodeRepoApi = async (params: any): Promise<CodeRepoData[]> => {
  const res = await request.get<IResponse<CodeRepoData[]>>({ url: '/configure/coderepo', params })
  return res && res.data && res.data.data
}

export const testingRepoApi = async (params: any): Promise<TestingResult> => {
  const res = await request.post<IResponse<TestingResult>>({
    url: '/configure/coderepo/testing',
    data: params
  })
  return res && res.data && res.data.data
}

export const bindRepoApi = async (params: any): Promise<RepoCreationSubmitResult> => {
  const res = await request.post<IResponse<RepoCreationSubmitResult>>({
    url: '/configure/coderepo/bind',
    data: params
  })
  return res && res.data && res.data.data
}

export const updateRepoApi = async (params: any): Promise<RepoCreationSubmitResult> => {
  const res = await request.put<IResponse<RepoCreationSubmitResult>>({
    url: '/configure/coderepo',
    data: params
  })
  return res && res.data && res.data.data
}

export const removeRepoApi = async (params: number): Promise<RemoveRepoResult> => {
  const res = await request.delete<IResponse<RemoveRepoResult>>({
    url: '/configure/coderepo/' + params
  })
  return res && res.data && res.data.data
}
