import { NgModule } from '@angular/core';
import { InputDropdownNumberComponent } from './input-dropdown-number/input-dropdown-number.component';
import { ItemTempDirective } from './directives/item-temp.directive';
import { TitleTempDirective } from './directives/title-temp.directive';
import { EspecialTempDirective } from './directives/especial-temp.directive';
import { InputArrayExComponent } from './input-array-ex/input-array-ex.component';
import { InputExComponent } from './input-ex/input-ex.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';




@NgModule({
  declarations: [
    InputExComponent,
    InputArrayExComponent,
    EspecialTempDirective,
    TitleTempDirective,
    ItemTempDirective,
    InputDropdownNumberComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ClarityModule
  ],
  exports: [
    InputExComponent,
    InputArrayExComponent,
    InputDropdownNumberComponent,
    EspecialTempDirective,
    TitleTempDirective,
    ItemTempDirective
  ]
})
export class UiComponentLibraryModule { }
