<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";
import type Auth from "@/interfaces/auth";

const formData = ref<Auth>({
  email: "",
  password: "",
});
const { authErrors } = storeToRefs(useAuthStore());
const { auth, $reset } = useAuthStore();
const loading = ref<boolean>(false);

async function login() {
  loading.value = true;
  await auth("/api/login", formData.value);
  loading.value = false;
}

onMounted(() => $reset());
</script>

<template>
  <div
    class="flex justify-center items-center"
    style="height: 90vh"
  >
    <Card v-focustrap class="basis-2/3 xl:basis-1/4 lg:basis-1/3 md:basis-2/5">
      <template #title>
        <h1 class="text-center">Đăng nhập</h1>
      </template>
      <template #content>
        <form @submit.prevent="login" class="w-11/12 ml-5 my-4 space-y-4">
          <div>
            <FloatLabel variant="on">
              <InputText
                type="email"
                id="email"
                fluid
                autofocus
                maxlength="50"
                v-model="formData.email"
                :invalid="
                  authErrors.email !== '' && authErrors.email !== undefined
                "
                :disabled="loading"
              />
              <label for="email">Email</label>
            </FloatLabel>
            <Message
              v-if="authErrors.email"
              size="small"
              severity="error"
              variant="simple"
            >
              {{ authErrors.email[0] }}
            </Message>
          </div>
          <div>
            <FloatLabel variant="on">
              <Password
                id="password"
                fluid
                toggleMask
                maxlength="50"
                v-model="formData.password"
                :invalid="
                  authErrors.password !== '' &&
                  authErrors.password !== undefined
                "
                :disabled="loading"
              />
              <label for="password">Mật khẩu</label>
            </FloatLabel>
            <Message
              v-if="authErrors.password"
              size="small"
              severity="error"
              variant="simple"
            >
              {{ authErrors.password[0] }}
            </Message>
          </div>
          <div>
            <Button type="submit" label="Đăng nhập" fluid :loading="loading" />
          </div>
          <div class="text-center">
            <RouterLink :to="{ name: 'forgot-password' }">
              Quên mật khẩu?
            </RouterLink>
          </div>
          <hr />
          <div>
            <Button
              as="router-link"
              label="Đăng ký"
              :to="{ name: 'register' }"
              fluid
              severity="contrast"
              variant="outlined"
            />
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>
