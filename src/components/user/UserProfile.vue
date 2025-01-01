<script setup lang="ts">
import { useUsersStore } from "@/stores/users";
import Header from "../Header.vue";
import { storeToRefs } from "pinia";
import type User from "@/interfaces/user";
import { onMounted, ref, watchEffect } from "vue";
import type Order from "@/interfaces/order";
import { useOrdersStore } from "@/stores/order";
import { useConfirm } from "primevue";

const { getUsers, $reset, updateUser } = useUsersStore();
const { userErrors } = storeToRefs(useUsersStore());
const { getOrders, deleteOrder } = useOrdersStore();
const { results } = storeToRefs(useOrdersStore());
const confirm = useConfirm();
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
const orders = ref<Array<Order> | null>(new Array<Order>(2));
const searchQuery = ref<string>("");
const totalPages = ref<number>(0);
const page = ref<number>(0);
const expandedRows = ref({});

// Get user information from server
onMounted(async () => {
  $reset();
  const { results } = storeToRefs(useUsersStore());
  await getUsers("/api/user/show");
  results.value ? (formData.value = results.value) : "";
});

// Handle update user
async function handleSubmitForm() {
  loading.value = true;
  await updateUser("/api/user/update-profile", formData.value);
  loading.value = false;
}

// Get user's orders from server
async function handleGetOrders() {
  orders.value = new Array<Order>(2);
  totalPages.value = 0;
  await getOrders(
    `/api/user/orders?page=${page.value / 2 + 1}&search_query=${
      searchQuery.value
    }`
  );
  setTimeout(() => {
    if (results.value) {
      orders.value = results.value.data;
      totalPages.value = results.value.total;
      console.log(orders.value);
    } else if (page.value != 0) {
      page.value = 0;
    } else {
      orders.value = null;
    }
  }, 1000);
}

// Watch page and search query change
const watcher = watchEffect(async () => await handleGetOrders());

// Delete order
const cancelOrder = (data: Order, event: any) => {
  confirm.require({
    target: event.currentTarget,
    message: "Bạn có chắc là muốn huỷ đơn đặt hàng này?",
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      label: "Huỷ",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Xác nhận",
      severity: "danger",
    },
    accept: async () => {
      await deleteOrder(`/api/user/orders/${data.id}`);
      await handleGetOrders();
    },
    reject: () => console.log(`xoá ${data.id} thất bại~`),
  });
};
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
                <Button
                  type="submit"
                  label="Cập nhật"
                  :loading="loading"
                ></Button>
              </div>
            </form>
          </template>
        </Card>
      </div>
      <div class="mt-8 basis-2/3 pl-6 pr-10">
        <Card>
          <template #title>Danh Sách Đơn Đặt Hàng</template>
          <template #content>
            <DataTable
              :value="orders"
              v-model:expandedRows="expandedRows"
              scrollable
              scrollHeight="400px"
              resizableColumns
              columnResizeMode="expand"
              dataKey="id"
              tableStyle="min-width: 50rem"
            >
              <template #header>
                <div class="flex items-center justify-end gap-2 grow">
                  <IconField>
                    <InputIcon><i class="pi pi-search" /></InputIcon>
                    <InputText placeholder="Tìm kiếm" v-model="searchQuery" />
                  </IconField>
                  <Button
                    icon="pi pi-refresh"
                    rounded
                    raised
                    @click="handleGetOrders"
                  />
                </div>
              </template>
              <Column expander style="width: 5rem" />
              <Column field="id" header="Mã đơn hàng">
                <template #body="{ data }">
                  <Skeleton v-if="!data"></Skeleton>
                  <p v-else class="max-w-52">{{ data.id }}</p>
                </template>
              </Column>
              <Column field="email" header="Người nhận">
                <template #body="{ data }">
                  <Skeleton v-if="!data"></Skeleton>
                  <p v-else class="max-w-52">{{ data.email }}</p>
                </template>
              </Column>
              <Column field="status" header="Tình trạng">
                <template #body="{ data }">
                  <Skeleton v-if="!data"></Skeleton>
                  <Tag
                    v-else
                    :value="!data.deleted_at ? data.status : 'Đã Huỷ'"
                    :severity="!data.deleted_at ? 'info' : 'danger'"
                  />
                </template>
              </Column>
              <Column field="created_at" header="Ngày tạo">
                <template #body="{ data }">
                  <Skeleton v-if="!data"></Skeleton>
                  <p v-else class="max-w-52">{{ data.created_at }}</p>
                </template>
              </Column>
              <Column field="updated_at" header="Ngày cập nhật">
                <template #body="{ data }">
                  <Skeleton v-if="!data"></Skeleton>
                  <p v-else class="max-w-52">{{ data.updated_at }}</p>
                </template>
              </Column>
              <Column class="w-24 space-x-2">
                <template #body="{ data }">
                  <Button
                    v-if="data"
                    icon="pi pi-trash"
                    severity="danger"
                    rounded
                    :disabled="data.deleted_at"
                    @click="cancelOrder(data, $event)"
                  ></Button>
                  <Skeleton v-else shape="circle" size="3rem"></Skeleton>
                </template>
              </Column>
              <template #expansion="{ data }">
                <div class="p-2">
                  <h5 class="font-bold text-base">Chi Tiết Hoá Đơn</h5>
                  <DataTable
                    v-if="data"
                    :value="JSON.parse(`[${data.product}]`)"
                    resizableColumns
                    columnResizeMode="expand"
                  >
                    <Column field="product_name" header="Tên sản phẩm">
                      <template #body="{ data }">
                        <p class="w-32">{{ data.product_name }}</p>
                      </template>
                    </Column>
                    <Column field="price" header="Giá">
                      <template #body="{ data }">
                        <p class="max-w-52">
                          {{
                            data.price.toLocaleString("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            })
                          }}
                        </p>
                      </template>
                    </Column>
                    <Column field="quantity" header="Số lượng">
                      <template #body="{ data }">
                        <p class="max-w-52">{{ data.quantity }}</p>
                      </template>
                    </Column>
                  </DataTable>
                </div>
              </template>
              <template #footer>
                <Paginator
                  v-model:first="page"
                  :rows="2"
                  :totalRecords="totalPages"
                  class="h-12"
                ></Paginator>
              </template>
              <template #empty>
                Không tìm thấy đơn đặt hàng trong CSDL.
              </template>
            </DataTable>
          </template>
        </Card>
      </div>
    </div>
  </main>
</template>
