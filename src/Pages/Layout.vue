<script setup lang="ts">
import { ref, watch } from 'vue';
import { DisplayFile, SelectedFile } from '../types';
import { AddCircle, RemoveCircle, Menu, Add } from '@vicons/ionicons5';
import MdRender from '../components/MdRender.vue';
import draggable from 'vuedraggable';

const { selectedFiles } = defineProps<{
  selectedFiles: SelectedFile[];
  nextStep: () => void;
}>();

const defaultFontSize = 8;

const availableFiles = ref<DisplayFile[]>(
  selectedFiles.map((f) => ({ ...f, fontSize: defaultFontSize }))
);
watch(
  () => selectedFiles,
  (newValue) => {
    pages.value = [{ columns: [[]] }];
    availableFiles.value = newValue.map((f) => ({ ...f, fontSize: defaultFontSize }));
  }
);

type Page = {
  columns: DisplayFile[][];
};

const pages = ref<Page[]>([{ columns: [[]] }]);

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
  pages.value.push({ columns: [[]] });
}

function deletePage(page: Page) {
  page.columns.forEach((column) => {
    column.forEach((file) => {
      availableFiles.value.push(file);
    });
  });
  pages.value.splice(pages.value.indexOf(page), 1);
}
</script>

<template>
  <div class="text-gray-700 h-full px-5 py-5 gap-x-5">
    <div class="h-full w-80 pr-5 float-left">
      <h1 class="text-lg font-black pt-3 pb-2"><span class="h-6">Notes</span></h1>

      <draggable :list="availableFiles" group="files" itemKey="path" handle=".handle">
        <template #item="{ element }">
          <div class="pb-3">
            <div class="border border-gray-200 rounded-xl px-4 py-2">
              <div class="flex justify-between items-center">
                <div class="font-semibold">
                  {{ element.name }}
                </div>
                <div class="w-5 h-5 text-gray-300 cursor-pointer handle">
                  <Menu />
                </div>
              </div>
            </div>
          </div>
        </template>
      </draggable>
    </div>
    <div class="h-full overflow-y-auto">
      <div v-for="(page, pageI) in pages" :key="pageI">
        <div class="flex pt-3 pb-2 items-center justify-between">
          <h1 class="text-lg font-black">Page {{ pageI + 1 }}</h1>

          <div class="flex items-center">
            <div
              :class="[
                'flex items-center',
                pages.length > 1 ? 'border-r border-gray-200 pr-3' : '',
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
            <div class="pl-4" v-if="pages.length > 1">
              <button
                class="bg-red-600 hover:bg-red-500 text-white px-4 rounded-md h-6"
                @click="deletePage(page)">
                Delete
              </button>
            </div>
          </div>
        </div>
        <div class="pb-6">
          <div
            class="grid border border-gray-200 rounded-xl aspect-[1.41] overflow-hidden"
            :style="{ gridTemplateColumns: `repeat(${page.columns.length}, 1fr)` }">
            <div
              v-for="(column, columnI) in page.columns"
              :key="columnI"
              class="[&:not(:last-child)]:border-r border-gray-200 min-w-0">
              <draggable :list="column" group="files" itemKey="path" class="h-full">
                <template #item="{ element }">
                  <div class="cursor-pointer py-2 px-3">
                    <MdRender
                      :name="element.name"
                      :path="element.path"
                      v-model="element.fontSize" />
                  </div>
                </template>
              </draggable>
            </div>
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
