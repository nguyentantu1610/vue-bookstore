<script setup lang="ts">
import { useCartStore } from "@/stores/cart";
import Header from "../Header.vue";
import type User from "@/interfaces/user";
import { useUsersStore } from "@/stores/users";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";

const { getUsers } = useUsersStore();
const { results } = storeToRefs(useUsersStore());
const { createOrder } = useCartStore();
const { carts } = storeToRefs(useCartStore());
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
const isValid = ref<boolean>(true);

// Calculate order price
const totalPrice = () => {
  let total = 0;
  carts.value.length
    ? Array.from(carts.value).forEach(
        (cart) => (total += cart.quantity * cart.price)
      )
    : "";
  return total;
};

// Get user information from server
onMounted(async () => {
  await getUsers("/api/user/show");
  results.value ? (formData.value = results.value) : "";
  formData.value.name && formData.value.address && formData.value.phone_number
    ? (isValid.value = true)
    : (isValid.value = false);
});
</script>
<template>
  <Header />
  <main class="mt-16 bg-slate-50 dark:bg-zinc-950">
    <Message v-if="!isValid" severity="warn">
      Vui lòng cập nhật tên người nhận, địa chỉ và số điện thoại để đặt hàng
    </Message>
    <div class="flex flex-row">
      <div class="basis-5/12 pl-32 mt-8">
        <Card>
          <template #title>Thông Tin Người Nhận</template>
          <template #content>
            <div class="flex flex-col mt-3 gap-6">
              <div class="w-2/3">
                <span class="font-bold">Email: </span>
                <span class="dark:text-zinc-400 ml-2">
                  {{ formData.email }}
                </span>
              </div>
              <div class="w-2/3">
                <span class="font-bold">Tên người nhận: </span>
                <span class="dark:text-zinc-400 ml-2">{{ formData.name }}</span>
              </div>
              <div class="w-2/3">
                <span class="font-bold">Số điện thoại: </span>
                <span class="dark:text-zinc-400 ml-2">
                  {{ formData.phone_number }}
                </span>
              </div>
              <div class="w-2/3">
                <span class="font-bold">Địa chỉ: </span>
                <span class="dark:text-zinc-400 ml-2">
                  {{ formData.address }}
                </span>
              </div>
              <Button
                as="router-link"
                :to="{ name: 'profile' }"
                label="Cập nhật"
                class="w-32 place-self-center"
              ></Button>
            </div>
          </template>
        </Card>
      </div>
      <div class="basis-1/2 pl-6 pr-32 mt-8">
        <Card>
          <template #title>Đơn Đặt Hàng</template>
          <template #content>
            <DataTable
              :value="carts"
              scrollable
              scrollHeight="500px"
              tableStyle="min-width: 50rem"
              class="mt-3 overflow-x-hidden"
            >
              <Column field="url" header="Hình ảnh" class="w-28">
                <template #body="{ data }">
                  <img
                    :src="
                      data.url ? data.url.split(',')[0] : '/default_image.png'
                    "
                    :alt="data.name"
                    class="w-16 rounded object-cover h-24"
                  />
                </template>
              </Column>
              <Column field="name" header="Tên" class="max-w-40">
                <template #body="{ data }">
                  <p class="whitespace-nowrap text-ellipsis overflow-hidden">
                    {{ data.name }}
                  </p>
                </template>
              </Column>
              <Column field="price" header="Giá" class="max-w-16">
                <template #body="{ data }">
                  {{
                    data.price.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })
                  }}
                </template>
              </Column>
              <Column field="quantity" header="Số lượng" class="max-w-16">
                <template #body="{ data }">
                  {{ data.quantity }} quyển
                </template>
              </Column>
              <template #footer>
                <div class="flex items-center">
                  <p>Tổng cộng {{ carts.length }} sản phẩm</p>
                  <p class="flex items-center justify-end gap-2 grow">
                    <span class="font-bold text-2xl">Thành tiền: </span>
                    {{
                      totalPrice().toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })
                    }}
                  </p>
                </div>
              </template>
              <template #empty>
                Không có sản phẩm nào trong giỏ hàng.
              </template>
            </DataTable>
          </template>
          <template #footer>
            <Button
              label="Đặt Hàng"
              class="w-full"
              :disabled="!isValid || !carts.length"
              @click="createOrder"
            ></Button>
          </template>
        </Card>
      </div>
    </div>
  </main>
</template>
