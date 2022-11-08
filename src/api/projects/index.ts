import { useAxios } from '@/hooks/web/useAxios'
import type { ProjectData } from './types'
import {
  BindCodeRepoGroup,
  DeleteProjectResult,
  ImportSourceCodeResult,
  ProjectCreationSubmitResult,
  UpdateProjectResult
} from './types'

const request = useAxios()

export const getProjectsApi = async (params: any): Promise<ProjectData[]> => {
  const res = await request.get({ url: '/projects/list', params })
  return res && res.data.data
}

export const getBindCodeRepoGroupApi = async (): Promise<BindCodeRepoGroup[]> => {
  const res = await request.get({ url: '/projects/coderepo' })
  return res && res.data && res.data.data
}

export const createProjectApi = async (params: any): Promise<ProjectCreationSubmitResult> => {
  const res = await request.post<IResponse<ProjectCreationSubmitResult>>({
    url: '/projects',
    data: params
  })
  return res && res.data && res.data.data
}

export const deleteProjectApi = async (params: number): Promise<DeleteProjectResult> => {
  const res = await request.delete<IResponse<DeleteProjectResult>>({
    url: '/projects/' + params
  })
  if (res && res.data) {
    return { success: res.data.code == '200' }
  } else {
    return { success: false }
  }
}

export const updateProjectApi = async (params: any): Promise<UpdateProjectResult> => {
  const res = await request.put<IResponse<UpdateProjectResult>>({
    url: '/projects',
    data: params
  })
  return res && res.data && res.data.data
}

export const importSourceCodeApi = async (
  projectId: number,
  url: string
): Promise<UpdateProjectResult> => {
  const res = await request.put<IResponse<ImportSourceCodeResult>>({
    url: '/projects/' + projectId + '/import',
    data: { url: url }
  })
  return res && res.data && res.data.data
}
