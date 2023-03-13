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
  id: number
  name: string
  created_at: string
  member_count: number
  remark: string
}

export type MemberData = {
  key: number
  id: number
  belong_count: number
  name: string
  email: string
  mobile: string
  account: string
  pinyin: string
  pinyin_init: string
}
