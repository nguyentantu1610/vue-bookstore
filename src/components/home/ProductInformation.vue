<script setup lang="ts">
import { useGetFetch } from "@/composables/custom-fetch";
import type Product from "@/interfaces/product";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
// Init data
const id = route.params.id ? route.params.id : null;
const product = ref<Product>();
const responsiveOptions = ref([
  {
    breakpoint: "1300px",
    numVisible: 4,
  },
  {
    breakpoint: "575px",
    numVisible: 1,
  },
]);
const isFullscreen = ref<boolean>(false);
const quantity = ref<number>(1);

// Check product exist in database
onMounted(async () => {
  if (id) {
    const headers = new Headers();
    headers.append("Accept", "application/json");
    const { data } = await useGetFetch(`/api/products/${id}`, headers);
    setTimeout(() => {
      data.data ? (product.value = data.data) : "";
    }, 4000);
  }
});
</script>

<template>
  <div class="flex flex-row overflow-auto">
    <div class="mt-10 mb-10 pl-32 basis-2/5">
      <Card class="py-2 max-h-hdv">
        <template #content>
          <div class="flex flex-col">
            <Galleria
              v-if="product"
              :visible="true"
              :value="product?.url?.split(',')"
              :responsiveOptions="responsiveOptions"
              :numVisible="4"
              :showItemNavigators="true"
              :fullScreen="isFullscreen"
              :containerClass="'!border-none basis-2/3'"
              :pt="{
                nextButton: { class: 'contrast-50 dark:contrast-200' },
                prevButton: { class: 'contrast-50 dark:contrast-200' },
                closeButton: { onclick: () => (isFullscreen = !isFullscreen) },
              }"
            >
              <template #item="slotProps">
                <img
                  :src="slotProps.item"
                  :alt="'Hello World~'"
                  class="rounded object-cover w-72 h-full shadow-lg"
                  @click="() => (isFullscreen = !isFullscreen)"
                />
              </template>
              <template #thumbnail="slotProps">
                <img
                  :src="slotProps.item"
                  alt="Hello World~"
                  class="rounded object-cover w-24 h-24"
                />
              </template>
            </Galleria>
            <div v-else class="place-items-center">
              <Skeleton width="5rem" height="20rem"></Skeleton>
            </div>
            <div class="basis-1/3">
              <div class="flex flex-row justify-center gap-4">
                <InputNumber
                  v-if="product"
                  v-model="quantity"
                  showButtons
                  buttonLayout="horizontal"
                  :min="1"
                  :max="99"
                  :pt="{
                    pcInputText: { root: { class: 'w-12' } },
                  }"
                >
                  <template #incrementbuttonicon>
                    <span class="pi pi-plus" />
                  </template>
                  <template #decrementbuttonicon>
                    <span class="pi pi-minus" />
                  </template>
                </InputNumber>
                <Skeleton v-else shape="circle" size="5rem"></Skeleton>
                <Button
                  v-if="product"
                  label="Thêm Giỏ Hàng"
                  icon="pi pi-shopping-cart"
                />
                <Skeleton v-else shape="circle" size="5rem"></Skeleton>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>
    <div class="mt-10 basis-3/5 pr-40 pl-4">
      <Card>
        <template #title>
          <span v-if="product">{{ product?.name }}</span>
          <Skeleton v-else></Skeleton>
        </template>
        <template #content>
          <div class="flex flex-row gap-6 mt-3">
            <p
              class="basis-3/5 whitespace-nowrap text-ellipsis overflow-hidden"
              v-if="product"
            >
              <span class="font-bold">Tác giả: </span>
              <span class="dark:text-zinc-400">{{ product?.author }}</span>
            </p>
            <Skeleton v-else width="20rem"></Skeleton>
            <p
              class="basis-2/5 whitespace-nowrap text-ellipsis overflow-hidden"
              v-if="product"
            >
              <span class="font-bold">Nhà xuất bản: </span>
              <span class="dark:text-zinc-400">
                {{ product?.publisher_name }}
              </span>
            </p>
            <Skeleton v-else width="20rem"></Skeleton>
          </div>
          <div class="flex flex-row gap-6 mt-2">
            <p
              class="basis-3/5 whitespace-nowrap text-ellipsis overflow-hidden"
              v-if="product"
            >
              <span class="font-bold">Người dịch: </span>
              <span class="dark:text-zinc-400">{{ product?.author }}</span>
            </p>
            <Skeleton v-else width="20rem"></Skeleton>
            <p
              class="basis-2/5 whitespace-nowrap text-ellipsis overflow-hidden"
              v-if="product"
            >
              <span class="font-bold">Nhà cung cấp: </span>
              <span class="dark:text-zinc-400">
                {{ (product as any)?.supplier_name }}
              </span>
            </p>
            <Skeleton v-else width="20rem"></Skeleton>
          </div>
          <div class="mt-2 font-bold">
            <InputNumber
              v-if="product"
              mode="currency"
              currency="VND"
              locale="vi-VN"
              fluid
              readonly
              :defaultValue="(product?.price as number)"
              :pt="{
                pcInputText: {
                  root: {
                    class:
                      '!border-none !text-2xl !p-0 !shadow-none !bg-inherit',
                  },
                },
              }"
            />
            <Skeleton v-else width="10rem" height="2rem"></Skeleton>
          </div>
        </template>
      </Card>
      <Card class="mt-3">
        <template #title>
          <p v-if="product" class="text-lg">Thông Tin Chi Tiết</p>
          <Skeleton v-else></Skeleton>
        </template>
        <template #content>
          <div class="flex flex-col gap-2 mt-3">
            <p
              class="basis-3/5 whitespace-nowrap text-ellipsis overflow-hidden"
              v-if="product"
            >
              <span class="font-bold">Năm xuất bản: </span>
              <span class="dark:text-zinc-400">
                {{ product?.publish_year }}
              </span>
            </p>
            <Skeleton v-else width="20rem"></Skeleton>
            <p
              class="basis-3/5 whitespace-nowrap text-ellipsis overflow-hidden"
              v-if="product"
            >
              <span class="font-bold">Khối lượng: </span>
              <span class="dark:text-zinc-400">{{ product?.weight }} (gr)</span>
            </p>
            <Skeleton v-else width="20rem"></Skeleton>
            <p
              class="basis-3/5 whitespace-nowrap text-ellipsis overflow-hidden"
              v-if="product"
            >
              <span class="font-bold">Bìa: </span>
              <span class="dark:text-zinc-400">{{ product?.cover_size }}</span>
            </p>
            <Skeleton v-else width="20rem"></Skeleton>
            <p
              class="basis-3/5 whitespace-nowrap text-ellipsis overflow-hidden"
              v-if="product"
            >
              <span class="font-bold">Số trang: </span>
              <span class="dark:text-zinc-400">{{ product?.pages }}</span>
            </p>
            <Skeleton v-else width="20rem"></Skeleton>
          </div>
        </template>
      </Card>
      <Card class="mt-3">
        <template #title>
          <p class="text-lg" v-if="product">Mô Tả Sản Phẩm</p>
          <Skeleton v-else></Skeleton>
        </template>
        <template #content>
          <ScrollPanel class="h-36">
            <p class="dark:text-zinc-400 pt-3" v-if="product">
              {{ product?.description }}
            </p>
            <div v-else class="pt-3">
              <Skeleton height="4rem" borderRadius="16px"></Skeleton>
            </div>
          </ScrollPanel>
        </template>
      </Card>
    </div>
  </div>
</template>
