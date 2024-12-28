<script setup lang="ts">
import { onMounted, ref } from "vue";
import type Product from "@/interfaces/product";
import { useGetFetch } from "@/composables/custom-fetch";

// Init data
const responsiveOptions = ref([
  {
    breakpoint: "1600px",
    numVisible: 5,
    numScroll: 1,
  },
  {
    breakpoint: "1400px",
    numVisible: 4,
    numScroll: 1,
  },
  {
    breakpoint: "1199px",
    numVisible: 3,
    numScroll: 1,
  },
  {
    breakpoint: "950px",
    numVisible: 2,
    numScroll: 1,
  },
  {
    breakpoint: "700px",
    numVisible: 1,
    numScroll: 1,
  },
]);
const latestProducts = ref<Array<Product> | null>();
const novels = ref<Array<Product> | null>();
const mangas = ref<Array<Product> | null>();
const tabs = ref([
  { title: "Light Novel", content: novels, value: "0" },
  { title: "Manga", content: mangas, value: "1" },
]);

// Custom header
function customHeader(): Headers {
  const headers = new Headers();
  headers.append("Accept", "application/json");
  return headers;
}

// Handle load latest product
async function onLoadLatestProduct() {
  latestProducts.value = new Array<Product>(5);
  const { data, status } = await useGetFetch(
    "/api/latest-products",
    customHeader()
  );
  setTimeout(() => {
    status >= 200 && status <= 299
      ? (latestProducts.value = data.data)
      : (latestProducts.value = null);
  }, 1000);
}

// Handle load novels
async function onLoadNovels() {
  novels.value = new Array<Product>(5);
  const { data, status } = await useGetFetch(
    "/api/products/category/16",
    customHeader()
  );
  setTimeout(() => {
    status >= 200 && status <= 299
      ? (novels.value = data.data)
      : (novels.value = null);
  }, 1000);
}

// Handle load mangas
async function onLoadMangas() {
  mangas.value = new Array<Product>(5);
  const { data, status } = await useGetFetch(
    "/api/products/category/17",
    customHeader()
  );
  setTimeout(() => {
    status >= 200 && status <= 299
      ? (mangas.value = data.data)
      : (mangas.value = null);
  }, 1000);
}

function test() {
  console.log("Hello World~");
}

// onMounted(async () => await onLoadLatestProduct());
</script>

<template>
  <div class="flex flex-col items-center">
    <DeferredContent
      @load="onLoadLatestProduct"
      class="w-5/6"
      style="height: 29rem"
    >
      <Card>
        <template #title>Sản Phẩm Mới Nhất</template>
        <template #content>
          <Carousel
            :value="latestProducts"
            :numVisible="5"
            :numScroll="1"
            :responsiveOptions="responsiveOptions"
          >
            <template #item="slotProps">
              <div
                class="border border-surface-200 dark:border-surface-700 rounded m-2 p-4"
                style="height: 21rem"
              >
                <RouterLink
                  :to="{
                    name: 'product-infor',
                    params: {
                      id: slotProps.data ? slotProps.data.product_id : 'abc',
                    },
                  }"
                >
                  <div class="mb-4 flex justify-center">
                    <div class="relative mx-auto">
                      <Skeleton
                        width="10rem"
                        height="13rem"
                        v-if="!slotProps.data"
                      ></Skeleton>
                      <img
                        v-else
                        :src="
                          slotProps.data.url
                            ? slotProps.data.url.split(',')[0]
                            : '/default_image.png'
                        "
                        :alt="slotProps.data.name"
                        class="rounded object-cover w-full h-52"
                      />
                    </div>
                  </div>
                  <div
                    class="mb-4 font-medium whitespace-nowrap text-ellipsis w-44 overflow-hidden"
                    v-tooltip="
                      slotProps.data ? slotProps.data.name : 'Hello World~'
                    "
                  >
                    <Skeleton v-if="!slotProps.data"></Skeleton>
                    <span v-else>{{ slotProps.data.name }}</span>
                  </div>
                </RouterLink>
                <div class="flex justify-between items-center">
                  <div class="mt-0 font-semibold text-xl">
                    <Skeleton
                      height="2rem"
                      width="5rem"
                      v-if="!slotProps.data"
                    ></Skeleton>
                    <InputNumber
                      v-else
                      mode="currency"
                      currency="VND"
                      locale="vi-VN"
                      fluid
                      readonly
                      :defaultValue="(slotProps.data.price as number)"
                      :pt="{
                        pcInputText: {
                          root: { style: 'border-style: none' },
                        },
                      }"
                    />
                  </div>
                  <span>
                    <Skeleton v-if="!slotProps.data" size="3rem"></Skeleton>
                    <Button v-else icon="pi pi-shopping-cart" class="ml-2" />
                  </span>
                </div>
              </div>
            </template>
            <template #empty>Không Có Sản Phẩm Mới Nào</template>
          </Carousel>
        </template>
      </Card>
    </DeferredContent>
    <DeferredContent
      class="mt-16 w-5/6"
      style="height: 29rem"
      @load="onLoadNovels"
    >
      <Card>
        <template #content>
          <Tabs value="0">
            <TabList>
              <Tab
                v-for="tab in tabs"
                :key="tab.title"
                :value="tab.value"
                :pt="{
                  root: { onclick: tab.title === 'Manga' ? onLoadMangas : '' },
                }"
              >
                {{ tab.title }}
              </Tab>
            </TabList>
            <TabPanels style="height: 25rem">
              <TabPanel v-for="tab in tabs" :key="tab.title" :value="tab.value">
                <Carousel
                  :value="tab.content"
                  :numVisible="5"
                  :numScroll="1"
                  :responsiveOptions="responsiveOptions"
                >
                  <template #item="slotProps">
                    <div
                      class="border border-surface-200 dark:border-surface-700 rounded m-2 p-4"
                      style="height: 21rem"
                    >
                      <RouterLink
                        :to="{
                          name: 'product-infor',
                          params: {
                            id: slotProps.data
                              ? slotProps.data.product_id
                              : 'abc',
                          },
                        }"
                      >
                        <div class="mb-4 flex justify-center">
                          <div class="relative mx-auto">
                            <Skeleton
                              width="10rem"
                              height="13rem"
                              v-if="!slotProps.data"
                            ></Skeleton>
                            <img
                              v-else
                              :src="
                                slotProps.data.url
                                  ? slotProps.data.url.split(',')[0]
                                  : '/default_image.png'
                              "
                              :alt="slotProps.data.name"
                              class="rounded object-cover w-full h-52"
                            />
                          </div>
                        </div>
                        <div
                          class="mb-4 font-medium whitespace-nowrap text-ellipsis w-44 overflow-hidden"
                          v-tooltip="
                            slotProps.data
                              ? slotProps.data.name
                              : 'Hello World~'
                          "
                        >
                          <Skeleton v-if="!slotProps.data"></Skeleton>
                          <span v-else>{{ slotProps.data.name }}</span>
                        </div>
                      </RouterLink>
                      <div class="flex justify-between items-center">
                        <div class="mt-0 font-semibold text-xl">
                          <Skeleton
                            height="2rem"
                            width="5rem"
                            v-if="!slotProps.data"
                          ></Skeleton>
                          <InputNumber
                            v-else
                            mode="currency"
                            currency="VND"
                            locale="vi-VN"
                            fluid
                            readonly
                            :defaultValue="(slotProps.data.price as number)"
                            :pt="{
                              pcInputText: {
                                root: { style: 'border-style: none' },
                              },
                            }"
                          />
                        </div>
                        <span>
                          <Skeleton
                            v-if="!slotProps.data"
                            size="3rem"
                          ></Skeleton>
                          <Button
                            v-else
                            icon="pi pi-shopping-cart"
                            class="ml-2"
                          />
                        </span>
                      </div>
                    </div>
                  </template>
                  <template #empty>Không Có Sản Phẩm Mới Nào</template>
                </Carousel>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </template>
      </Card>
    </DeferredContent>
  </div>
</template>
