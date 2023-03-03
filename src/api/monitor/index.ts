import { useAxios } from '@/hooks/web/useAxios'
import { AppData } from '@/api/monitor/types'

const request = useAxios()

export const getAppsApi = async (params: number, force: boolean): Promise<AppData[]> => {
  const res = await request.get<IResponse<AppData[]>>({
    url: '/monitor/' + params + '/apps/query?force=' + (force ? 'true' : 'false')
  })
  return res && res.data && res.data.data
}

export const calcAge = (params: string): string => {
  if (params) {
    const seconds = (new Date().getTime() - new Date(params).getTime()) / 1000
    const minutes = seconds / 60
    const hours = minutes / 60
    const days = hours / 24

    if (seconds <= 100) {
      return parseInt(String(seconds)) + 's'
    }
    if (minutes <= 100) {
      return parseInt(String(minutes)) + 'm'
    }
    if (hours <= 24) {
      return parseInt(String(hours)) + 'h'
    }

    const d = parseInt(String(days))
    const f = parseInt(String((24 * (parseInt(String(days * 100)) - d * 100)) / 100))
    let rlt = d + 'd'
    if (f > 0) {
      rlt += f + 'h'
    }
    return rlt
  } else {
    return ''
  }
}

export const scaleReplicasApi = async (
  deploymentId: number,
  k8sRepoId: number,
  num: number
): Promise<IResponse> => {
  const res = await request.put<IResponse>({
    url: '/monitor/' + k8sRepoId + '/apps/scale',
    data: { id: deploymentId, num: num }
  })
  return res && res.data
}

export const restartDeploymentApi = async (
  deploymentId: number,
  k8sRepoId: number
): Promise<IResponse> => {
  const res = await request.put<IResponse>({
    url: '/monitor/' + k8sRepoId + '/apps/restart',
    data: { id: deploymentId }
  })
  return res && res.data
}
