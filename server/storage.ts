import type { ContentItem, InsertContentItem } from "@shared/schema";

export interface IStorage {
  getContentItem(id: number): Promise<ContentItem | undefined>;
  createContentItem(item: InsertContentItem): Promise<ContentItem>;
  searchContentItems(query: string): Promise<ContentItem[]>;
}

export class MemStorage implements IStorage {
  private items: Map<number, ContentItem>;
  private currentId: number;

  constructor() {
    this.items = new Map();
    this.currentId = 1;
  }

  async getContentItem(id: number): Promise<ContentItem | undefined> {
    return this.items.get(id);
  }

  async createContentItem(item: InsertContentItem): Promise<ContentItem> {
    const id = this.currentId++;
    const contentItem = { ...item, id };
    this.items.set(id, contentItem);
    return contentItem;
  }

  async searchContentItems(query: string): Promise<ContentItem[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.items.values()).filter(
      item => item.title.toLowerCase().includes(lowerQuery)
    );
  }
}

export const storage = new MemStorage();
