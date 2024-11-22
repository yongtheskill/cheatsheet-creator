<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { DisplayFile, Page, SelectedFile } from '../types';
import { AddCircle, RemoveCircle, Add } from '@vicons/ionicons5';
import MdRender from '../components/MdRender.vue';
import draggable from 'vuedraggable';

const { selectedFiles } = defineProps<{
  selectedFiles: SelectedFile[];
  nextStep: () => void;
}>();

const pageContainer = ref<HTMLElement | null>(null);
const finalPages = defineModel<{ portrait: boolean; pages: Page[] }>({ required: true });

watch(
  () => finalPages.value.portrait,
  () => {
    const rect = pageContainer.value?.querySelector('.paperContainer')?.getBoundingClientRect();
    if (rect == null) {
      return;
    }
    baseSize.value = Math.max(rect.width, rect.height);
  }
);

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

const defaultFontSize = 4.5;

const availableFiles = ref<DisplayFile[]>(
  selectedFiles
    .filter(
      (f) =>
        !finalPages.value.pages.some((p) =>
          p.columns.some((c) => c.some((fc) => fc.path === f.path))
        )
    )
    .map((f) => ({ ...f, fontSize: defaultFontSize }))
);
watch(
  () => selectedFiles,
  (newValue) => {
    finalPages.value.pages = [{ columns: [[]] }];
    availableFiles.value = newValue.map((f) => ({ ...f, fontSize: defaultFontSize }));
  }
);

function addColumn(page: Page) {
  page.columns.push([]);
}

function removeColumn(page: Page) {
  if (page.columns.length <= 1) {
    return;
  }
  const oldColumn = page.columns.pop();
  if (oldColumn != null) {
    oldColumn.forEach((file) => {
      availableFiles.value.push(file);
    });
  }
}

function addPage() {
  finalPages.value.pages.push({ columns: [[]] });
}

function deletePage(page: Page) {
  page.columns.forEach((column) => {
    column.forEach((file) => {
      availableFiles.value.push(file);
    });
  });
  finalPages.value.pages.splice(finalPages.value.pages.indexOf(page), 1);
}
</script>

<template>
  <div class="text-gray-700 h-full px-5 py-5 gap-x-5">
    <div class="h-full w-80 pr-5 float-left">
      <div class="h-full overflow-y-auto">
        <div class="pt-3 pb-2 flex items-center justify-between">
          <h1 class="text-lg font-black"><span class="h-6">Notes</span></h1>
          <label class="inline-flex items-center cursor-pointer pr-2">
            <input type="checkbox" class="sr-only peer" v-model="finalPages.portrait" />
            <span class="me-3 font-medium text-gray-600">Portrait</span>
            <div
              class="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <draggable
          :list="availableFiles"
          group="files"
          itemKey="path"
          class="h-[calc(100%-theme(spacing.6)-theme(spacing.3)-theme(spacing.3))]">
          <template #item="{ element }">
            <div class="pb-3">
              <div
                class="border border-gray-200 rounded-xl px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors">
                <div class="flex justify-between items-center">
                  <div class="font-semibold">
                    {{ element.name }}
                  </div>
                </div>
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>
    <div class="h-full overflow-y-auto" ref="pageContainer">
      <div v-for="(page, pageI) in finalPages.pages" :key="pageI" class="pb-6">
        <div class="flex pt-3 pb-2 items-center justify-between">
          <h1 class="text-lg font-black">Page {{ pageI + 1 }}</h1>

          <div class="flex items-center">
            <div
              :class="[
                'flex items-center',
                finalPages.pages.length > 1 ? 'border-r border-gray-200 pr-3' : '',
              ]">
              <div class="pr-2">
                {{ page.columns.length }} Column{{ page.columns.length === 1 ? '' : 's' }}
              </div>
              <button
                :class="[
                  page.columns.length <= 1
                    ? 'text-gray-300'
                    : 'text-indigo-600 hover:text-indigo-500',
                  ' w-6 h-6',
                ]"
                @click="removeColumn(page)">
                <RemoveCircle />
              </button>
              <button
                class="text-indigo-600 hover:text-indigo-500 w-6 h-6"
                @click="addColumn(page)">
                <AddCircle />
              </button>
            </div>
            <div class="pl-4" v-if="finalPages.pages.length > 1">
              <button
                class="bg-red-600 hover:bg-red-500 text-white px-4 rounded-md h-6"
                @click="deletePage(page)">
                Delete
              </button>
            </div>
          </div>
        </div>
        <div
          :class="[
            finalPages.portrait ? 'aspect-[210/297]' : 'aspect-[297/210]',
            'grid border border-gray-200 rounded-xl overflow-hidden paperContainer',
          ]"
          :style="{ gridTemplateColumns: `repeat(${page.columns.length}, 1fr)` }">
          <div
            v-for="(column, columnI) in page.columns"
            :key="columnI"
            class="[&:not(:last-child)]:border-r border-gray-200 min-w-0">
            <draggable :list="column" group="files" itemKey="path" class="h-full">
              <template #item="{ element }">
                <div
                  class="cursor-pointer hover:bg-gray-100 transition-colors py-1 px-2 border-b pb-3 border-gray-200">
                  <MdRender
                    :name="element.name"
                    :path="element.path"
                    :baseSize="baseSize"
                    :editing="true"
                    v-model="element.fontSize" />
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>

      <div
        class="flex items-center justify-center border-gray-300 border rounded-xl border-dashed cursor-pointer py-2 mb-5 hover:bg-gray-100"
        @click="addPage()">
        <div class="w-6 h-6 text-gray-400"><Add /></div>
        <div class="text-lg text-gray-500">Add Page</div>
      </div>
    </div>
  </div>
</template>

<style>
.button {
  margin-top: 35px;
}

.flip-list-move {
  transition: transform 0.5s;
}

.no-move {
  transition: transform 0s;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.list-group {
  min-height: 20px;
}

.list-group-item {
  cursor: move;
}

.list-group-item i {
  cursor: pointer;
}
</style>
