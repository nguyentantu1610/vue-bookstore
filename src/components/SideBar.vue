<script setup>
import { ref } from "vue";

const items = ref([
  {
    label: "Hợp tác",
    items: [
      {
        label: "Khách hàng",
        icon: "pi pi-users",
        route: "/admin/users",
      },
      {
        label: "Nhà cung cấp",
        icon: "pi pi-building",
        route: "/admin/suppliers",
      },
    ],
  },
  {
    label: "Sản phẩm",
    items: [
      {
        label: "Danh mục",
        icon: "pi pi-tag",
        route: "/admin/categories",
      },
    ],
  },
]);
</script>

<template>
  <Menu :model="items" class="pt-4 pl-10 pr-5 basis-80 overflow-x-auto">
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
