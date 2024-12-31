<script setup lang="ts">
import { useUsersStore } from "@/stores/users";
import Header from "../Header.vue";
import { storeToRefs } from "pinia";
import type User from "@/interfaces/user";
import { onMounted, ref } from "vue";

const { getUsers, $reset, updateUser } = useUsersStore();
const { results, userErrors } = storeToRefs(useUsersStore());
// Init data
const formData = ref<User>({
  id: "",
  name: "",
  email: "",
  email_verified_at: "",
  password_reseted_at: "",
  address: "",
  phone_number: "",
  deleted_at: "",
});
const loading = ref<boolean>(false);

// Get user information from server
onMounted(async () => {
  $reset();
  await getUsers("/api/user/show");
  results.value ? (formData.value = results.value) : "";
});

// Handle create/update supplier
async function handleSubmitForm() {
  loading.value = true;
  await updateUser("/api/user/update-profile", formData.value);
  loading.value = false;
}
</script>

<template>
  <Header />
  <main class="mt-14 bg-slate-50 dark:bg-zinc-950">
    <div class="flex flex-row">
      <div class="mt-8 basis-1/3 pl-10">
        <Card>
          <template #title>Thông Tin Người Dùng</template>
          <template #content>
            <form
              v-focustrap
              @submit.prevent="handleSubmitForm"
              class="flex flex-col mt-3 gap-6 items-center"
            >
              <Message>
                Mật khẩu thay đổi lần cuối lúc
                {{ formData.password_reseted_at }}
              </Message>
              <div class="w-2/3">
                <FloatLabel variant="on">
                  <InputText
                    type="text"
                    id="email"
                    fluid
                    maxlength="50"
                    readonly
                    v-model="formData.email"
                  />
                  <label for="email">Email</label>
                </FloatLabel>
                <Message size="small" severity="secondary" variant="simple">
                  Đã xác minh lúc {{ formData.email_verified_at }}
                </Message>
              </div>
              <div class="w-2/3">
                <FloatLabel variant="on">
                  <InputText
                    type="text"
                    id="name"
                    fluid
                    maxlength="50"
                    v-model="formData.name"
                    :invalid="!!userErrors.name"
                    :disabled="loading"
                  />
                  <label for="name">Tên người dùng</label>
                </FloatLabel>
                <Message
                  v-if="userErrors.name"
                  size="small"
                  severity="error"
                  variant="simple"
                >
                  {{ userErrors.name[0] }}
                </Message>
              </div>
              <div class="w-2/3">
                <FloatLabel variant="on">
                  <InputMask
                    id="phone-number"
                    fluid
                    v-model="formData.phone_number"
                    mask="0999999999"
                    :invalid="!!userErrors.phone_number"
                    :disabled="loading"
                  />
                  <label for="phone-number">Số điện thoại</label>
                </FloatLabel>
                <Message
                  v-if="userErrors.phone_number"
                  size="small"
                  severity="error"
                  variant="simple"
                >
                  {{ userErrors.phone_number[0] }}
                </Message>
              </div>
              <div class="w-2/3">
                <FloatLabel variant="on">
                  <InputText
                    type="text"
                    id="address"
                    fluid
                    maxlength="255"
                    v-model="formData.address"
                    :invalid="!!userErrors.address"
                    :disabled="loading"
                  />
                  <label for="address">Địa chỉ</label>
                </FloatLabel>
                <Message
                  v-if="userErrors.address"
                  size="small"
                  severity="error"
                  variant="simple"
                >
                  {{ userErrors.address[0] }}
                </Message>
              </div>
              <div class="w-32">
                <Button type="submit" label="Cập nhật" :loading="loading"></Button>
              </div>
            </form>
          </template>
        </Card>
      </div>
    </div>
  </main>
</template>
