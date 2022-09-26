import { useCache } from '@/hooks/web/useCache'

const { wsCache } = useCache()

export type LayoutType = 'classic' | 'topLeft' | 'top' | 'cutMenu'

export type ThemeTypes = {
  elColorPrimary?: string
  leftMenuBorderColor?: string
  leftMenuBgColor?: string
  leftMenuBgLightColor?: string
  leftMenuBgActiveColor?: string
  leftMenuCollapseBgActiveColor?: string
  leftMenuTextColor?: string
  leftMenuTextActiveColor?: string
  logoTitleTextColor?: string
  logoBorderColor?: string
  topHeaderBgColor?: string
  topHeaderTextColor?: string
  topHeaderHoverColor?: string
  topToolBorderColor?: string
}
export interface AppState {
  breadcrumb: boolean
  breadcrumbIcon: boolean
  collapse: boolean
  uniqueOpened: boolean
  hamburger: boolean
  screenfull: boolean
  size: boolean
  locale: boolean
  tagsView: boolean
  tagsViewIcon: boolean
  logo: boolean
  fixedHeader: boolean
  greyMode: boolean
  dynamicRouter: boolean
  pageLoading: boolean
  layout: LayoutType
  title: string
  userInfo: string
  isDark: boolean
  currentSize: ElememtPlusSize
  sizeMap: ElememtPlusSize[]
  mobile: boolean
  footer: boolean
  theme: ThemeTypes
}

export const appModules: AppState = {
  userInfo: 'userInfo', // 登录信息存储字段-建议每个项目换一个字段，避免与其他项目冲突
  sizeMap: ['default', 'large', 'small'],
  mobile: false, // 是否是移动端
  title: import.meta.env.VITE_APP_TITLE, // 标题
  pageLoading: false, // 路由跳转loading
  breadcrumb: true, // 面包屑
  breadcrumbIcon: true, // 面包屑图标
  collapse: false, // 折叠菜单
  uniqueOpened: false, // 是否只保持一个子菜单的展开
  hamburger: true, // 折叠图标
  screenfull: true, // 全屏图标
  size: true, // 尺寸图标
  locale: true, // 多语言图标
  tagsView: true, // 标签页
  tagsViewIcon: true, // 是否显示标签图标
  logo: true, // logo
  fixedHeader: true, // 固定toolheader
  footer: false, // 显示页脚
  greyMode: false, // 是否开始灰色模式，用于特殊悼念日
  dynamicRouter: wsCache.get('dynamicRouter') || false, // 是否动态路由

  layout: wsCache.get('layout') || 'classic', // layout布局
  isDark: wsCache.get('isDark') || false, // 是否是暗黑模式
  currentSize: wsCache.get('default') || 'default', // 组件尺寸
  theme: wsCache.get('theme') || {
    // 主题色
    elColorPrimary: '#409eff',
    // 左侧菜单边框颜色
    leftMenuBorderColor: '#eee',
    // 左侧菜单背景颜色
    leftMenuBgColor: '#fff',
    // 左侧菜单浅色背景颜色
    leftMenuBgLightColor: '#fff',
    // 左侧菜单选中背景颜色
    leftMenuBgActiveColor: 'RGBA(64,158,255,0.1)',
    // 左侧菜单收起选中背景颜色
    leftMenuCollapseBgActiveColor: 'RGBA(64,158,255,0.1)',
    // 左侧菜单字体颜色
    leftMenuTextColor: '#333',
    // 左侧菜单选中字体颜色
    leftMenuTextActiveColor: 'var(--el-color-primary)',
    // logo字体颜色
    logoTitleTextColor: 'inherit',
    // logo边框颜色
    logoBorderColor: '#eee',
    // 头部背景颜色
    topHeaderBgColor: '#fff',
    // 头部字体颜色
    topHeaderTextColor: 'inherit',
    // 头部悬停颜色
    topHeaderHoverColor: '#f6f6f6',
    // 头部边框颜色
    topToolBorderColor: '#eee'
  }
}
