export enum ScmType {
  Gitlab = 0,
  Github = 1,
  Gitee = 2,
  Gitea = 3
}

export type K8sRepoData = {
  id: number
  name: string
  orgLites: Array<OrgLite>
  remark: string
  updatedAt: string
  kubeconfig: string
  serverVersion: string
}

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

export enum ArtifactRepoType {
  OSS = 0,
  Docker = 1,
  Nuget = 2,
  Maven = 3,
  Npm = 4,
  S3 = 5
}

export type ArtifactType = {
  Id: number
  Enabled: boolean
  RepoName: string
  IsSecurity: boolean
  Type: ArtifactRepoType
  Items: Array<ArtifactRepoItem> | null
  Data: ArtifactRepoData | null
}

export type ArtifactRepoItem = {
  hashId: string
  name: string
  latestVersion: string
  publishedAt: string
  tags: string[]
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

export interface NewBuilderNodes {
  id: number | null
  name: string | null
  maxWorker: number | null
  workspace: string | null // 工作空间，等同于k8s的namespace
  kubeConfig: string | null
  orgs: [] | null
}
