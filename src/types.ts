export type SelectedItem = {
  type: 'file' | 'folder';
  name: string;
  path: string;
};

export type SelectedFile = {
  name: string;
  path: string;
};

export type DisplayFile = {
  name: string;
  path: string;
  fontSize: number;
};

export type Page = {
  columns: DisplayFile[][];
};
