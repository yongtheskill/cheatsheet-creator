<script setup lang="ts">
import { SelectedItem } from '../types';
import { Folder, Document, TrashOutline } from '@vicons/ionicons5';

const selectedFiles = defineModel<Map<string, SelectedItem>>({ required: true });

defineProps<{
  nextStep: () => void;
}>();

function deleteFile(f: SelectedItem) {
  selectedFiles.value.delete(f.path);
  return;
}
</script>

<template>
  <div class="h-12 border-b border-gray-200 px-6 flex items-center justify-between">
    <h1 class="text-lg font-bold">Selected Items</h1>
    <button class="bg-indigo-600 text-white px-3 rounded-md" @click="nextStep()">Confirm</button>
  </div>
  <div class="h-[calc(100%-theme(space.12))] overflow-y-scroll px-6 py-3">
    <div
      v-for="[path, file] in selectedFiles"
      :key="path"
      @click="deleteFile(file)"
      class="flex items-center cursor-pointer text-gray-500 hover:text-orange-500 [&>.trashItem]:hover:opacity-100 [&>.trashItem]:opacity-0">
      <div class="w-4 h-4 shrink-0" v-if="file.type === 'folder'"><Folder /></div>
      <div class="w-4 h-4 shrink-0" v-else><Document /></div>
      <span class="pl-2 pr-1">{{ file.name }}</span>
      <div class="w-4 h-4 shrink-0 trashItem transition-opacity">
        <TrashOutline />
      </div>
    </div>
  </div>
</template>
