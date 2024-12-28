<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";

const { isAdmin, name } = storeToRefs(useAuthStore());
const { logout } = useAuthStore();
// Init data
const path = computed<string>(() => (isAdmin.value ? "admin" : "home"));
const searchQuery = ref<string>("");
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

// Show tiered menu
const toggle = (event: Event) => {
  tieredMenu.value.toggle(event);
};

// Change light/dark mode
function toggleDarkMode() {
  document.documentElement.classList.toggle("dark");
}
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
        <div class="flex items-center justify-center md:block hidden" style="width: 28rem;">
          <IconField class="basis-5/6" v-if="!isAdmin">
            <InputIcon class="pi pi-search" />
            <InputText
              class="w-full"
              v-model="searchQuery"
              placeholder="Tìm kiếm"
            />
          </IconField>
        </div>
      </template>
      <template #end>
        <div class="flex items-center gap-4">
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
          <OverlayBadge value="2" size="small" v-if="name && !isAdmin">
            <i class="pi pi-shopping-cart" style="font-size: 1.5rem" />
          </OverlayBadge>
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
