import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ToastController } from '@ionic/angular';

import {
  Category,
  CATEGORY_VALUES,
  CreateInventoryPayload,
  InventoryItem,
  StockStatus,
  STOCK_STATUS_VALUES,
} from '../models/inventory.model';
import { InventoryService } from '../services/inventory.service';
import {
  itemNameValidator,
  nonNegativeIntegerValidator,
  requiredTrimmed,
  specialNoteValidator,
} from '../shared/utils/inventory-validators';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {
  form!: FormGroup;
  featuredItems: InventoryItem[] = [];
  loadingFeatured = false;

  readonly categories = CATEGORY_VALUES;
  readonly stockStatuses = STOCK_STATUS_VALUES;

  readonly helpTitle = 'New Records and Highlights';

  constructor(
    private readonly fb: FormBuilder,
    private readonly inventory: InventoryService,
    private readonly toastCtrl: ToastController,
    private readonly loadingCtrl: LoadingController,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      item_name: ['', [itemNameValidator()]],
      category: [Category.Electronics, [Validators.required]],
      quantity: [0, [nonNegativeIntegerValidator('Quantity')]],
      price: [0, [nonNegativeIntegerValidator('Price')]],
      supplier_name: ['', [requiredTrimmed('Supplier')]],
      stock_status: [StockStatus.InStock, [Validators.required]],
      featured_item: [false],
      special_note: ['', [specialNoteValidator()]],
    });
    this.loadFeatured();
  }

  loadFeatured(): void {
    this.loadingFeatured = true;
    this.inventory.getAll().subscribe({
      next: (rows) => {
        this.featuredItems = (rows ?? []).filter((r) => Number(r.featured_item) === 1);
        this.loadingFeatured = false;
      },
      error: async (err: Error) => {
        this.loadingFeatured = false;
        await this.toast(err.message, 'danger');
      },
    });
  }

  fieldError(field: string): string | null {
    const c = this.form.get(field);
    if (!c || !c.touched || !c.errors) {
      return null;
    }
    if (c.errors['required']) {
      return 'Required';
    }
    if (c.errors['maxlength']) {
      return 'Exceeding the allowed length';
    }
    if (c.errors['integer']) {
      return (c.errors['integer'] as { message?: string }).message ?? 'Must be a non negative integer';
    }
    return null;
  }

  async submit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      await this.toast('Please correct the errors in the form before submitting.', 'warning');
      return;
    }

    const v = this.form.getRawValue();
    const payload: CreateInventoryPayload = {
      item_name: String(v.item_name).trim(),
      category: v.category as Category,
      quantity: Number(v.quantity),
      price: Number(v.price),
      supplier_name: String(v.supplier_name).trim(),
      stock_status: v.stock_status as StockStatus,
      featured_item: v.featured_item ? 1 : 0,
      special_note: v.special_note?.trim() ? String(v.special_note).trim() : null,
    };

    const loading = await this.loadingCtrl.create({ message: 'Waiting' });
    await loading.present();

    this.inventory.create(payload).subscribe({
      next: async () => {
        await loading.dismiss();
        await this.toast('Success', 'success');
        this.form.reset({
          item_name: '',
          category: Category.Electronics,
          quantity: 0,
          price: 0,
          supplier_name: '',
          stock_status: StockStatus.InStock,
          featured_item: false,
          special_note: '',
        });
        this.loadFeatured();
      },
      error: async (err: Error) => {
        await loading.dismiss();
        await this.toast(err.message, 'danger');
      },
    });
  }

  private async toast(message: string, color: string): Promise<void> {
    const t = await this.toastCtrl.create({
      message,
      duration: 2600,
      color,
      position: 'bottom',
    });
    await t.present();
  }
}
