<script setup lang="ts">
import { ref, watch } from 'vue';
import { readDir, BaseDirectory, FileEntry } from '@tauri-apps/api/fs';
import { Folder, Document, CheckmarkCircleOutline } from '@vicons/ionicons5';
import { SelectedItem } from '../types';

defineProps<{
  selectedFiles: Map<string, SelectedItem>;
  selectFile: (f: FileEntry) => void;
  changeDir: (newPath: string) => void;
}>();

const currentPath = defineModel<string>({ required: true });
const loading = ref(false);
const files = ref<FileEntry[]>([]);

function isDirectory(file: FileEntry) {
  return file.children != null;
}

async function loadFiles(path: string) {
  loading.value = true;
  files.value = await readDir(path, { dir: BaseDirectory.Home });
  loading.value = false;
}

loadFiles(currentPath.value);
watch(currentPath, (newValue) => {
  loadFiles(newValue);
});
</script>

<template>
  <div class="px-6 py-3 text-gray-500 space-y-2">
    <div
      v-for="file in files"
      :key="file.path"
      @click="isDirectory(file) ? changeDir(file.path) : selectFile(file)"
      @contextmenu.prevent="selectFile(file)"
      :class="[
        selectedFiles.has(file.path)
          ? 'text-orange-600 hover:text-orange-500'
          : 'hover:text-indigo-600',
        'flex items-center cursor-pointer ',
      ]">
      <div class="w-4 h-4 shrink-0" v-if="isDirectory(file)"><Folder /></div>
      <div class="w-4 h-4 shrink-0" v-else><Document /></div>
      <span class="pl-2 pr-1">{{ file.name }}</span>
      <div class="w-4 h-4 shrink-0" v-if="selectedFiles.has(file.path)">
        <CheckmarkCircleOutline />
      </div>
    </div>
    <div
      class="absolute bottom-0 right-0 py-1 px-2 border-t border-l border-gray-200 rounded-tl-xl bg-white text-right">
      Folders: Left click to open, right click to select.
    </div>
  </div>
</template>
