import {
  AfterViewInit,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { CheckSelfValid, DropdownExDisabledFn } from '../shared.types';
import { ItemTempDirective } from '../directives/item-temp.directive';
import { InputExComponent } from '../input-ex/input-ex.component';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { UiComponentLibraryService } from '../ui-component-library.service';

@Component({
  selector: 'lib-input-dropdown-number',
  templateUrl: './input-dropdown-number.component.html',
  styleUrls: ['./input-dropdown-number.component.css']
})
export class InputDropdownNumberComponent implements OnInit, CheckSelfValid, AfterViewInit, OnDestroy {
  @ViewChild(InputExComponent) inputComponent: InputExComponent;
  @ViewChild('inputDropdownContainer') inputDropdownContainer: ElementRef;
  @Input() placeholder = '';
  @Input() isRequired = false;
  @Input() max = 0;
  @Input() min = 0;
  @Input() disabled = false;
  @Input() label = '';
  @Input() inUsedNumbers: Array<number>;
  @Input() validatorMessage: Array<{ key: string, message: string }>;
  @Input() menuHeader = '';
  @Input() tip = '';
  @Input() dropdownMinWidth = '100%';
  @Input() labelWidth = 180;
  @Input() activeItem: number;
  @Input() disabledFn: DropdownExDisabledFn;
  @Output() changeItem: EventEmitter<number>;
  @ContentChild(ItemTempDirective) itemTemp: ItemTempDirective;
  showDropdownList = false;
  showDropdownListFromEdit = false;
  inputContent: number;
  dropdownItems: Array<number>;
  itemsContainerWidth = 0;

  constructor(private service: UiComponentLibraryService) {
    this.changeItem = new EventEmitter<number>();
    this.dropdownItems = new Array<number>();
    this.inUsedNumbers = new Array<number>();
    this.validatorMessage = new Array<{ key: string, message: string }>();
  }

  ngOnInit(): void {
    this.prepareDropdownList();
    document.addEventListener('click', this.listenerClick.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.listenerClick.bind(this));
  }

  ngAfterViewInit(): void {
    const container = this.inputDropdownContainer.nativeElement as HTMLDivElement;
    this.itemsContainerWidth = container.offsetWidth - this.labelWidth - 30;
  }

  get selected(): boolean {
    return this.activeItem !== undefined;
  }

  get isCustomTemplate(): boolean {
    return this.itemTemp !== undefined;
  }

  get isDefaultTemplate(): boolean {
    return this.itemTemp === undefined;
  }

  get isEmptyList(): boolean {
    return this.dropdownItems !== undefined && this.dropdownItems.length === 0;
  }

  get isValidInputContent(): boolean {
    return this.inputContent !== undefined && !Number.isNaN(this.inputContent);
  }

  get validInputFunBind(): any {
    return this.validInputFun.bind(this);
  }

  validInputFun(control: AbstractControl): ValidationErrors | null {
    const inputNum = Number(control.value);
    const defaultMessage = this.service.isEnglishLang ? 'The number is in used' : '已经使用';
    return this.inUsedNumbers && this.inUsedNumbers.findIndex(value => value === inputNum) > -1 ?
      {inUsed: defaultMessage} : null;
  }

  listenerClick(event: Event): void {
    event.stopPropagation();
    if (!this.showDropdownListFromEdit) {
      this.showDropdownList = false;
    } else {
      this.showDropdownListFromEdit = false;
    }
  }

  itemActive(item: number): boolean {
    return item === this.activeItem;
  }

  itemDisabled(item: number): boolean {
    if (this.disabledFn) {
      return this.disabledFn(item);
    } else {
      return false;
    }
  }

  changeItemSelect(item: number, event: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.inUsedNumbers.indexOf(item) === -1) {
      if (this.disabledFn) {
        if (!this.disabledFn(item)) {
          this.activeItem = item;
          this.inputContent = item;
          this.changeItem.emit(item);
        }
      } else {
        this.activeItem = item;
        this.inputContent = item;
        this.changeItem.emit(item);
      }
      this.showDropdownListFromEdit = false;
      this.showDropdownList = false;
    }
  }

  validNumberStart(validNumber: number): string {
    const validNumberStr = `${validNumber}`;
    const index = validNumberStr.indexOf(`${this.inputContent}`);
    const from = (this.isValidInputContent && index > -1) ? 0 : -1;
    const len = (this.isValidInputContent && index > -1) ? index : -1;
    return validNumberStr.substr(from, len);
  }

  validNumberMiddle(validNumber: number): string {
    const validNumberStr = `${validNumber}`;
    const index = validNumberStr.indexOf(`${this.inputContent}`);
    const from = (this.isValidInputContent && index > -1) ? validNumberStr.indexOf(`${this.inputContent}`) : -1;
    const len = (this.isValidInputContent && index > -1) ? `${this.inputContent}`.length : -1;
    return validNumberStr.substr(from, len);
  }

  validNumberEnd(validNumber: number): string {
    const validNumberStr = `${validNumber}`;
    const index = validNumberStr.indexOf(`${this.inputContent}`);
    const from = (this.isValidInputContent && index > -1) ? index + `${this.inputContent}`.length : 0;
    return validNumberStr.substr(from);
  }

  isInUsed(validNumber: number): boolean {
    return this.inUsedNumbers.indexOf(validNumber) > -1;
  }

  prepareDropdownList(): void {
    this.dropdownItems.splice(0, this.dropdownItems.length);
    const startNumber = (this.isValidInputContent && (this.inputContent > this.min) && (this.inputContent < this.max)) ?
      this.inputContent - 1 : this.min - 1;
    for (let i = 0; i < 6; i++) {
      const startMin = this.dropdownItems.length > 0 ? this.dropdownItems[this.dropdownItems.length - 1] : startNumber;
      const validValue = this.getNextMinValidNumber(startMin);
      if (validValue > 0) {
        this.dropdownItems.push(validValue);
      }
    }
  }

  getNextMinValidNumber(baseNumber: number): number {
    const result = baseNumber + 1;
    if (result < this.min || result > this.max) {
      return 0;
    }
    return result;
  }

  commitEvent(value: number): void{
    if (value >= this.min && value <= this.max && !this.itemDisabled(value) &&
      (this.inUsedNumbers ? this.inUsedNumbers.findIndex(value1 => value1 === value) === -1 : true)) {
      this.changeItemSelect(value, null);
    }
  }

  inputChanges(value: number): void {
    this.showDropdownList = true;
    this.showDropdownListFromEdit = false;
    this.inputContent = value;
    this.prepareDropdownList();
  }

  editEvent(): void {
    this.showDropdownList = true;
    this.showDropdownListFromEdit = true;
  }

  public checkSelf(): void {
    this.inputComponent.checkSelf();
  }

  public get isValid(): boolean {
    return this.isRequired && !this.disabled ? this.inputComponent.isValid && this.selected : true;
  }
}
