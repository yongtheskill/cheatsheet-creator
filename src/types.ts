export type SelectedItem = {
  type: 'file' | 'folder';
  name: string;
  path: string;
};

export type SelectedFile = {
  name: string;
  path: string;
};

export type DisplayFileSettings = {
  fontSize: number;
  startLine: number;
  endLine: number;
  showHeading: boolean;
  bottomBorder: boolean;
  id: number;
};

export type DisplayFile = {
  name: string;
  path: string;
  settings: DisplayFileSettings;
};

export type Page = {
  columns: DisplayFile[][];
};
