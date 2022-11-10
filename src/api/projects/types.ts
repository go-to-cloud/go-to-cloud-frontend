export type ProjectData = {
  id: number
  name: string
  org: string
  orgId: number
  remark: string
}
export type CodeRepoKVP = {
  value: string
  label: string
  namespace: string
  groupId: number
  id: string
}
export type BindCodeRepoGroup = {
  id: number
  label: string
  host: string
  options: CodeRepoKVP[]
}

export type ProjectCreationSubmitResult = {
  success: boolean
  id: number
}

export type DeleteResult = {
  success: boolean
}

export type UpdateResult = {
  success: boolean
}

export type ImportSourceCodeResult = {
  success: boolean
}
export type ImportedSourceCodeData = {
  codeRepoOrigin: string
  codeRepoId: number
  updatedAt: string
  latestBuildAt: string
  id: number
  url: string
}
