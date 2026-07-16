/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, forwardRef, Input, OnInit, Output, EventEmitter } from '@angular/core'; // Se añadieron Output y EventEmitter
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';

// 🔑 PROVEEDOR CLAVE: Permite que el componente funcione con ngModel y FormControl
const CUSTOM_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TextEditorComponent),
  multi: true
};

@Component({
  selector: 'app-text-editor',
  standalone: true,
  imports: [CommonModule, QuillModule, FormsModule, ReactiveFormsModule],
  templateUrl: './text-editor.component.html',
  styleUrl: './text-editor.component.scss',
  providers: [CUSTOM_VALUE_ACCESSOR]
})
export class TextEditorComponent implements ControlValueAccessor, OnInit {
  @Input() toolbarType: string = 'standard';
  @Input() contentHtml: string | '' = '';
  @Output() contentHtmlChange: EventEmitter<string> = new EventEmitter<string>();

  disabled: boolean = false;
  toolbarOptions: any;
  onChange = (value: string) => {};
  onTouched = () => {};

  toolbarStandard = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ header: [1, 2, false] }],
      ['link', 'image'],
      [{ align: [] }]
    ]
  };

  configBasica = {
    toolbar: [['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }], [{ align: [] }]]
  };

  configCompleta = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ header: [1, 2, 3, false] }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['link', 'image', 'video'],
      ['clean']
    ]
  };

  constructor() {}

  ngOnInit(): void {
    this.setToolbarConfiguration(this.toolbarType);
  }

  private setToolbarConfiguration(type: string) {
    switch (type) {
      case 'standard':
        this.toolbarOptions = this.toolbarStandard;
        break;
      case 'basica':
        this.toolbarOptions = this.configBasica;
        break;
      case 'completa':
        this.toolbarOptions = this.configCompleta;
        break;
      default:
        this.toolbarOptions = this.configBasica;
        break;
    }
  }

  writeValue(value: any): void {
    this.contentHtml = value || '';
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onContentChange(html: any) {
    this.onChange(html);
    this.contentHtml = html;
    this.contentHtmlChange.emit(html);
  }
}
