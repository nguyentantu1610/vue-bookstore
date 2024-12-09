import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: false },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/AuthView.vue'),
      redirect: '/login',
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('../components/auth/Login.vue'),
          alias: ['/login'],
          meta: { requiresAuth: false },
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('../components/auth/Register.vue'),
          alias: ['/register'],
          meta: { requiresAuth: false },
        },
        {
          path: 'forgot-password',
          name: 'forgot-password',
          component: () => import('../components/auth/ForgotPassword.vue'),
          alias: ['/forgot-password'],
          meta: { requiresAuth: true },
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

router.beforeEach(async (to) => {
  const { name } = storeToRefs(useAuthStore())
  const { getName } = useAuthStore()
  await getName()
  if (to.meta.requiresAuth && !name.value) {
    return { name: 'login' }
  }
})

export default router
