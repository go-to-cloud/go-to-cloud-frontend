export type ProjectData = {
  id: number
  name: string
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
  options: CodeRepoKVP[]
}
