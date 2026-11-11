import { isDemo } from './config'

let packagedAudio: Promise<string> | undefined

export function audioSource(url: string) {
  if (!isDemo) return Promise.resolve(url)
  // WeChat can play a user-data file, but cannot play directly from the code package.
  if (!packagedAudio) {
    const fs = wx.getFileSystemManager()
    const target = `${wx.env.USER_DATA_PATH}/grace-church-stillness.mp3`
    packagedAudio = new Promise<string>((resolve, reject) => {
      fs.readFile({
        filePath: url,
        success({ data }) {
          fs.writeFile({ filePath: target, data, success: () => resolve(target), fail: reject })
        },
        fail: reject,
      })
    }).catch(error => {
      packagedAudio = undefined
      throw error
    })
  }
  return packagedAudio
}
