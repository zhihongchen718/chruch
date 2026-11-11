import { ref, shallowRef, watch } from 'vue'
import { codeOf, type ErrorCode } from '../services/errors'
import { session } from '../services/session'

export function useLoad<T>(fetch: () => Promise<T>) {
  const value = shallowRef<T | null>(null)
  const loading = ref(true)
  const error = ref<ErrorCode | null>(null)
  let revision = 0

  watch(session, () => {
    value.value = null
    error.value = null
  }, { flush: 'sync' })

  async function load() {
    const request = ++revision
    const sessionAtStart = session.value
    value.value = null
    error.value = null
    loading.value = true
    try {
      const result = await fetch()
      if (request === revision && sessionAtStart === session.value) {
        value.value = result
        return result
      }
    } catch (failure) {
      if (request === revision) error.value = codeOf(failure)
    } finally {
      if (request === revision) loading.value = false
    }
    return null
  }

  return { value, loading, error, load }
}
