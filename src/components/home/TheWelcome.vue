<script setup lang="ts">
import { ref } from "vue";
import type Product from "@/interfaces/product";
import { useGetFetch } from "@/composables/custom-fetch";
import { useCartStore } from "@/stores/cart";

const { setCart } = useCartStore();
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
const banners = ref();

// Get data from server
async function getData(uri: string) {
  const headers = new Headers();
  headers.append("Accept", "application/json");
  const { data, status } = await useGetFetch(uri, headers);
  return status >= 200 && status <= 299 ? data.data : null;
}

// Handle load latest product
async function onLoadLatestProduct() {
  latestProducts.value = new Array<Product>(5);
  const data = await getData("/api/latest-products");
  setTimeout(() => (latestProducts.value = data), 1000);
}

// Handle load novels
async function onLoadNovels() {
  novels.value = new Array<Product>(5);
  const data = await getData("/api/products/category/16");
  setTimeout(() => (novels.value = data), 1000);
}

// Handle load mangas
async function onLoadMangas() {
  mangas.value = new Array<Product>(5);
  const data = await getData("/api/products/category/17");
  setTimeout(() => (mangas.value = data), 1000);
}

// Handle load banners
async function onLoadBanners() {
  const data = await getData("/api/banners");
  setTimeout(() => (banners.value = data), 1000);
}
</script>

<template>
  <div class="flex flex-col items-center">
    <DeferredContent @load="onLoadBanners" class="w-5/6 mt-4">
      <Galleria
        :value="banners"
        :numVisible="5"
        :showThumbnails="false"
        :showIndicators="true"
        v-if="banners"
      >
        <template #item="slotProps">
          <img
            :src="slotProps.item.url"
            alt="Tu Bookstore"
            class="rounded object-cover w-full !h-60"
          />
        </template>
      </Galleria>
    </DeferredContent>
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
                    <p v-else>
                      {{
                        slotProps.data.price.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })
                      }}
                    </p>
                  </div>
                  <span>
                    <Skeleton v-if="!slotProps.data" size="3rem"></Skeleton>
                    <Button
                      v-else
                      icon="pi pi-shopping-cart"
                      class="ml-2"
                      @click="setCart(slotProps.data)"
                    />
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
                          <p v-else>
                            {{
                              slotProps.data.price.toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })
                            }}
                          </p>
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
                            @click="setCart(slotProps.data)"
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
