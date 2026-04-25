import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {
  AlertController,
  LoadingController,
  ToastController,
} from '@ionic/angular';

import {
  Category,
  CATEGORY_OPTIONS,
  createEmptyInventoryFormValue,
  getStockStatusLabel,
  InventoryFormValue,
  InventoryItem,
  StockStatus,
  STOCK_STATUS_OPTIONS,
} from '../models/inventory.model';
import { InventoryService } from '../services/inventory.service';
import {
  itemNameValidator,
  nonNegativeIntegerValidator,
  requiredTrimmed,
  specialNoteValidator,
} from '../shared/utils/inventory-validators';

type InventoryEditFormGroup = FormGroup<{
  item_name: FormControl<string>;
  category: FormControl<Category>;
  quantity: FormControl<number>;
  price: FormControl<number>;
  supplier_name: FormControl<string>;
  stock_status: FormControl<StockStatus>;
  featured_item: FormControl<boolean>;
  special_note: FormControl<string>;
}>;

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {
  lookupName = '';
  lookupLoading = false;

  loadedKeyName: string | null = null;
  private loadedSnapshot: InventoryItem | null = null;

  editForm: InventoryEditFormGroup;
  editEnabled = false;

  readonly categories = CATEGORY_OPTIONS;
  readonly stockStatuses = STOCK_STATUS_OPTIONS;

  readonly helpTitle = '更新与删除';
  readonly helpText =
    '本页通过商品名称加载记录，支持修改库存信息或删除记录，并在危险操作前给出确认提示。';

  constructor(
    private readonly fb: FormBuilder,
    private readonly inventory: InventoryService,
    private readonly toastCtrl: ToastController,
    private readonly loadingCtrl: LoadingController,
    private readonly alertCtrl: AlertController,
  ) {
    const initial = createEmptyInventoryFormValue();
    this.editForm = this.fb.nonNullable.group({
      item_name: [{ value: initial.item_name, disabled: true }, [itemNameValidator()]],
      category: [{ value: initial.category, disabled: true }, [Validators.required]],
      quantity: [{ value: initial.quantity, disabled: true }, [nonNegativeIntegerValidator('数量')]],
      price: [{ value: initial.price, disabled: true }, [nonNegativeIntegerValidator('价格')]],
      supplier_name: [{ value: initial.supplier_name, disabled: true }, [requiredTrimmed('供应商名称')]],
      stock_status: [{ value: initial.stock_status, disabled: true }, [Validators.required]],
      featured_item: [{ value: initial.featured_item, disabled: true }],
      special_note: [{ value: initial.special_note, disabled: true }, [specialNoteValidator()]],
    });
  }

  get loadedItemName(): string {
    return this.editForm.getRawValue().item_name || '未加载商品';
  }

  get canEdit(): boolean {
    return this.editEnabled && !!this.loadedSnapshot;
  }

  get deleteBlocked(): boolean {
    return this.loadedItemName.trim().toLowerCase() === 'laptop';
  }

  async lookup(): Promise<void> {
    const key = this.lookupName.trim();
    if (!key.length) {
      await this.toast('请输入要查询的物品名称。', 'warning');
      return;
    }

    this.lookupLoading = true;
    this.loadedKeyName = null;
    this.loadedSnapshot = null;
    this.setEditEnabled(false);

    this.inventory.getByName(key).subscribe({
      next: (item) => {
        this.lookupLoading = false;
        this.loadedKeyName = key;
        this.loadedSnapshot = item;
        this.editForm.patchValue({
          item_name: item.item_name,
          category: item.category as Category,
          quantity: item.quantity,
          price: item.price,
          supplier_name: item.supplier_name,
          stock_status: item.stock_status as StockStatus,
          featured_item: Number(item.featured_item) === 1,
          special_note: item.special_note ?? '',
        });
        this.setEditEnabled(true);
      },
      error: async (err: Error) => {
        this.lookupLoading = false;
        await this.toast(err.message, 'danger');
      },
    });
  }

  fieldError(field: keyof InventoryFormValue): string | null {
    const control = this.editForm.get(field);
    if (!control || !control.touched || !control.errors) {
      return null;
    }
    if (control.errors['required']) {
      return '这是必填项';
    }
    if (control.errors['maxlength']) {
      return '内容长度超出限制';
    }
    if (control.errors['integer']) {
      return (control.errors['integer'] as { message?: string }).message ?? '请输入非负整数';
    }
    return null;
  }

  async confirmDelete(): Promise<void> {
    if (!this.loadedKeyName || !this.loadedSnapshot) {
      return;
    }
    if (this.deleteBlocked) {
      await this.toast('名称为 “Laptop” 的物品不允许删除。', 'warning');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: '确认删除',
      message: `确定要删除 “${this.loadedKeyName}” 吗？此操作不可撤销。`,
      buttons: [
        { text: '取消', role: 'cancel' },
        {
          text: '删除',
          role: 'destructive',
          handler: () => {
            void this.performDelete();
          },
        },
      ],
    });
    await alert.present();
  }

  async save(): Promise<void> {
    if (!this.loadedKeyName || !this.loadedSnapshot) {
      return;
    }

    this.editForm.markAllAsTouched();
    if (this.editForm.invalid) {
      await this.toast('请先修正表单中的错误。', 'warning');
      return;
    }

    const value = this.editForm.getRawValue();
    const updated: InventoryItem = {
      ...this.loadedSnapshot,
      item_name: value.item_name.trim(),
      category: value.category,
      quantity: Number(value.quantity),
      price: Number(value.price),
      supplier_name: value.supplier_name.trim(),
      stock_status: value.stock_status,
      featured_item: value.featured_item ? 1 : 0,
      special_note: value.special_note.trim() ? value.special_note.trim() : null,
    };

    const loading = await this.loadingCtrl.create({ message: '正在保存...' });
    await loading.present();

    this.inventory.update(this.loadedKeyName, updated).subscribe({
      next: async () => {
        await loading.dismiss();
        await this.toast('库存记录已更新。', 'success');
        this.resetAfterMutation();
      },
      error: async (err: Error) => {
        await loading.dismiss();
        await this.toast(err.message, 'danger');
      },
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  }

  statusLabel(status: string): string {
    return getStockStatusLabel(status);
  }

  private async performDelete(): Promise<void> {
    if (!this.loadedKeyName) {
      return;
    }

    const loading = await this.loadingCtrl.create({ message: '正在删除...' });
    await loading.present();

    this.inventory.delete(this.loadedKeyName).subscribe({
      next: async () => {
        await loading.dismiss();
        await this.toast('库存记录已删除。', 'success');
        this.resetAfterMutation();
      },
      error: async (err: Error) => {
        await loading.dismiss();
        await this.toast(err.message, 'danger');
      },
    });
  }

  private setEditEnabled(enabled: boolean): void {
    this.editEnabled = enabled;
    if (enabled) {
      this.editForm.enable({ emitEvent: false });
    } else {
      this.editForm.disable({ emitEvent: false });
    }
  }

  private resetAfterMutation(): void {
    this.lookupName = '';
    this.loadedKeyName = null;
    this.loadedSnapshot = null;
    this.editForm.reset(createEmptyInventoryFormValue());
    this.setEditEnabled(false);
  }

  private async toast(message: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2800,
      color,
      position: 'bottom',
    });
    await toast.present();
  }
}
