<script setup lang="ts">
import { ref } from 'vue'

const formData = ref({
    email: '',
    verificationCode: '',
    password: '',
    confirmationPassword: ''
})
const loading = ref(false)

const load = () => {
    loading.value = true;
    setTimeout(() => {
        loading.value = false;
    }, 2000);
};
</script>

<template>
    <div id="my-div" class="flex justify-center items-center" style="height: 90vh;">
        <Card v-focustrap class="basis-2/3 xl:basis-1/4 lg:basis-1/3 md:basis-2/5">
            <template #title>
                <h1 class="text-center">Đăng ký</h1>
            </template>
            <template #content>
                <form @submit.prevent="load" class="w-11/12 ml-5 my-4 space-y-4">
                    <div>
                        <FloatLabel variant="on">
                            <InputGroup>
                                <InputText id="email" autofocus v-model="formData.email" :disabled="loading" />
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
                    <div>
                        <FloatLabel variant="on">
                            <InputText id="verification-code" fluid v-model="formData.verificationCode"
                                :disabled="loading" />
                            <label for="verification-code">Mã xác minh</label>
                        </FloatLabel>
                        <!-- <Message size="small" severity="error" variant="simple">
                        Enter your username to reset your password.
                    </Message> -->
                    </div>
                    <div>
                        <FloatLabel variant="on">
                            <Password id="password" fluid toggleMask v-model="formData.password" :disabled="loading" />
                            <label for="password">Mật khẩu</label>
                        </FloatLabel>
                        <!-- <Message size="small" severity="error" variant="simple">
                        Enter your username to reset your password.
                    </Message> -->
                    </div>
                    <div>
                        <FloatLabel variant="on">
                            <Password id="confirmation-password" fluid toggleMask
                                v-model="formData.confirmationPassword" :disabled="loading" />
                            <label for="confirmation-password">Nhập lại mật khẩu</label>
                        </FloatLabel>
                        <!-- <Message size="small" severity="error" variant="simple">
                        Enter your username to reset your password.
                    </Message> -->
                    </div>
                    <div>
                        <Button type="submit" label="Đăng ký" fluid :loading="loading" />
                    </div>
                    <hr />
                    <div class="text-center">
                        Đã có tài khoản? <RouterLink to="/login" class="text-zinc-950 font-medium">Đăng nhập
                        </RouterLink>
                    </div>
                </form>
            </template>
        </Card>
    </div>
</template>
