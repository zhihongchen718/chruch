import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import uni from '@dcloudio/vite-plugin-uni'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'WECHAT_'])
  const demo = process.env.NODE_ENV === 'development' && env.VITE_DATA_MODE === 'mock'
  const appId = env.WECHAT_APP_ID?.trim()
  if (appId && !/^wx[0-9a-f]{16}$/i.test(appId)) {
    throw new Error('WECHAT_APP_ID must be a WeChat mini-program AppID.')
  }

  return {
    plugins: [
      uni(),
      {
        name: 'grace-church-weixin-assets',
        generateBundle: {
          order: 'post',
          handler(_options, bundle) {
            if (demo) {
              this.emitFile({
                type: 'asset',
                fileName: 'static/demo/stillness.mp3',
                source: readFileSync(resolve('demo-assets/stillness.mp3')),
              })
            }
            const project = bundle['project.config.json']
            if (appId && project?.type === 'asset') {
              project.source = JSON.stringify({ ...JSON.parse(project.source.toString()), appid: appId }, null, 2)
            }
          },
        },
      },
    ],
  }
})
