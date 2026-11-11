import { createMockService } from '../mocks/church'
import { isDemo } from './config'
import { httpService } from './http'
import { currentSession } from './session'

export const churchApi = isDemo ? createMockService(currentSession) : httpService
