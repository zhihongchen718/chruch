# Grace Church 微信小程序

本项目位于 `apps/member-client`，使用 uni-app（Vue 3、TypeScript）。阶段 A 提供独立的本地演示，含会员和新朋友签到、本人档案、小组、通知和圣经资料。奉献、书库、友好教会和权限管理入口会提示尚未开放。

## 在 Windows 10 运行

1. 安装 Node.js 24 LTS（含 npm）及微信开发者工具。可以用 VS Code 编辑源码。
2. 在本仓库根目录打开 PowerShell 并运行以下命令。

   ```powershell
   cd apps/member-client
   node --version
   npm.cmd ci
   npm.cmd run type-check
   npm.cmd run dev:mp-weixin
   ```

3. 编译成功后，在微信开发者工具选择「导入项目」，目录选 `apps/member-client/dist/dev/mp-weixin`。演示使用内置测试号 `touristappid`。根据工具提示登录后，选用测试号并运行模拟器。
4. 开发命令保持运行并监听源码改动。完成演示后可用 `Ctrl+C` 停止监听。

### 安装失败时

- `node --version` 应显示 `v24.x`。如果仍显示旧版本，切换到 Node.js 24 后打开新的 PowerShell，再检查一次版本。
- 如果 `npm.cmd ci` 报 `EPERM`，且日志指向正在使用的 `esbuild.exe`，先在运行本项目开发命令的终端按 `Ctrl+C` 停止监听，再重新执行 `npm.cmd ci`。
- `uni` 或 `vue-tsc` 找不到时，先确认 `npm.cmd ci` 已成功退出。这两个命令由项目依赖提供。

## 演示操作

1. **欢迎页**。选中文或 English，点「开始使用」。首页右上角和「更多 → 应用设置」均可切换语言。语言选择会保存在本机。
2. **会员签到**。在首页选择「老教友登录」，点击「使用演示会员登录」。登录后自动继续本场签到，显示结果和分类人数。返回首页再次签到可查看已有记录。
3. **新朋友签到**。在首页打开「新朋友登记」。空表单会提示必填字段，可用「填写演示资料」填充虚构姓名、邮箱和首次参加选项。提交后可查看本场结果。演示仅保存签到凭据，不保存输入的姓名和联系方式。
4. **查看权限**。「会员」只显示当前会员本人资料。登录后「小组」出现白石小组，「通知中心」可以查看演示代祷通知。通过「更多 → 账号」退出后，这些受限内容将从页面清除。
5. **试听**。「资料 → 旧约」中选择「诗篇」及「圣经音频」，打开《静心聆听》。这是一段约 22 秒的自制器乐。可播放、暂停、拖动进度。离开详情时停止播放并释放播放器。

演示场次按 `America/Vancouver` 的当前日期生成，当地当天全天开放签到。场次 ID 含日期和时段。会员按固定演示账号去重，新朋友按本机演示身份去重。重开应用仍可查看已完成的签到。测试时可用开发者工具的「清缓存 → 清除数据缓存」重置本机演示。

## 构建与环境配置

| 命令 | 输出目录 | 数据模式 |
| --- | --- | --- |
| `npm.cmd run dev:mp-weixin` | `dist/dev/mp-weixin` | 默认本地演示，可改用 API |
| `npm.cmd run build:mp-weixin` | `dist/build/mp-weixin` | API，演示代码和音频不进入发布包 |

本地配置可参考 `apps/member-client/.env.example`，复制到小程序项目目录下的 `.env.development.local` 或 `.env.production.local`。

- `VITE_DATA_MODE`。开发编译可设为 `mock` 或 `api`。发布编译固定使用 API。
- `VITE_API_BASE_URL`。填写服务源地址，客户端会追加 `/api/v1`。发布包需要 HTTPS。真机的 `localhost` 指向手机自身，联调请使用手机可访问的地址，并在微信后台配置请求和音频所需的合法域名。
- `WECHAT_APP_ID`。填写真实小程序 AppID，编译后写入 `project.config.json`。真机预览需要真实 AppID 和对应的开发权限。

HTTP 模式请求失败时会显示错误并允许重试。当前仓库未包含 NestJS API。阶段 B 需要提供真实 AppID、可访问的 API 地址、测试会员和绑定方式，并按实际 OpenAPI 更新 `src/services/contracts.ts` 中的契约。真实新朋友登记需要服务端签发活动凭证，通过 `pages/events/guest-checkin?id=<场次>&pass=<凭证>` 进入。微信 AppSecret、数据库凭据和会话签名密钥由服务端管理。

## 源码

- `src/pages` 和 `src/components` 提供页面和交互。
- `src/styles/app.css` 与 `src/i18n` 提供共用视觉变量及双语词条。
- `src/services` 提供统一服务契约、会话和 HTTP 实现。
- `src/mocks` 与 `demo-assets` 提供本地数据、签到和试听素材。

## 本次验证

使用 Node.js 24.22.2 执行依赖复装、类型检查、开发编译和发布编译。微信开发者工具自带的编译器通过了 WXML 与 WXSS 检查。用开发产物验证了登录与可见范围、签到重复提交、签到记录恢复、访客表单校验和语言偏好。

开发者工具窗口捕获超时，模拟器交互、试听和真机仍需按上面的步骤验证。模拟器可直接通过界面导入，无需启用命令行服务端口。
