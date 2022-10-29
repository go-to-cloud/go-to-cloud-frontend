export type ProjectData = {
  id: number
  name: string
}
export type CodeRepoKVP = {
  value: string
  label: string
}
export type BindCodeRepoGroup = {
  label: string
  options: CodeRepoKVP[]
}
