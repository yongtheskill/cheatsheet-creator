<script setup lang="ts">
import MdRender from '../components/MdRender.vue';
import { onMounted, ref, watch } from 'vue';
import { Page } from '../types';

const { finalPages } = defineProps<{
  finalPages: { portrait: boolean; pages: Page[] };
}>();

const fontCorrection = 0.47;

const setPageCss = (function () {
  const style = document.createElement('style');
  document.head.appendChild(style);
  return function (rule: string) {
    style.innerHTML = rule;
  };
})();

function setPagePortrait(portrait: boolean) {
  setPageCss(`@page {size: ${portrait ? '210mm 297mm' : '297mm 210mm'};}`);
}
setPagePortrait(finalPages.portrait);
watch(
  () => finalPages.portrait,
  (newValue) => {
    setPagePortrait(newValue);
  }
);

const pageContainer = ref<HTMLElement | null>(null);

const baseSize = ref<number>(1000);
onMounted(() => {
  if (pageContainer.value == null) {
    return;
  }
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const rect = entry.target.querySelector('.paperContainer')?.getBoundingClientRect();
      if (rect == null) {
        continue;
      }
      baseSize.value = Math.max(rect.width, rect.height);
    }
  });
  observer.observe(pageContainer.value);
});

async function ex() {
  window.print();
}
</script>

<template>
  <div class="px-36 py-7 h-full printContainer">
    <div class="w-full pb-5 printHide">
      <button
        class="h-10 w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold"
        @click="ex()">
        Export!
      </button>
    </div>
    <div class="h-full" ref="pageContainer">
      <div v-for="(page, pageI) in finalPages.pages" :key="pageI" class="pb-6 pageContainer">
        <div
          :class="[
            finalPages.portrait ? 'aspect-[210/297]' : 'aspect-[297/210]',
            'grid border border-gray-200 rounded-xl overflow-hidden paperContainer printPage p-4',
          ]"
          :id="`page-${pageI}`"
          :style="{ gridTemplateColumns: `repeat(${page.columns.length}, 1fr)` }">
          <div
            v-for="(column, columnI) in page.columns"
            :key="columnI"
            class="[&:not(:last-child)]:border-r border-gray-200 min-w-0">
            <div
              v-for="file in column"
              :key="file.path"
              :class="[
                file.settings.bottomBorder ? ' border-b border-gray-200' : '',
                'px-2 pb-2 pt-1 ',
              ]">
              <MdRender
                :name="file.name"
                :path="file.path"
                :baseSize="baseSize"
                :editing="false"
                v-model="file.settings"
                :font-correction="fontCorrection" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.printPage {
  break-inside: avoid;
}

@media print {
  @page {
    margin: 0;
  }
  .printHide {
    display: none;
  }
  .printContainer {
    padding: 0;
  }
  .pageContainer {
    padding: 0;
  }
  .printPage {
    border: none;
  }
  .border-gray-200 {
    border-color: #aaa;
  }
  .markdown-body {
    color: #000;
  }
  #app {
    height: auto;
    display: block;
  }
}
</style>
