import { defineStore } from 'pinia'
import { useAxios } from '@/hooks/web/useAxios'

export interface VisibilityState {
  auth: Number[]
}

const request = useAxios()

export const getAuthCodes = async (): Promise<Number[]> => {
  const res = await request.get<IResponse<Number[]>>({ url: '/user/auths' })
  return res && res.data && res.data.data
}

export const useVisibilityStore = defineStore({
  id: 'visibility',
  state: (): VisibilityState => ({
    auth: []
  }),
  getters: {
    getAuthCodes(): Number[] {
      console.log('getAuthCodes')
      return this.auth
    }
  },
  actions: {
    setAuthCodes(): void {
      getAuthCodes().then((codes) => {
        this.auth = codes
      })
    }
  }
})
