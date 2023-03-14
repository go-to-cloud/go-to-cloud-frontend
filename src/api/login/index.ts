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

  return await fixKey(rlt && rlt.data && rlt.data.data)
}

export const getAllMembersApi = async () => {
  const rlt = await request.get<IResponse<MemberData[]>>({
    url: '/user/list'
  })

  return await fixKey(rlt && rlt.data && rlt.data.data)
}

const fixKey = async (a: MemberData[] | OrgType[]): Promise<MemberData[] | OrgType[]> => {
  if (a) {
    for (let i = 0; i < a.length; i++) {
      a[i].key = a[i].id
    }
  }
  return a
}

export const getJoinedMemberApi = async (orgId: number): Promise<number[]> => {
  const rlt = await request.get<IResponse<number[]>>({
    url: '/user/joined/' + orgId
  })
  return rlt && rlt.data && rlt.data.data
}

export const getJoinedOrgsApi = async (memberId: number): Promise<number[]> => {
  const rlt = await request.get<IResponse<number[]>>({
    url: '/user/' + memberId + '/orgs/joined'
  })
  return rlt && rlt.data && rlt.data.data
}

export const saveJoinedMembersApi = async (
  orgId: number,
  members: number[]
): Promise<IResponse> => {
  const rlt = await request.put({
    url: '/user/join/' + orgId,
    data: { users: members }
  })

  return rlt && rlt.data
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
