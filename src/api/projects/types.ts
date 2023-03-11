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

export type DeletePlanResult = {
  success: boolean
}

export type StartBuildPlanResult = {
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

export type DeleteSourceCodeResult = {
  result: boolean
}

export type BranchResult = {
  branches: BranchDetail[]
}
export type BranchDetail = {
  Name: string
  Path: string
  Sha: string
}

export type BuildEnvItem = {
  value: string
  label: string
}
export type BuildEnvGroup = {
  label: string
  options: BuildEnvItem[]
}

export type BuildCmd = {
  lintCheck: string
  unitTest: string
}

export type Branchref = {
  branch: string
  branch_commit_id: string
}

export type BuildPlan = {
  id: number
  name: string
  buildEnv: string
  source_code_id: number | undefined
  branch: Branchref | undefined
  qa_enabled: boolean
  unit_test: string | undefined
  lint_check: string | undefined
  artifact_enabled: boolean
  dockerfile: string | undefined
  image_name: string | undefined
  artifact_repo_id: number | undefined
  deploy_enabled: boolean
  remark: string | undefined
}

export type BuildPlanCard = BuildPlan & {
  lastBuildAt: string | undefined
  lastBuildResult: number
  buildingNow: boolean
}

export type DeploymentApps = {
  k8sName: string
  artifactName: string
  artifactTag: string
  namespace: string
  id: number
  k8s: number
  lastDeployAt: string
  deploymentId: number
}
