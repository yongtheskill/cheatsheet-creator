<script setup lang="ts">
import { ref, watch } from 'vue';
import { SelectedFile, SelectedItem } from '../types';
import { readDir, FileEntry } from '@tauri-apps/api/fs';
import { Folder, Document, TrashOutline } from '@vicons/ionicons5';

const selectedFiles = defineModel<SelectedFile[]>({ required: true });
const selectedFileDisplay = ref<{ originFolderName: string | null; files: SelectedFile[] }[]>([]);

const { selectedItems } = defineProps<{
  selectedItems: Map<string, SelectedItem>;
  nextStep: () => void;
}>();

function getAllFiles(entries: FileEntry[]) {
  const files: SelectedFile[] = [];
  for (const entry of entries) {
    if (entry.children != null) {
      files.push(...getAllFiles(entry.children));
    } else {
      files.push({
        name: entry.name ?? '',
        path: entry.path,
      });
    }
  }
  return files;
}

watch(
  selectedFileDisplay,
  (newValue) => {
    selectedFiles.value = newValue.reduce<SelectedFile[]>((acc, curr) => {
      acc.push(...curr.files);
      return acc;
    }, []);
  },
  { deep: true }
);

async function updateFileDisplay(selectedItems: Map<string, SelectedItem>) {
  selectedFileDisplay.value = [];
  const orphanFiles: SelectedFile[] = [];
  for (const [_, item] of selectedItems) {
    if (item.type === 'folder') {
      const entries = await readDir(item.path, { recursive: true });
      const files = getAllFiles(entries);
      selectedFileDisplay.value.push({
        originFolderName: item.name,
        files,
      });
    } else {
      orphanFiles.push({
        name: item.name,
        path: item.path,
      });
    }
  }
  selectedFileDisplay.value.push({
    originFolderName: null,
    files: orphanFiles,
  });
}

updateFileDisplay(selectedItems);
watch(
  () => selectedItems,
  async (newValue) => {
    await updateFileDisplay(newValue);
  }
);

function deleteFile(f: SelectedFile) {
  selectedFileDisplay.value.forEach((folder) => {
    folder.files = folder.files.filter((file) => file.path !== f.path);
  });
}
</script>

<template>
  <div class="px-36 py-7 h-full text-gray-500">
    <div class="border border-gray-200 rounded-xl h-full relative">
      <div class="h-full px-8 py-5 flex flex-col overflow-y-auto">
        <div v-for="item in selectedFileDisplay" :key="item.originFolderName ?? ''">
          <div class="flex items-center cursor-default" v-if="item.originFolderName != null">
            <div class="w-4 h-4 shrink-0"><Folder /></div>
            <span class="pl-2 pr-1">{{ item.originFolderName }}</span>
          </div>
          <div :class="[item.originFolderName != null ? 'pl-3' : '']">
            <div v-for="file in item.files" :key="file.path">
              <div
                @click="deleteFile(file)"
                class="flex items-center cursor-pointer hover:text-red-600 [&>.trashItem]:hover:opacity-100 [&>.trashItem]:opacity-0">
                <div class="w-4 h-4 shrink-0"><Document /></div>
                <span class="pl-2 pr-1">{{ file.name }}</span>
                <div class="w-4 h-4 shrink-0 trashItem transition-opacity">
                  <TrashOutline />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button
        class="bg-indigo-600 text-white px-5 py-1 rounded-md absolute bottom-3 right-6"
        @click="nextStep()">
        Confirm
      </button>
    </div>
  </div>
</template>
