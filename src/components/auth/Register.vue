<script setup lang="ts">
import { onUnmounted, ref } from "vue";
import type Auth from "@/interfaces/auth";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";

const formData = ref<Auth>({
  email: "",
  verification_code: "",
  password: "",
  password_confirmation: "",
});
const btnLabel = ref<string>("Gửi mã");
const { authErrors } = storeToRefs(useAuthStore());
const { auth, $reset } = useAuthStore();
const loading = ref<boolean>(false);
const btnLoading = ref<boolean>(false);

async function register() {
  loading.value = true;
  await auth("/api/register", formData.value);
  loading.value = false;
}

async function sendVerificationCode() {
  let time: number = 0;
  btnLoading.value = true;
  btnLabel.value = "Gửi lại 5s";
  let countDown = setInterval(() => {
    btnLabel.value = `Gửi lại ${4 - time++}s`;
    if (time === 5) {
      btnLoading.value = false;
      btnLabel.value = "Gửi mã";
      clearInterval(countDown);
    }
  }, 1000);
  await auth("/api/send-register-code", formData.value);
}

onUnmounted(() => $reset());
</script>

<template>
  <Card v-focustrap class="basis-2/3 xl:basis-1/4 lg:basis-1/3 md:basis-2/5">
    <template #title><h1 class="text-center">Đăng ký</h1></template>
    <template #content>
      <form @submit.prevent="register" class="w-11/12 ml-5 my-4 space-y-4">
        <div>
          <FloatLabel variant="on">
            <InputGroup>
              <InputText
                type="email"
                id="email"
                autofocus
                maxlength="50"
                v-model="formData.email"
                :invalid="
                  authErrors.email !== '' && authErrors.email !== undefined
                "
                :disabled="loading"
              />
              <label for="email">Email</label>
              <InputGroupAddon>
                <Button
                  type="button"
                  :label="btnLabel"
                  :loading="btnLoading"
                  @click="sendVerificationCode"
                />
              </InputGroupAddon>
            </InputGroup>
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
            <InputText
              id="verification-code"
              fluid
              maxlength="6"
              v-model="formData.verification_code"
              :invalid="
                authErrors.verification_code !== '' &&
                authErrors.verification_code !== undefined
              "
              :disabled="loading"
            />
            <label for="verification-code">Mã xác minh</label>
          </FloatLabel>
          <Message
            v-if="authErrors.verification_code"
            size="small"
            severity="error"
            variant="simple"
          >
            {{ authErrors.verification_code[0] }}
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
                authErrors.password !== '' && authErrors.password !== undefined
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
          <FloatLabel variant="on">
            <Password
              id="confirmation-password"
              fluid
              toggleMask
              maxlength="50"
              :invalid="
                authErrors.password_confirmation !== '' &&
                authErrors.password_confirmation !== undefined
              "
              v-model="formData.password_confirmation"
              :disabled="loading"
            />
            <label for="confirmation-password">Nhập lại mật khẩu</label>
          </FloatLabel>
        </div>
        <div>
          <Button type="submit" label="Đăng ký" fluid :loading="loading" />
        </div>
        <Divider><b>OR</b></Divider>
        <div class="text-center">
          Đã có tài khoản?
          <RouterLink :to="{ name: 'login' }" class="text-zinc-950 font-medium">
            Đăng nhập
          </RouterLink>
        </div>
      </form>
    </template>
  </Card>
</template>
