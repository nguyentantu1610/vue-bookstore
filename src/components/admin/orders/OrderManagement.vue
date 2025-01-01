<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { storeToRefs } from "pinia";
import { useOrdersStore } from "@/stores/order";
import type Order from "@/interfaces/order";

const { getOrders, exportData } = useOrdersStore();
const { results } = storeToRefs(useOrdersStore());
// Init data
const orders = ref<Array<Order> | null>(new Array<Order>(2));
const searchQuery = ref<string>("");
const totalPages = ref<number>(0);
const page = ref<number>(0);
const expandedRows = ref({});

// Get data from server
async function getData() {
  orders.value = new Array<Order>(2);
  totalPages.value = 0;
  await getOrders(
    `/api/admin/orders?page=${page.value / 2 + 1}&search_query=${
      searchQuery.value
    }`
  );
  setTimeout(() => {
    if (results.value) {
      orders.value = results.value.data;
      totalPages.value = results.value.total;
    } else if (page.value != 0) {
      page.value = 0;
    } else {
      orders.value = null;
    }
  }, 1000);
}

// Watch page and search query change
const watcher = watchEffect(async () => await getData());
</script>

<template>
  <div class="pt-6 pl-10 pr-10 overflow-auto basis-4/5">
    <h1 class="text-3xl font-medium mb-6">Danh Sách Đơn Đặt Hàng</h1>
    <Toolbar class="mb-6">
      <template #start>
        <Button
          label="Xuất file"
          icon="pi pi-upload"
          severity="secondary"
          @click="exportData"
        />
      </template>
    </Toolbar>
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
          <Button icon="pi pi-refresh" rounded raised @click="getData" />
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
      <template #empty> Không tìm thấy đơn đặt hàng trong CSDL. </template>
    </DataTable>
  </div>
</template>
