import { Component } from '@angular/core';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  standalone: false,
})
export class Tab4Page {
  readonly helpTitle = 'Privacy and Security Statement';
  readonly helpText =
    'This page provides an overview of how applications handle data and security policies.\n The help button allows you to view the summary of this section at any time; Please refer to the main text list for detailed terms.';

  readonly sections = [
    {
      title: 'data minimization',
      body:
        'Only collect business fields (name, category, quantity, etc.) required for inventory management, and do not persist sensitive data unrelated to this feature locally. ',
',
    },
    {
      title: 'transport security',
      body:
        'Communication with the server is encrypted using HTTPS (configured in the environment variables), reducing the risk of eavesdropping and tampering.',
    },
    {
      title: 'input validation ',
      body:
        'Forms are validated for required fields, type, and length before submission, and only allow dropdown options for enum fields. ',
    },
    {
      title: 'error handling',
      body:
        'Network or server errors are displayed in a readable format using Toast messages, and do not expose stack traces or internal implementation details to the user.',
    },
    {
      title: 'deletion confirmation',
      body:
        'Deletion operations require a second confirmation step to prevent accidental deletion. Users are advised to exercise caution when deleting items, and the application will display server errors if the operation is not allowed.',
    },
    {
      title: 'mobile testing',
      body:
        'Test the application on Android/iOS emulators or real devices.',
    },
  ];
}
