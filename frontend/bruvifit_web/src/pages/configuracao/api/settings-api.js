import { apiClient } from '../../../shared/api/axios-client.js'

export const settingsApi = {
  async store() { return (await apiClient.get('/api/configuracao/loja')).data },
  async saveStore(value) {
    const payload = { ...value, cnpj: String(value.cnpj || '').trim() || null }
    return (await apiClient.put('/api/configuracao/loja', payload)).data
  },
  async profile() { return (await apiClient.get('/api/configuracao/perfil')).data },
  async saveProfile(value) { return (await apiClient.put('/api/configuracao/perfil', value)).data },
  async changePassword(value) { return apiClient.put('/api/configuracao/senha', value) },
  async sessions() { return (await apiClient.get('/api/configuracao/sessoes')).data },
  async revokeSession(id) { return apiClient.delete(`/api/configuracao/sessoes/${id}`) },
  async revokeOthers() { return apiClient.delete('/api/configuracao/sessoes-outras') },
  async preferences() { return (await apiClient.get('/api/configuracao/preferencias')).data },
  async savePreferences(value) { return (await apiClient.put('/api/configuracao/preferencias', value)).data },
}
