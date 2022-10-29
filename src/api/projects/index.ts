import { useAxios } from '@/hooks/web/useAxios'
import type { ProjectData } from './types'
import { BindCodeRepoGroup } from './types'

const request = useAxios()

export const getProjectsApi = async (params: any): Promise<ProjectData[]> => {
  const res = await request.get({ url: '/projects/list', params })
  return res && res.data.data
}

export const getBindCodeRepoGroupApi = async (): Promise<BindCodeRepoGroup[]> => {
  const res = await request.get({ url: '/projects/coderepo' })
  return res && res.data && res.data.data
}

export const saveTableApi = async (data: Partial<ProjectData>): Promise<IResponse> => {
  const res = await request.post({ url: '/example/save', data })
  return res && res.data
}

export const getTableDetApi = async (id: string): Promise<IResponse<ProjectData>> => {
  const res = await request.get({ url: '/example/detail', params: { id } })
  return res && res.data
}

export const delTableListApi = async (ids: string[] | number[]): Promise<IResponse> => {
  const res = await request.post({ url: '/example/delete', data: { ids } })
  return res && res.data
}
