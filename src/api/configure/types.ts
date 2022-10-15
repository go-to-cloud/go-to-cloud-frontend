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
export type ArtifactRepoItem = {
  id: number
  name: string
  latestVersion: string
  publishedAt: string
  publishCounter: number
}
export type ArtifactRepoData = {
  id: number
  name: string
  type: number
  url: string
  isSecurity: boolean
  orgLites: Array<OrgLite>
  remark: string
  updatedAt: string
  user: string
  password: string
  items: Array<ArtifactRepoItem> | null
}

export type OrgLite = {
  orgId: number
  orgName: string
}

export type TestingResult = {
  success: boolean
}

export type RepoCreationSubmitResult = {
  success: boolean
  id: number
}

export type RemoveRepoResult = {
  success: boolean
}
