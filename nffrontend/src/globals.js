import { entity } from 'simpler-state'

export const authtoken = entity("")
export const resetAuthToken = () => {
  authtoken.set("")
}
export const setAuthToken = newToken => {
  authtoken.set(value => newToken)  
}