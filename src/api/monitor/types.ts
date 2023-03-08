import { K8sRepoData } from '@/api/configure/types'

export type DeleteResult = {
  success: boolean
}

export type AppData = {
  id: number
  name: string
  org: string
  orgId: number
  remark: string
}

export type K8sRepoWithAppData = K8sRepoData & {
  items: AppData[] | null
}

export type PodDetail = {
  id: number
  name: string
  containers: []
  restartCounter: number
  createdAt: string
  status: string
  qos: string
}

export interface HandlerCommand {
  id: number
  cmd: string
  form: any
}

export const xTermDefaultTheme = {
  foreground: '#ffffff',
  background: '#000000',
  cursor: '#ffffff',
  selection: 'rgba(255, 255, 255, 0.3)',
  black: '#000000',
  brightBlack: '#808080',
  red: '#ce2f2b',
  brightRed: '#f44a47',
  green: '#00b976',
  brightGreen: '#05d289',
  yellow: '#e0d500',
  brightYellow: '#f4f628',
  magenta: '#bd37bc',
  brightMagenta: '#d86cd8',
  blue: '#1d6fca',
  brightBlue: '#358bed',
  cyan: '#00a8cf',
  brightCyan: '#19b8dd',
  white: '#e5e5e5',
  brightWhite: '#ffffff'
}
