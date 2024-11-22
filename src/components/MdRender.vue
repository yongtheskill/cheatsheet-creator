<script setup lang="ts">
import { readTextFile } from '@tauri-apps/api/fs';
import { computed, ref } from 'vue';
import { AddCircle, RemoveCircle } from '@vicons/ionicons5';
import markdownit from 'markdown-it';
import markdownItKatex from '@vscode/markdown-it-katex';
import markdownItFrontMatter from 'markdown-it-front-matter';

const { path, baseSize, fontCorrection } = defineProps<{
  name: string;
  path: string;
  editing: boolean;
  baseSize: number;
  fontCorrection?: number;
}>();

const fontSize = defineModel<number>({ required: true });

const baseFontSize = computed(() => (baseSize / 1000) * (fontCorrection ?? 1));

const mdHtml = ref<string | null>(null);

function renderMd(mdStr: string) {
  const md = markdownit({
    html: true,
    linkify: false,
    typographer: true,
  });

  md.use(markdownItKatex, { output: 'html' });
  md.use(markdownItFrontMatter, () => {});

  mdHtml.value = md.render(mdStr);
}

readTextFile(path).then((t) => renderMd(t));
</script>

<template>
  <div v-if="mdHtml != null" class="relative">
    <div>
      <h1 class="font-black" :style="{ fontSize: `${baseFontSize * fontSize * 2.2}px` }">
        {{ name.replace(/\.md$/g, '') }}
      </h1>
      <div
        v-html="mdHtml"
        class="markdown-body"
        :style="{ fontSize: `${baseFontSize * fontSize}px` }"></div>
      <div
        class="flex items-center absolute top-0 right-0 bg-gray-100 px-2 py-1 rounded-lg"
        v-if="editing">
        <div class="pr-2">{{ fontSize }}px</div>
        <button
          :class="[
            fontSize <= 0.1 ? 'text-gray-300' : 'text-indigo-600 hover:text-indigo-500',
            ' w-6 h-6',
          ]"
          @click="fontSize > 0.1 ? (fontSize = Math.round((fontSize - 0.1) * 10) / 10) : null">
          <RemoveCircle />
        </button>
        <button
          class="text-indigo-600 hover:text-indigo-500 w-6 h-6"
          @click="fontSize = Math.round((fontSize + 0.1) * 10) / 10">
          <AddCircle />
        </button>
      </div>
    </div>
  </div>

  <div v-else class="text-gray-500 text-center">Loading...</div>
</template>
