import { Component } from '@angular/core';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: false,
})
export class Tab4Page {
  readonly helpTitle = '隐私与安全';
  readonly helpText =
    '本页按照常见手机应用的写法，概括说明库存应用在信息收集、使用、保护、共享与用户权利方面的隐私与安全规则。';

  readonly highlights = [
    { value: '最少收集', label: '仅限业务必要信息' },
    { value: '安全存储', label: '限制未授权访问' },
    { value: '明示用途', label: '仅用于库存管理' },
    { value: '可读提示', label: '重要操作有提醒' },
  ];

  readonly sections = [
    {
      icon: 'document-text-outline',
      title: '信息收集范围',
      body: '应用仅收集库存管理所必需的信息，例如商品名称、数量、价格、供应商和备注，不会主动要求与业务无关的敏感个人信息。',
    },
    {
      icon: 'eye-outline',
      title: '信息使用方式',
      body: '所收集的数据仅用于商品录入、库存查询、更新、删除和精选展示，不会超出页面功能范围擅自挪作其他用途。',
    },
    {
      icon: 'lock-closed-outline',
      title: '数据安全保护',
      body: '应用通过表单校验、错误提示、删除确认和建议使用 HTTPS 接口等方式，降低数据误填、误删和传输风险。',
    },
    {
      icon: 'share-social-outline',
      title: '信息共享说明',
      body: '除库存服务端完成业务处理外，应用不应向无关第三方共享库存数据；若后续接入第三方能力，应单独明确告知用途与范围。',
    },
    {
      icon: 'person-outline',
      title: '用户管理权利',
      body: '用户可以通过列表、搜索、更新和删除页面查看并管理当前库存数据，对错误信息进行修改，对不需要的记录进行删除。',
    },
    {
      icon: 'alert-circle-outline',
      title: '风险与提醒机制',
      body: '涉及删除等敏感操作时会先弹出确认提示；网络异常、名称冲突或规则限制也会转换成清晰提示，方便用户及时处理。',
    },
  ];
}
