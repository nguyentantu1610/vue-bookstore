<script setup lang="ts">
import { useGetFetch } from "@/composables/custom-fetch";
import { useCartStore } from "@/stores/cart";
import { Card } from "primevue";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const { setCart } = useCartStore();
// Init data
const name = computed<string>(() =>
  route.params.name ? (route.params.name as string) : ""
);
const products = ref();
const sortType = ref<boolean>(false);
const categories = ref();
const suppliers = ref();
const categoriesChosen = ref();
const suppliersChosen = ref();
const min = ref<number>(1);
const max = ref<number>(200000);
const years = ref();
const suppliersLoading = ref<boolean>(false);
const categoriesLoading = ref<boolean>(false);
const productsLoading = ref<boolean>(false);
const totalPages = ref<number>(0);
const page = ref<number>(0);

// Get data from server
async function getData(uri: string) {
  const headers = new Headers();
  headers.append("Accept", "application/json");
  const { data, status } = await useGetFetch(uri, headers);
  return status >= 200 && status <= 299 ? data.data : null;
}

// Handle get supplier from server
async function getSuppliers() {
  suppliersLoading.value = true;
  const data = await getData("/api/suppliers/list");
  setTimeout(() => {
    suppliers.value = data;
    suppliersLoading.value = false;
  }, 1000);
}

// Handle get category from server
async function getCategories() {
  categoriesLoading.value = true;
  const data = await getData("/api/categories/list");
  setTimeout(() => {
    categories.value = data;
    categoriesLoading.value = false;
  }, 1000);
}

// Handle get products
async function getProducts() {
  // Reset data
  productsLoading.value = true;
  totalPages.value = 0;
  // Init data
  let categoriesStr: string = "";
  let suppliersStr: string = "";
  let yearsStr: string = "";
  // Convert categories to string
  categoriesChosen.value
    ? Array.from(categoriesChosen.value).forEach((category: any) => {
        categoriesStr += category.id + ",";
      })
    : "";
  // Convert suppliers to string
  suppliersChosen.value
    ? Array.from(suppliersChosen.value).forEach((supplier: any) => {
        suppliersStr += supplier.id + ",";
      })
    : "";
  // Convert year to string
  years.value
    ? Array.from(years.value).forEach((years: any) => {
        yearsStr += new Date(years).getFullYear().toString() + ",";
      })
    : "";
  const data = await getData(
    `/api/products?categories=${categoriesStr}&suppliers=${suppliersStr}&sort_type=${
      sortType.value ? "desc" : "asc"
    }&search_query=${name.value}&price=${min.value},${
      max.value
    }&year=${yearsStr}&page=${page.value / 4 + 1}`
  );
  setTimeout(async () => {
    if (data) {
      products.value = data.data;
      totalPages.value = data.total;
    } else if (page.value !== 0) {
      page.value = 0;
      await getProducts();
    } else {
      products.value = null;
    }
    productsLoading.value = false;
  }, 1000);
}

// Watch params name
watch(
  () => name.value + page.value.toString(),
  async () => await getProducts(),
  { immediate: true }
);

// Advanced search for products
const advancedSearch = async () => await getProducts();
</script>

<template>
  <div class="flex flex-col items-center">
    <Card class="w-5/6 mt-8">
      <template #title><i class="pi pi-filter-slash" /> Bộ Lọc</template>
      <template #content>
        <div class="flex flex-row gap-4 mb-6 mt-6">
          <FloatLabel variant="on" class="basis-1/5">
            <MultiSelect
              inputId="suppliers"
              fluid
              checkmark
              :highlightOnSelect="false"
              filter
              display="chip"
              :pt="{
                labelContainer: { class: 'w-52' },
                pcChip: {
                  label: {
                    class:
                      'w-14 whitespace-nowrap text-ellipsis overflow-hidden',
                  },
                },
                overlay: { class: 'w-60' },
              }"
              v-model="suppliersChosen"
              :options="suppliers"
              optionLabel="supplier_name"
              :loading="suppliersLoading"
              :disabled="productsLoading"
              @click.once="getSuppliers"
            >
              <template #option="slotProps">
                <div
                  class="whitespace-nowrap text-ellipsis w-48 overflow-hidden"
                >
                  {{ slotProps.option.supplier_name }}
                </div>
              </template>
              <template #dropdownicon>
                <i class="pi pi-building" />
              </template>
              <template #header>
                <div class="font-medium p-3">Danh sách nhà cung cấp</div>
              </template>
              <template #empty> Không tìm thấy. </template>
            </MultiSelect>
            <label for="suppliers">
              {{ suppliersLoading ? "Đang tải..." : "Tên nhà cung cấp" }}
            </label>
          </FloatLabel>
          <FloatLabel variant="on" class="basis-1/5">
            <MultiSelect
              inputId="categories"
              fluid
              checkmark
              :highlightOnSelect="false"
              filter
              display="chip"
              :pt="{
                labelContainer: { class: 'w-52' },
                pcChip: {
                  label: {
                    class:
                      'w-14 whitespace-nowrap text-ellipsis overflow-hidden',
                  },
                },
                overlay: { class: 'w-60' },
              }"
              v-model="categoriesChosen"
              :options="categories"
              optionLabel="name"
              :loading="categoriesLoading"
              :disabled="productsLoading"
              @click.once="getCategories"
            >
              <template #option="slotProps">
                <div
                  class="whitespace-nowrap text-ellipsis w-48 overflow-hidden"
                >
                  {{ slotProps.option.name }}
                </div>
              </template>
              <template #dropdownicon><i class="pi pi-tag" /></template>
              <template #header>
                <div class="font-medium p-3">Danh sách danh mục</div>
              </template>
              <template #empty> Không tìm thấy. </template>
            </MultiSelect>
            <label for="categories">
              {{ categoriesLoading ? "Đang tải..." : "Tên danh mục" }}
            </label>
          </FloatLabel>
          <FloatLabel variant="on" class="basis-1/6">
            <DatePicker
              id="year"
              showIcon
              fluid
              iconDisplay="input"
              showButtonBar
              v-model="years"
              view="year"
              dateFormat="yy"
              selectionMode="multiple"
              :disabled="productsLoading"
            />
            <label for="year">Năm xuất bản</label>
          </FloatLabel>
          <FloatLabel variant="on" class="basis-1/12">
            <InputNumber
              inputId="min"
              fluid
              :min="1"
              :max="1000000"
              mode="currency"
              currency="VND"
              locale="vi-VN"
              v-model="min"
              :disabled="productsLoading"
            />
            <label for="min">Giá tối thiểu</label>
          </FloatLabel>
          <FloatLabel variant="on" class="basis-1/12">
            <InputNumber
              inputId="max"
              fluid
              :min="1"
              :max="1000000"
              mode="currency"
              currency="VND"
              locale="vi-VN"
              v-model="max"
              :disabled="productsLoading"
            />
            <label for="max">Giá tối đa</label>
          </FloatLabel>
          <ToggleButton
            v-model="sortType"
            onLabel="Z-A"
            offLabel="A-Z"
            onIcon="pi pi-sort-amount-down"
            offIcon="pi pi-sort-amount-up-alt"
            class="basis-1/12"
            :disabled="productsLoading"
          />
          <Button
            label="Lọc"
            class="basis-1/12"
            icon="pi pi-search"
            :loading="productsLoading"
            @click="advancedSearch"
          />
        </div>
      </template>
    </Card>
    <Card class="mt-3 w-5/6">
      <template #title>Sản Phẩm Phù Hợp</template>
      <template #content>
        <div v-if="productsLoading" class="w-full h-72 flex items-center">
          <ProgressSpinner class="h-36" />
        </div>
        <DataView
          data-key="2"
          :value="products"
          layout="grid"
          class="mt-3"
          v-else
        >
          <template #grid="slotProps">
            <div class="grid grid-cols-12 gap-4">
              <div
                v-for="(item, index) in slotProps.items"
                :key="index"
                class="col-span-12 sm:col-span-6 md:col-span-4 xl:col-span-3 p-2"
              >
                <div
                  class="p-6 border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 rounded flex flex-col"
                >
                  <div class="bg-surface-50 rounded flex justify-center p-4">
                    <RouterLink
                      :to="{
                        name: 'product-infor',
                        params: { id: item.product_id },
                      }"
                      class="flex flex-col"
                    >
                      <div class="relative mx-auto">
                        <img
                          class="rounded object-cover w-44 h-56"
                          :src="item.url.split(',')[0]"
                          :alt="item.name"
                        />
                      </div>
                      <div
                        class="text-lg font-medium whitespace-nowrap text-ellipsis w-60 overflow-hidden pt-6"
                        v-tooltip="item.name"
                      >
                        {{ item.name }}
                      </div>
                    </RouterLink>
                  </div>
                  <div class="flex justify-between items-center pt-3">
                    <div class="text-2xl font-semibold">
                      <p>
                        {{
                          item.price.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })
                        }}
                      </p>
                    </div>
                    <Button
                      icon="pi pi-shopping-cart"
                      @click="setCart(item)"
                    ></Button>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template #empty>Không có sản phẩm thoả điều kiện.</template>
        </DataView>
      </template>
      <template #footer>
        <Paginator
          v-model:first="page"
          :rows="4"
          :totalRecords="totalPages"
          class="h-12"
        ></Paginator>
      </template>
    </Card>
  </div>
</template>
