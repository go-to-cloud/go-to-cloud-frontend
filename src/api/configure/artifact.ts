import { ArtifactRepoData, RepoCreationSubmitResult, TestingResult } from '@/api/configure/types'
import { useAxios } from '@/hooks/web/useAxios'

const request = useAxios()

export const testingRepoApi = async (params: any): Promise<TestingResult> => {
  const res = await request.post<IResponse<TestingResult>>({
    url: '/configure/artifact/testing',
    data: params
  })
  return res && res.data && res.data.data
}

export const GetArtifactRepoApi = async (params: any): Promise<ArtifactRepoData[]> => {
  const res = await request.get<IResponse<ArtifactRepoData[]>>({
    url: '/configure/artifact',
    params
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
