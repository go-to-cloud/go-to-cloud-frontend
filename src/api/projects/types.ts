export type ProjectData = {
  id: number
  name: string
  org: string
}
export type CodeRepoKVP = {
  value: string
  label: string
  namespace: string
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
