import { NgModule } from '@angular/core';
import { InputDropdownNumberComponent } from './input-dropdown-number/input-dropdown-number.component';
import { ItemTempDirective } from './directives/item-temp.directive';
import { TitleTempDirective } from './directives/title-temp.directive';
import { EspecialTempDirective } from './directives/especial-temp.directive';
import { InputArrayExComponent } from './input-array-ex/input-array-ex.component';
import { InputExComponent } from './input-ex/input-ex.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule, ClrPopoverToggleService } from '@clr/angular';
import { DropdownExComponent } from './dropdown-ex/dropdown-ex.component';

@NgModule({
  declarations: [
    InputExComponent,
    InputArrayExComponent,
    DropdownExComponent,
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
    DropdownExComponent,
    InputDropdownNumberComponent,
    EspecialTempDirective,
    TitleTempDirective,
    ItemTempDirective
  ],
  providers: [
    ClrPopoverToggleService
  ]
})
export class UiComponentLibraryModule {
}
