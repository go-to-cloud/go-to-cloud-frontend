import { TestingResult } from '@/api/configure/types'
import { useAxios } from '@/hooks/web/useAxios'

const request = useAxios()

export const testingArtifactRepoApi = async (params: any): Promise<TestingResult> => {
  const res = await request.post<IResponse<TestingResult>>({
    url: '/configure/coderepo/testing',
    data: params
  })
  return res && res.data && res.data.data
}
