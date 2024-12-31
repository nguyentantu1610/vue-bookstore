<script setup lang="ts">
import { useGetFetch } from "@/composables/custom-fetch";
import type Product from "@/interfaces/product";
import router from "@/router";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";

const { isAdmin, name } = storeToRefs(useAuthStore());
const { logout } = useAuthStore();
const { carts } = storeToRefs(useCartStore());
// Init data
const path = computed<string>(() => (isAdmin.value ? "admin" : "home"));
const isDarkMode = ref<boolean>(false);
const tieredMenu = ref();
const tieredMenuItems = ref([
  {
    label: "Tài khoản",
    icon: "pi pi-cog",
    url: "/login",
  },
  {
    label: "Đăng xuất",
    icon: "pi pi-sign-out",
    command: () => logout(),
  },
]);
const items = ref<Array<Product> | undefined>();
const isLoading = ref<boolean>(false);
const search_query = ref<string>("");

// Show tiered menu
const toggle = (event: Event) => {
  tieredMenu.value.toggle(event);
};

// Change light/dark mode
function toggleDarkMode() {
  document.documentElement.classList.toggle("dark");
}

// Handle search products
async function search(event: any) {
  isLoading.value = true;
  const headers = new Headers();
  headers.append("Accept", "application/json");
  const { data, status } = await useGetFetch(
    `/api/products/search?search_query=${event.query}`,
    headers
  );
  setTimeout(() => {
    status >= 200 && status <= 299
      ? (items.value = data.data)
      : (items.value = undefined);
    isLoading.value = false;
  }, 1000);
}

// Go to product information
const onSelect = (event: any) =>
  typeof search_query.value === "object"
    ? router.push({
        name: "product-infor",
        params: { id: event.value.product_id },
      })
    : "";

// Go to product filter
const openFilter = () =>
  typeof search_query.value === "string"
    ? router.push({
        name: "product-filter",
        params: { name: search_query.value },
      })
    : "";

// Go to carts
const enterCart = () => router.push({ name: "carts" });
</script>

<template>
  <header class="fixed top-0 right-0 left-0 z-50">
    <Toolbar>
      <template #start>
        <a
          :href="`http://localhost:5173/${path}`"
          class="flex items-center justify-center"
        >
          <Avatar image="/menu-icon.png" class="mr-2" size="normal" />
          Bookstore
        </a>
      </template>
      <template #center>
        <div
          class="flex items-center justify-center md:block hidden"
          style="width: 28rem"
        >
          <InputGroup class="basis-5/6" v-if="!isAdmin">
            <AutoComplete
              v-model="search_query"
              placeholder="Tìm kiếm"
              class="w-full"
              optionLabel="name"
              :loading="isLoading"
              :pt="{
                loader: { style: 'z-index: 2;' },
                listContainer: { class: '!max-h-96' },
              }"
              :suggestions="items"
              @complete="search"
              @option-select="onSelect"
              @keyup.enter="openFilter"
            >
              <template #option="slotProps">
                <RouterLink
                  :to="{
                    name: 'product-infor',
                    params: { id: slotProps.option.product_id },
                  }"
                >
                  <div class="flex items-center gap-2">
                    <img
                      :alt="slotProps.option.name"
                      :src="
                        slotProps.option.url
                          ? slotProps.option.url.split(',')[0]
                          : '/default_image.png'
                      "
                      class="w-16 h-18 object-cover rounded"
                    />
                    <div
                      class="whitespace-nowrap text-ellipsis w-80 overflow-hidden"
                    >
                      {{ slotProps.option.name }}
                    </div>
                  </div>
                </RouterLink>
              </template>
              <template #header>
                <div class="font-medium px-3 py-2">Sản Phẩm Phù Hợp</div>
              </template>
              <template #empty>Không Có.</template>
            </AutoComplete>
            <InputGroupAddon>
              <InputIcon class="pi pi-search" />
            </InputGroupAddon>
          </InputGroup>
        </div>
      </template>
      <template #end>
        <div class="flex items-center gap-6">
          <OverlayBadge
            :value="carts.length"
            size="small"
            class="cursor-pointer"
            v-if="!isAdmin"
            @click="enterCart"
          >
            <i class="pi pi-shopping-cart" style="font-size: 1.4rem" />
          </OverlayBadge>
          <ToggleSwitch v-model="isDarkMode" @click="toggleDarkMode">
            <template #handle="{ checked }">
              <i
                :class="[
                  '!text-xs pi',
                  { 'pi-sun': !checked, 'pi-moon': checked },
                ]"
              />
            </template>
          </ToggleSwitch>
          <Button
            type="button"
            icon="pi pi-user"
            variant="text"
            :label="name"
            @click="toggle"
            aria-haspopup="true"
            aria-controls="overlay_tmenu"
            v-if="name"
          />
          <Button
            as="router-link"
            variant="outlined"
            severity="contrast"
            label="Đăng nhập"
            :to="{ name: 'login' }"
            v-else
          />
          <TieredMenu
            ref="tieredMenu"
            id="overlay_tmenu"
            :model="tieredMenuItems"
            popup
          />
        </div>
      </template>
    </Toolbar>
  </header>
</template>
