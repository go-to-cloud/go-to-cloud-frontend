export type CodeRepoData = {
  id: number
  name: string
  origin: number
  url: string
  isPublic: boolean
  orgLites: Array<OrgLite>
  remark: string
  updatedAt: string
  token: string
}

export type OrgLite = {
  orgId: number
  orgName: string
}

export type TestingResult = {
  success: boolean
}

export type CodeRepoCreationSubmitResult = {
  success: boolean
  id: number
}

export type RemoveRepoResult = {
  success: boolean
}
