export type UserLoginType = {
  username: string
  password: string
}

export type UserType = {
  username: string
  password: string
  role: string
  roleId: string
  permissions: string | string[]
  expire: string
  token: string
}

export type OrgType = {
  key: number
  id: number
  name: string
  created_at: string
  member_count: number
  remark: string
}

export type MemberData = {
  key: number
  id: number
  belongsTo: string[]
  name: string
  email: string
  mobile: string
  account: string
  pinyin: string
  pinyin_init: string
  originPassword: string
}
