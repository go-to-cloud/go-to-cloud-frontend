import { defineStore } from 'pinia'

export interface VisibilityState {
  auth: string[]
}

export const useVisibilityStore = defineStore({
  id: 'visibility',
  state: (): VisibilityState => ({
    auth: []
  }),
  getters: {
    getAuthCodes(): string[] {
      return this.auth
    }
  },
  actions: {
    setAuthCodes(kind: string): void {
      // TODO: getAuthCodesByKind
      // this.auth = { codes }
      this.auth = [kind]
    }
  }
})
