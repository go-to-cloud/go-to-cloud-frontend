import { useAxios } from '@/hooks/web/useAxios'
import type { DeleteSourceCodeResult, ProjectData } from './types'
import {
  BindCodeRepoGroup,
  CodeRepoKVP,
  DeleteProjectResult,
  ImportedSourceCodeData,
  ImportSourceCodeResult,
  ProjectCreationSubmitResult,
  UpdateResult
} from './types'
import { RemoveRepoResult } from '@/api/configure/types'

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

export const updateProjectApi = async (params: any): Promise<UpdateResult> => {
  const res = await request.put<IResponse<UpdateResult>>({
    url: '/projects',
    data: params
  })
  return res && res.data && res.data.data
}

export const importSourceCodeApi = async (
  projectId: number,
  body: CodeRepoKVP
): Promise<UpdateResult> => {
  const res = await request.post<IResponse<ImportSourceCodeResult>>({
    url: '/projects/' + projectId + '/import',
    data: { url: body.value, codeRepoId: body.groupId }
  })
  return res && res.data && res.data.data
}

export const getSourceCodeListApi = async (
  projectId: number
): Promise<ImportedSourceCodeData[]> => {
  const res = await request.get<IResponse<ImportedSourceCodeData[]>>({
    url: '/projects/' + projectId + '/imported'
  })
  return res && res.data && res.data.data
}

export const removeSourceCodeApi = async (
  projectId: number,
  sourceCodeId: number
): Promise<RemoveRepoResult> => {
  const res = await request.delete<IResponse<DeleteSourceCodeResult>>({
    url: '/projects/' + projectId + '/sourcecode/' + sourceCodeId
  })
  if (res && res.data && res.data.data) {
    return { success: res.data.data.result }
  } else {
    return { success: false }
  }
}
