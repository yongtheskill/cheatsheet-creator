<script setup lang="ts">
import { readTextFile } from '@tauri-apps/api/fs';
import { ref } from 'vue';
import { AddCircle, RemoveCircle } from '@vicons/ionicons5';
import markdownit from 'markdown-it';
// @ts-ignore
import markdownitKatex from 'markdown-it-katex';
import markdownItFrontMatter from 'markdown-it-front-matter';

const { path } = defineProps<{
  name: string;
  path: string;
}>();

const fontSize = defineModel<number>({ required: true });

const mdHtml = ref<string | null>(null);

function renderMd(mdStr: string) {
  const md = markdownit({
    html: true,
    linkify: false,
    typographer: true,
  });

  md.use(markdownitKatex, { output: 'html' });
  md.use(markdownItFrontMatter, () => {});

  mdHtml.value = md.render(mdStr);
}

readTextFile(path).then((t) => renderMd(t));
</script>

<template>
  <div v-if="mdHtml != null" class="relative">
    <div v-html="mdHtml" class="markdown-body" :style="{ fontSize: `${fontSize}px` }"></div>
    <div class="flex items-center absolute top-0 right-0 bg-gray-100 px-2 py-1 rounded-lg">
      <div class="pr-2">{{ fontSize }}px</div>
      <button
        :class="[
          fontSize <= 0.5 ? 'text-gray-300' : 'text-indigo-600 hover:text-indigo-500',
          ' w-6 h-6',
        ]"
        @click="fontSize -= 0.5">
        <RemoveCircle />
      </button>
      <button class="text-indigo-600 hover:text-indigo-500 w-6 h-6" @click="fontSize += 0.5">
        <AddCircle />
      </button>
    </div>
  </div>

  <div v-else class="text-gray-500 text-center">Loading...</div>
</template>
