import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

// 开发环境下启用 vConsole
if (import.meta.env.DEV) {
  import('vconsole').then(({ default: VConsole }) => {
    new VConsole()
    console.log('vConsole 已启用 - 开发环境调试工具')
    console.log('环境信息:', {
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV,
      prod: import.meta.env.PROD,
      baseURL: import.meta.env.BASE_URL
    })
  })
}

// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise拒绝:', event.reason)
})

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

console.log('Plantry 应用已启动') 