import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { hideNavigation: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { hideNavigation: true }
  },
  {
    path: '/board',
    name: 'board',
    component: () => import('@/views/Board.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/simple-board',
    name: 'simple-board',
    component: () => import('@/views/SimpleBoard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/minimal-board',
    name: 'minimal-board',
    component: () => import('@/views/MinimalBoard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/inbox',
    name: 'inbox',
    component: () => import('@/views/Inbox.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/analytics',
    name: 'analytics',
    component: () => import('@/views/Analytics.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/telegram',
    name: 'telegram',
    component: () => import('@/views/TelegramIntegration.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/Settings.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('@/views/TestNavigation.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/simple',
    name: 'simple',
    component: () => import('@/views/SimpleTest.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/simple-analytics',
    name: 'simple-analytics',
    component: () => import('@/views/SimpleAnalytics.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('user-token')
  const isAuthenticated = !!token // 简单的认证检查
  
  console.log('路由守卫:', {
    to: to.path,
    from: from.path,
    requiresAuth: to.meta.requiresAuth,
    isAuthenticated,
    token: token ? '有token' : '无token'
  })
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('需要认证但未登录，跳转到登录页')
    next('/login')
  } else if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
    console.log('已认证用户访问登录页，跳转到首页')
    next('/')
  } else {
    console.log('路由守卫通过，继续导航')
    next()
  }
})

export default router 