// Angular Import
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// project import
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { CardComponent } from './components/card/card.component';
import { ModalModule } from './components/modal/modal.module';
import { DataFilterPipe } from './filter/data-filter.pipe';
import { TodoListRemoveDirective } from './directive/todo-list-remove.directive';
import { TodoCardCompleteDirective } from './directive/todo-card-complete.directive';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { AlertComponent } from './components/alert/alert.component';
import { GalleryModule } from '@ks89/angular-modal-gallery';
import { TranslateModule } from '@ngx-translate/core';

import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgClickOutsideDirective } from 'ng-click-outside2';
import 'hammerjs';
import 'mousetrap';

import {
  NgbDropdownModule,
  NgbNavModule,
  NgbTooltipModule,
  NgbModule,
  NgbAccordionModule,
  NgbCollapseModule,
  NgbDatepickerModule,
  NgbProgressbarModule
} from '@ng-bootstrap/ng-bootstrap';

const bootstrap = [
  NgbDropdownModule,
  NgbNavModule,
  NgbTooltipModule,
  NgbModule,
  NgbAccordionModule,
  NgbCollapseModule,
  NgbDatepickerModule,
  NgbProgressbarModule
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardComponent,
    BreadcrumbComponent,
    ModalModule,
    GalleryModule,
    NgScrollbarModule,
    AlertComponent,
    bootstrap,
    NgClickOutsideDirective
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardComponent,
    BreadcrumbComponent,
    ModalModule,
    GalleryModule,
    DataFilterPipe,
    TodoListRemoveDirective,
    TodoCardCompleteDirective,
    SpinnerComponent,
    NgScrollbarModule,
    AlertComponent,
    bootstrap,
    NgClickOutsideDirective,
    TranslateModule
  ],
  declarations: [DataFilterPipe, TodoListRemoveDirective, TodoCardCompleteDirective, SpinnerComponent]
})
export class SharedModule {}
