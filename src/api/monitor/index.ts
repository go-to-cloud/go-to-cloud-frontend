import { useAxios } from '@/hooks/web/useAxios'
import { AppData } from '@/api/monitor/types'

const request = useAxios()

export const getAppsApi = async (params: number): Promise<AppData[]> => {
  const res = await request.get<IResponse<AppData[]>>({
    url: '/monitor/' + params + '/apps/query'
  })
  return res && res.data && res.data.data
}
