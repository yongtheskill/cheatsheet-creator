<script setup lang="ts">
import { Home, ChevronForward } from '@vicons/ionicons5';
import { ref, watch } from 'vue';
import { sep } from '@tauri-apps/api/path';

const currentPath = defineModel<string>({ required: true });
const path = ref<string[]>(['Home']);

function syncPath(pathString: string) {
  const clean = pathString
    .replace(new RegExp(String.raw`^\${sep}`, 'g'), '')
    .replace(new RegExp(String.raw`\${sep}$`, 'g'), '');
  const split = clean.split(sep);
  path.value = ['Home'];
  for (const item of split) {
    if (item === '') {
      continue;
    }
    path.value.push(item);
  }
}

function toPath(index: number) {
  if (index === 0) {
    currentPath.value = '';
    return;
  }
  const pathString = path.value.slice(1, index + 1).join(sep);
  currentPath.value = pathString;
}

syncPath(currentPath.value);
watch(currentPath, (newValue) => {
  syncPath(newValue);
});
</script>

<template>
  <div
    v-for="(item, index) in path"
    :key="index"
    class="text-gray-500 [&>.toColour]:hover:text-indigo-600 cursor-pointer flex items-center"
    @click="toPath(index)">
    <div class="w-4 h-4 transition-colors toColour" v-if="index === 0"><Home /></div>
    <span class="text-sm transition-colors toColour" v-else>{{ item }}</span>
    <div class="w-4 h-4 mx-1" v-if="index !== path.length - 1"><ChevronForward /></div>
  </div>
</template>
