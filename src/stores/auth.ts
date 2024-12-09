import type Auth from "@/interfaces/Auth";
import router from "@/router";
import { defineStore } from "pinia";
import { useToast } from "primevue";
import { ref } from "vue";

export const useAuthStore = defineStore('auth', () => {
    const name = ref<string>('')
    const errors = ref<Auth>({
        email: '',
        verificationCode: '',
        password: '',
        passwordConfirmation: ''
    })
    const toast = useToast();

    function $reset() {
        errors.value.email = ''
        errors.value.verificationCode = ''
        errors.value.password = ''
        errors.value.passwordConfirmation = ''
    }

    // Login/Register/Forgot Password
    async function auth(uri: string, formData: Auth) {
        try {
            $reset()
            const response = await fetch(uri, {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: { Accept: 'application/json' }
            })
            const contentType = response.headers.get("content-type")
            if (!contentType || !contentType.includes("application/json")) throw new TypeError("Expected JSON!")
            const data = await response.json();
            if (!response.ok) {
                if (response.status === 422) errors.value = data.errors;
                (() => toast.add({ severity: 'error', summary: 'Lỗi', detail: data.message, life: 3000 }))()
                throw new Error(data.message)
            }
            if (uri === '/api/login') {
                localStorage.setItem('token', data.data.token)
                name.value = data.data.name;
                (() => toast.add({ severity: 'success', summary: 'Thành công', detail: data.message, life: 5000 }))()
                router.push({ name: 'home' })
            }
        } catch (error) {
            console.error(error)
        }
    }

    async function getName() {
        try {
            const token = localStorage.getItem('token')
            if (token) {
                const response = await fetch('/api/user-name', {
                    headers: {
                        authorization: `Bearer ${token}`,
                        Accept: 'application/json'
                    }
                })
                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) throw new TypeError("Expected JSON!")
                const data = await response.json();
                if (!response.ok) throw new Error(data.message)
                name.value = data.data.name
            }
        } catch (error) {
            console.error(error)
        }
    }

    async function logout() {
        try {
            const token = localStorage.getItem('token')
            if (token) {
                const response = await fetch('/api/logout', {
                    method: 'DELETE',
                    headers: {
                        authorization: `Bearer ${token}`
                    }
                })
                if (!(response.status === 204)) {
                    (() => toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Đăng xuất thất bại', life: 3000 }))()
                    throw new Error(`Response status: ${response.status}`);
                }
                (() => toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đăng xuất thành công', life: 5000 }))()
                name.value = ''
                localStorage.removeItem('token')
                router.push('/login')
            }
        } catch (error) {
            console.error(error)
        }
    }

    return { name, errors, $reset, auth, getName, logout }
})
