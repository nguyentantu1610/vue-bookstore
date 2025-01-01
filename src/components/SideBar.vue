<script setup>
import { ref } from "vue";

const items = ref([
  {
    label: "Hợp Tác",
    items: [
      {
        label: "Khách Hàng",
        icon: "pi pi-users",
        route: "/admin/users",
      },
      {
        label: "Nhà Cung Cấp",
        icon: "pi pi-building",
        route: "/admin/suppliers",
      },
    ],
  },
  {
    label: "Sản Phẩm",
    items: [
      {
        label: "Danh Mục",
        icon: "pi pi-tag",
        route: "/admin/categories",
      },
      {
        label: "Sách",
        icon: "pi pi-book",
        route: "/admin/products",
      },
    ],
  },
  {
    label: "Đơn Hàng",
    items: [
      {
        label: "Đơn Đặt Hàng",
        icon: "pi pi-box",
        route: "/admin/orders",
      },
    ],
  },
]);
</script>

<template>
  <Menu :model="items" class="pt-4 pl-10 pr-5 basis-1/5 overflow-x-auto">
    <template #submenulabel="{ item }">
      <span class="text-primary font-bold">{{ item.label }}</span>
    </template>
    <template #item="{ item, props }">
      <router-link
        v-if="item.route"
        v-slot="{ href, navigate }"
        :to="item.route"
        custom
      >
        <router-link
          v-ripple
          :to="href"
          v-bind="props.action"
          @click="navigate"
        >
          <span :class="item.icon" />
          <span class="ml-2">{{ item.label }}</span>
        </router-link>
      </router-link>
    </template>
  </Menu>
</template>
