import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
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
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('../components/auth/Register.vue'),
          alias: ['/register'],
        },
        {
          path: 'forgot-password',
          name: 'forgot-password',
          component: () => import('../components/auth/ForgotPassword.vue'),
          alias: ['/forgot-password'],
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

export default router
