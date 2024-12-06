<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref } from 'vue'

// const route = useRoute()
const email = ref('')
const password = ref('')
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
                <h1 class="text-center">Đăng nhập</h1>
            </template>
            <template #content>
                <div class="w-11/12 ml-5">
                    <div class="my-4">
                        <FloatLabel variant="on">
                            <InputText id="email" fluid autofocus v-model="email" :disabled="loading" />
                            <label for="email">Email</label>
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
                        <Button label="Đăng nhập" fluid :loading="loading" @click="load" />
                    </div>
                    <div class="my-4 text-center">
                        <RouterLink to="/forgot-password">Quên mật khẩu?</RouterLink>
                    </div>
                    <hr />
                    <div class="my-4">
                        <Button as="router-link" label="Đăng ký" to="/register" fluid severity="contrast"
                            variant="outlined" />
                    </div>
                </div>
            </template>
        </Card>
    </div>
</template>
