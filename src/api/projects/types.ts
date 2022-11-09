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

export type DeleteProjectResult = {
  success: boolean
}

export type UpdateProjectResult = {
  success: boolean
}

export type ImportSourceCodeResult = {
  success: boolean
}
export type ImportedSourceCodeResult = {
  codeRepoOrigin: string
  codeRepoId: number
  createdAt: string
  createdBy: string
  id: number
  url: string
}
