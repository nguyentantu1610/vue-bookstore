<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref } from 'vue'

const route = useRoute()
const email = ref('')
const verificationCode = ref('')
const password = ref('')
const confirmationPassword = ref('')
const loading = ref(false)

const load = () => {
    loading.value = true;
    setTimeout(() => {
        loading.value = false;
    }, 2000);
};
</script>

<template>
    <div id="my-div" class="flex justify-center items-center bg-zinc-900" style="height: 90vh;">
        <Card v-focustrap class="basis-2/3 xl:basis-1/4 lg:basis-1/3 md:basis-2/5">
            <template #title>
                <h1 class="text-center">Đăng ký</h1>
            </template>
            <template #content>
                <div class="w-11/12 ml-5">
                    <div class="my-4">
                        <FloatLabel variant="on">
                            <InputGroup>
                                <InputText id="email" autofocus v-model="email" :disabled="loading" />
                                <label for="email">Email</label>
                                <InputGroupAddon>
                                    <button>Gửi mã</button>
                                </InputGroupAddon>
                            </InputGroup>
                        </FloatLabel>
                        <!-- <Message size="small" severity="error" variant="simple">
                        Enter your username to reset your password.
                    </Message> -->
                    </div>
                    <div class="my-4">
                        <FloatLabel variant="on">
                            <InputText id="verification-code" fluid v-model="verificationCode" :disabled="loading" />
                            <label for="verification-code">Mã xác minh</label>
                        </FloatLabel>
                        <!-- <Message size="small" severity="error" variant="simple">
                        Enter your username to reset your password.
                    </Message> -->
                    </div>
                    <div class="my-4">
                        <FloatLabel variant="on">
                            <Password id="password" fluid toggleMask v-model="password" :disabled="loading" />
                            <label for="password">Mật khẩu</label>
                        </FloatLabel>
                        <!-- <Message size="small" severity="error" variant="simple">
                        Enter your username to reset your password.
                    </Message> -->
                    </div>
                    <div class="my-4">
                        <FloatLabel variant="on">
                            <Password id="confirmation-password" fluid toggleMask v-model="confirmationPassword"
                                :disabled="loading" />
                            <label for="confirmation-password">Nhập lại mật khẩu</label>
                        </FloatLabel>
                        <!-- <Message size="small" severity="error" variant="simple">
                        Enter your username to reset your password.
                    </Message> -->
                    </div>
                    <div class="my-4">
                        <Button label="Đăng ký" fluid :loading="loading" @click="load" />
                    </div>
                    <hr />
                    <div class="my-4 text-center">
                        Đã có tài khoản? <RouterLink to="/login" class="text-zinc-950 font-medium">Đăng nhập</RouterLink>
                    </div>
                </div>
            </template>
        </Card>
    </div>
</template>
