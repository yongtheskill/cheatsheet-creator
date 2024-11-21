<script setup lang="ts">
import Breadcrumbs from './Breadcrumbs.vue';
import FileList from './FileList.vue';
import { SelectedItem } from '../types';
import { FileEntry } from '@tauri-apps/api/fs';
import { homeDir } from '@tauri-apps/api/path';
import { ref } from 'vue';

const selectedFiles = defineModel<Map<string, SelectedItem>>({ required: true });
let homeDirectory: string | null = null;

function selectFile(f: FileEntry) {
  if (selectedFiles.value.has(f.path)) {
    selectedFiles.value.delete(f.path);
    return;
  }
  selectedFiles.value.set(f.path, {
    type: f.children == null ? 'file' : 'folder',
    name: f.name ?? '',
    path: f.path,
  });
}

async function changeDir(newPath: string) {
  if (homeDirectory === null) {
    homeDirectory = await homeDir();
  }
  currentPath.value = newPath.slice(homeDirectory.length);
}

const currentPath = ref('');
</script>

<template>
  <div class="h-12 border-b border-gray-200 px-6 flex items-center">
    <Breadcrumbs v-model="currentPath" />
  </div>
  <div class="h-[calc(100%-theme(space.12))] overflow-y-scroll">
    <FileList
      v-model="currentPath"
      :selected-files="selectedFiles"
      :select-file="selectFile"
      :change-dir="changeDir" />
  </div>
</template>
