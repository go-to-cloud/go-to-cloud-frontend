import { useAxios } from '@/hooks/web/useAxios'
import type { UserType } from './types'
import { MemberData, OrgType } from './types'

interface RoleParams {
  roleName: string
}

const request = useAxios()

export const loginApi = async (data: UserType): Promise<UserType> => {
  const res = await request.post({ url: '/login', data })
  return res && res.data
}

export const loginOutApi = async (): Promise<IResponse> => {
  const res = await request.get({ url: '/user/logout' })
  return res && res.data
}

export const getUserListApi = ({ params }: AxiosConfig) => {
  return request.get<{
    total: number
    list: UserType[]
  }>({ url: '/user/list', params })
}

export const getOrgListApi = async () => {
  const rlt = await request.get<IResponse<OrgType[]>>({
    url: '/user/org/list'
  })

  return rlt && rlt.data && rlt.data.data
}

export const getAllMembersApi = async () => {
  const rlt = await request.get<IResponse<MemberData[]>>({
    url: '/user/list'
  })

  return rlt && rlt.data && rlt.data.data
}

export const getAdminRoleApi = async (
  params: RoleParams
): Promise<IResponse<AppCustomRouteRecordRaw[]>> => {
  const res = await request.get({ url: '/role/list', params })
  return res && res.data
}

export const getTestRoleApi = async (params: RoleParams): Promise<IResponse<string[]>> => {
  const res = await request.get({ url: '/role/list', params })
  return res && res.data
}
