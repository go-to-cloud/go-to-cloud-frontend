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
      console.log(this.auth)
      return this.auth
    }
  },
  actions: {
    async setAuthCodes(): Promise<void> {
      this.auth = await getAuthCodes()
      console.log(this.auth)
    }
  }
})
