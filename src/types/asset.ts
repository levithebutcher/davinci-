import type { AssetCategory } from './category';

export interface AssetCreator {
  name: string;
  url?: string;
}

export interface AssetResource {
  id: string;
  title: string;
  category: AssetCategory;
  description: string;
  creator: AssetCreator;
  license: string;
  sourceUrl: string;
  fileFormat: string;
  fileSize: string;
  previewNote?: string;
  tags: string[];
}
