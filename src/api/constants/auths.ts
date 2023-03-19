export enum AuthCodes {
  MainMenuProject = 10000, // MainMenuProject 主菜单->项目
  ResProjectNew = 10100, // 新建项目
  ResProjectDelete = 10201, // 删除项目
  ResProjectUpdate = 10202, // 更新项目信息
  ResProjectSourceCode = 10310, // 管理模块：代码仓库
  ResProjectSourceCodeImport = 10311, // 管理模块：导入代码仓库
  ResProjectSourceDelete = 10312, // 管理模块：删除代码仓库
  ResProjectCI = 10320, // 管理模块：持续集成
  ResProjectCINew = 10321, // 管理模块：新建构建计划
  ResProjectCIStart = 10322, // 管理模块：开始构建
  ResProjectCIHistory = 10323, // 管理模块：构建计划
  ResProjectCIDelete = 10324, // 管理模块：删除计划
  ResProjectCD = 10330, // 管理模块：持续部署
  ResProjectCDNew = 10331, // 管理模块：新建部署方案
  ResProjectCDStart = 10332, // 管理模块：开始部署/重新部署
  ResProjectCDHistory = 10333, // 管理模块：部署历史
  ResProjectCDRollback = 10334, // 管理模块：回滚部署
  ResProjectCDDelete = 10334, // 管理模块：删除部署方案
  ResProjectCDMonitor = 10335, // 管理模块：转到应用监控
  ResProjectArtifacts = 10340, // 管理模块：制品仓库
  ResProjectArtifactDelete = 10341, // 管理模块：删除制品

  MainMenuConfigure = 20000, // MainMenuConfigure 主菜单->配置
  SubMenuConfigureCodeRepo = 20010, // 代码仓库
  ResConfigureCodeRepoBind = 20011, // 绑定代码仓库
  ResConfigureCodeRepoUpdate = 20012, // 编辑代码仓库
  ResConfigureCodeRepoRemove = 20013, // 移除代码仓库
  SubMenuConfigureBuildNode = 20020, // 构建节点
  ResConfigureBuildNodeBind = 20021, // 安装构建节点
  ResConfigureBuildNodeUpdate = 20022, // 更新构建节点
  ResConfigureBuildNodeRemove = 20023, // 卸载构建节点
  SubMenuConfigureArtifactRepo = 20030, // 制品仓库
  ResArtifactRepoBind = 20031, // 绑定制品仓库
  ResArtifactRepoUpdate = 20032, // 更新制品仓库
  ResArtifactRepoRemove = 20033, // 移除制品仓库
  ResArtifactDeleteHistory = 20034, // 删除历史制品
  SubMenuConfigureDeployRepo = 20040, // 部署环境
  ResDeployBind = 20041, // 绑定部署环境
  ResDeployUpdate = 20042, // 更新部署环境
  ResDeployRemove = 20043, // 移除部署环境

  MainMenuMonitor = 30000, // MainMenuMonitor 主菜单->应用监控
  ResourceMonitorScale = 30010, // 伸缩副本
  ResourceMonitorRestart = 30011, // 重新应用
  ResourceMonitorDelete = 30012, // 删除应用
  ResourceMonitorShell = 30013, // 容器Shell
  ResourceMonitorDeletePod = 30014, // 删除容器

  MainMenuUsers = 40000, // MainMenuUsers 主菜单->用户管理
  SubMenuUser = 40010, // 用户管理
  SubMenuOrgs = 40020 // 组织管理
}
