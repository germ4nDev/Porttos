import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Setting {
  color: string;
  id: string;
}

@Component({
  selector: 'app-color-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './color-selector.component.html',
  styleUrl: './color-selector.component.scss'
})
export class ColorSelectorComponent implements OnInit, OnChanges {
  @Input() label: string = 'Color Seleccionado';
  @Input() id: string = 'id';
  @Input() initialColor: string | null | undefined | '' = '#000000';

  @Output() colorSelected = new EventEmitter<Setting>();

  selectedColor: string = '#000000';

  constructor() {}

  ngOnInit(): void {
    if (this.initialColor) {
      this.selectedColor = this.initialColor;
      console.log('Color inicial cargado en ngOnInit:', this.selectedColor);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialColor'] && changes['initialColor'].currentValue) {
      const newColor = changes['initialColor'].currentValue;
      if (this.selectedColor !== newColor) {
        this.selectedColor = newColor;
        console.log('Color actualizado vía ngOnChanges:', this.selectedColor);
      }
    }
  }

  onColorChange(newColor: string): void {
    this.selectedColor = newColor;
    const color: Setting = {
      color: newColor,
      id: this.id
    };
    this.colorSelected.emit(color);
  }
}
