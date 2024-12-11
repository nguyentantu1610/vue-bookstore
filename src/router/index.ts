import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      alias: ["/home"],
      meta: { requiresAuth: false },
    },
    {
      path: "/auth",
      component: () => import("../views/AuthView.vue"),
      meta: { requiresAuth: false },
      redirect: "/login",
      children: [
        {
          path: "/login",
          name: "login",
          component: () => import("../components/auth/Login.vue"),
          meta: {
            enter: "animate__animated animate__fadeInLeft",
            leave: "animate__animated animate__fadeOutRight animate__faster",
          },
        },
        {
          path: "/register",
          name: "register",
          component: () => import("../components/auth/Register.vue"),
          meta: {
            enter: "animate__animated animate__fadeInRight",
            leave: "animate__animated animate__fadeOutLeft animate__faster",
          },
        },
        {
          path: "/forgot-password",
          name: "forgot-password",
          component: () => import("../components/auth/ForgotPassword.vue"),
          meta: {
            enter: "animate__animated animate__fadeInRight",
            leave: "animate__animated animate__fadeOutLeft animate__faster",
          },
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("../views/NotFoundView.vue"),
      meta: { requiresAuth: false },
    },
  ],
});

router.beforeEach(async (to) => {
  const token = localStorage.getItem("token");
  if (to.meta.requiresAuth && !token && to.name !== "login") {
    return { name: "login" };
  }
  if (!to.meta.requiresAuth && token && to.name !== "home") {
    return { name: "home" };
  }
});

export default router;
