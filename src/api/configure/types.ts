export type CodeRepoData = {
  id: number
  name: string
  origin: string
  projects: number
  remark: string
}

export type TestingResult = {
  success: boolean
}

export type CodeRepoCreationSubmitResult = {
  success: boolean
  id: number
}
