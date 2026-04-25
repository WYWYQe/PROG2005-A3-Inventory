import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import {
  getCategoryLabel,
  getStockStatusLabel,
  InventoryItem,
} from '../models/inventory.model';
import { InventoryService } from '../services/inventory.service';

type LoadState = 'idle' | 'loading' | 'empty' | 'error' | 'success';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {
  items: InventoryItem[] = [];
  loadState: LoadState = 'idle';

  searchQuery = '';
  searchResult: InventoryItem | null = null;
  searchAttempted = false;
  searchLoading = false;
  searchHadError = false;

  readonly helpTitle = '列表与搜索';
  readonly helpText =
    '本页用于查看全部库存记录，并支持按物品名称快速搜索单条记录，适合在手机端快速盘点和定位商品。';

  constructor(
    private readonly inventory: InventoryService,
    private readonly toastCtrl: ToastController,
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  get inventoryCount(): number {
    return this.items.length;
  }

  get featuredCount(): number {
    return this.items.filter((item) => Number(item.featured_item) === 1).length;
  }

  get lowStockCount(): number {
    return this.items.filter((item) => item.stock_status === 'Low stock').length;
  }

  get totalStockValue(): number {
    return this.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.price), 0);
  }

  get heroSummary(): string {
    if (this.loadState === 'loading') {
      return '正在同步库存数据，稍后即可看到最新的列表和搜索结果。';
    }
    if (!this.items.length) {
      return '当前还没有库存记录，可以先前往“新增与精选”页面创建第一条商品信息。';
    }
    return `当前共有 ${this.inventoryCount} 条库存记录，其中 ${this.featuredCount} 条为精选商品，${this.lowStockCount} 条需要重点关注。`;
  }

  loadAll(): void {
    this.loadState = 'loading';
    this.inventory.getAll().subscribe({
      next: (rows) => {
        this.items = rows ?? [];
        this.loadState = this.items.length ? 'success' : 'empty';
      },
      error: async (err: Error) => {
        this.loadState = 'error';
        await this.presentToast(err.message, 'danger');
      },
    });
  }

  async searchByName(): Promise<void> {
    const keyword = this.searchQuery.trim();
    if (!keyword.length) {
      await this.presentToast('请输入要搜索的物品名称。', 'warning');
      return;
    }

    this.searchLoading = true;
    this.searchAttempted = true;
    this.searchHadError = false;
    this.searchResult = null;

    this.inventory.getByName(keyword).subscribe({
      next: (item) => {
        this.searchResult = item;
        this.searchLoading = false;
      },
      error: async (err: Error) => {
        this.searchLoading = false;
        this.searchHadError = true;
        await this.presentToast(err.message, 'warning');
      },
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResult = null;
    this.searchAttempted = false;
    this.searchHadError = false;
  }

  trackByName(_index: number, item: InventoryItem): string {
    return `${item.item_name}-${item.item_id ?? ''}`;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  }

  categoryLabel(category: string): string {
    return getCategoryLabel(category);
  }

  statusLabel(status: string): string {
    return getStockStatusLabel(status);
  }

  statusTone(status: string): string {
    if (status === 'In stock') {
      return 'status-good';
    }
    if (status === 'Low stock') {
      return 'status-warn';
    }
    return 'status-bad';
  }

  private async presentToast(message: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2800,
      color,
      position: 'bottom',
    });
    await toast.present();
  }
}
