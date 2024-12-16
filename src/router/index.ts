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
      redirect: { name: "login" },
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
      path: "/admin",
      name: "admin",
      component: () => import("../views/AdminView.vue"),
      meta: { requiresAdmin: true },
      children: [
        {
          path: "category",
          name: "category",
          component: () =>
            import("../components/admin/category/CategoryManagement.vue"),
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
  linkActiveClass: 'border-zinc-900 border-l-2',
  linkExactActiveClass: 'border-zinc-950 border-l-2',
});

router.beforeEach(async (to) => {
  const { checkUser } = useAuthStore();
  const { name, isAdmin } = storeToRefs(useAuthStore());

  await checkUser();
  if (
    !to.meta.requiresAuth &&
    name.value &&
    (to.name == "login" ||
      to.name == "register" ||
      to.name == "forgot-password")
  ) {
    return { name: "home" };
  }
  if (to.meta.requiresAuth && !name.value && to.name !== "login") {
    return { name: "login" };
  }
  if (to.meta.requiresAdmin && !isAdmin.value) {
    return { name: "NotFound" };
  }
  return true;
});

export default router;
