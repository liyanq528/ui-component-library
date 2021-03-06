import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { CheckSelfValid, InputExCategory, InputExStatus, InputExType } from '../shared.types';
import { Subscription } from 'rxjs';
import { UiComponentLibraryService } from '../ui-component-library.service';

export class CustomInputExValidators {
  static passwordValidate(c: AbstractControl): ValidationErrors | null {
    const sourceElement: HTMLCollectionOf<Element> = document.getElementsByClassName('source-password');
    const verifyElement: HTMLCollectionOf<Element> = document.getElementsByClassName('verify-password');
    if (sourceElement && sourceElement.length > 0 && verifyElement && verifyElement.length > 0) {
      const source = (sourceElement.item(0) as HTMLInputElement).value;
      const verify = (verifyElement.item(0) as HTMLInputElement).value;
      if (source !== '' && verify !== '') {
        return source === verify ? null : {verifyPassword: 'verify-password'};
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
}

@Component({
  selector: 'lib-input-ex',
  templateUrl: './input-ex.component.html',
  styleUrls: ['./input-ex.component.css']
})
export class InputExComponent implements OnInit, CheckSelfValid, OnDestroy {
  private isDisabled = false;
  private revertValue: number | string;
  @Input() inputIsRequired = false;
  @Input() inputCategory = InputExCategory.iecString;
  @Input() inputLabelWidth = 180;
  @Input() inputWidth = '100%';
  @Input() inputLabel = '';
  @Input() inputType = InputExType.ietNormal;
  @Input() inputPattern: RegExp;
  @Input() inputMaxlength = 0;
  @Input() inputMinlength = 0;
  @Input() inputMax = 0;
  @Input() inputMin = 0;
  @Input() inputPlaceholder = '';
  @Input() sourcePassword = false;
  @Input() verifyPassword = false;
  @Input() validatorFns: Array<ValidatorFn>;
  @Input() validatorAsyncFn: AsyncValidatorFn;
  @Input() validatorMessage: Array<{ key: string, message: string }>;
  @Input() inputUpdateOn: 'change' | 'blur' | 'submit' = 'blur';
  @Input() toolTipPosition = 'bottom-left';
  @Input() toolTipSize: 'sm' | 'lg' | 'xs' | 'md' = 'md';
  @Output() editEvent: EventEmitter<any>;
  @Output() inputEvent: EventEmitter<any>;
  @Output() revertEvent: EventEmitter<any>;
  @Output() commitEvent: EventEmitter<any>;
  @Output() valueChanges: EventEmitter<any>;
  @Output() statusChanges: EventEmitter<any>;
  @ViewChild('input') inputHtml: ElementRef;
  inputStatus: InputExStatus = InputExStatus.iesView;
  inputValidatorParam = '';
  inputFormGroup: FormGroup;
  inputControl: FormControl;
  inputValidatorFns: Array<ValidatorFn>;
  inputValidatorPending = false;
  valueSubscription: Subscription;
  statusSubscription: Subscription;

  constructor(private service: UiComponentLibraryService, private fb: FormBuilder) {
    this.editEvent = new EventEmitter();
    this.revertEvent = new EventEmitter();
    this.commitEvent = new EventEmitter();
    this.valueChanges = new EventEmitter();
    this.inputEvent = new EventEmitter();
    this.statusChanges = new EventEmitter();
    this.validatorMessage = new Array<{ key: string, message: string }>();
    this.inputValidatorFns = new Array<ValidatorFn>();
    this.inputControl = this.fb.control({value: '', disabled: this.isDisabled});
  }

  ngOnInit(): void {
    this.inputFormGroup = this.fb.group({inputControl: this.inputControl}, {updateOn: this.inputUpdateOn});
    this.valueSubscription = this.inputControl.valueChanges.subscribe((value: any) => this.valueChanges.next(value));
    this.statusSubscription = this.inputControl.statusChanges.subscribe((value: any) => {
      this.statusChanges.emit(value);
      if (this.inputControl.valid) {
        this.revertValue = this.inputControl.value;
        const commitValue = this.inputCategory === InputExCategory.iecNumber ?
          Number(this.inputControl.value) : this.inputControl.value;
        this.commitEvent.emit(commitValue);
      }
      if (this.inputValidatorPending) {
        this.onInputBlur();
      }
      this.inputValidatorPending = value === 'PENDING';
    });
    this.installValidators();
  }

  ngOnDestroy(): void {
    this.valueSubscription.unsubscribe();
    this.statusSubscription.unsubscribe();
  }

  @Input()
  set inputDisabled(value: boolean) {
    this.isDisabled = value;
    if (value) {
      this.inputControl.disable();
    } else {
      this.inputControl.enable({emitEvent: false});
    }
  }

  get inputDisabled(): boolean {
    return this.isDisabled;
  }

  @Input() set inputDefaultValue(value: string | number) {
    this.revertValue = value;
    this.unInstallValidators();
    this.inputControl.setValue(value, {emitEvent: false});
    this.installValidators();
    this.inputStatus = InputExStatus.iesView;
  }

  @Input() set inputResetObject(reset: object) {
    if (reset && Reflect.has(reset, 'value')) {
      this.revertValue = Reflect.get(reset, 'value');
      this.unInstallValidators();
      this.inputControl.reset(this.revertValue, {onlySelf: true, emitEvent: false});
      this.installValidators();
    }
  }

  get showLabel(): boolean {
    return this.inputLabel !== '';
  }

  get inputFieldTypeName(): string {
    switch (this.inputCategory) {
      case InputExCategory.iecNumber:
        return 'number';
      case InputExCategory.iecPassword:
        return 'password';
      case InputExCategory.iecEmail:
        return 'email';
      default:
        return 'text';
    }
  }

  getValidatorMessage(errors: ValidationErrors): string {
    if (!errors) {
      return '';
    }
    this.inputValidatorParam = '';
    let result = '';
    this.validatorMessage.forEach(value => {
      if (Reflect.has(errors, value.key)) {
        result = value.message;
      }
    });
    if (result === '') {
      if (Reflect.has(errors, 'required')) {
        result = this.service.isEnglishLang ? 'Input required.' : '字段为必填。';
      } else if (Reflect.has(errors, 'pattern') && this.inputCategory === InputExCategory.iecNumber) {
        result = this.service.isEnglishLang ? 'Only input number.' : '只能输入数字。';
      } else if (Reflect.has(errors, 'pattern') && this.inputCategory === InputExCategory.iecString) {
        result = this.service.isEnglishLang ? 'The input does not conform to the rules.' : '输入不符合规则。';
        this.inputValidatorParam = `:${this.inputPattern}`;
      } else if (Reflect.has(errors, 'maxlength')) {
        result = this.service.isEnglishLang ? `Max length` : '最大长度';
        this.inputValidatorParam = `:${this.inputMaxlength}`;
      } else if (Reflect.has(errors, 'minlength')) {
        result = this.service.isEnglishLang ? `Min length` : '最小长度';
        this.inputValidatorParam = `:${this.inputMinlength}`;
      } else if (Reflect.has(errors, 'max')) {
        result = this.service.isEnglishLang ? `Max` : '最大值';
        this.inputValidatorParam = `:${this.inputMax}`;
      } else if (Reflect.has(errors, 'min')) {
        result = this.service.isEnglishLang ? `Min` : '最小值';
        this.inputValidatorParam = `:${this.inputMin}`;
      } else if (Reflect.has(errors, 'verifyPassword')) {
        result = this.service.isEnglishLang ? `The two passwords are inconsistent` : '两次密码输入不一致';
      } else if (Object.keys(errors).length > 0) {
        result = errors[Object.keys(errors)[0]];
      }
    }
    return result;
  }

  installValidators(): void {
    if (this.validatorFns) {
      this.inputValidatorFns = this.inputValidatorFns.concat(this.validatorFns);
    }
    if (this.inputIsRequired && this.inputType !== InputExType.ietClick) {
      this.inputValidatorFns.push(Validators.required);
    }
    if (this.inputMaxlength > 0) {
      this.inputValidatorFns.push(Validators.maxLength(this.inputMaxlength));
    }
    if (this.inputMinlength > 0) {
      this.inputValidatorFns.push(Validators.minLength(this.inputMinlength));
    }
    if (this.inputMax > 0) {
      this.inputValidatorFns.push(Validators.max(this.inputMax));
    }
    if (this.inputMin > 0) {
      this.inputValidatorFns.push(Validators.min(this.inputMin));
    }
    if (this.inputPattern) {
      this.inputValidatorFns.push(Validators.pattern(this.inputPattern));
    }
    if (this.verifyPassword || this.sourcePassword) {
      this.inputValidatorFns.push(CustomInputExValidators.passwordValidate);
    }
    this.inputControl.setValidators(this.inputValidatorFns);
    if (this.validatorAsyncFn) {
      this.inputControl.setAsyncValidators(this.validatorAsyncFn);
    }
  }

  unInstallValidators(): void {
    this.inputControl.clearValidators();
    this.inputControl.clearAsyncValidators();
  }

  onInputFocus(): void {
    if (this.inputControl.enabled &&
      this.inputStatus === InputExStatus.iesView) {
      this.inputStatus = InputExStatus.iesEdit;
    }
  }

  onRevertClick(): void {
    this.inputStatus = InputExStatus.iesView;
    this.inputControl.reset(this.revertValue);
    this.revertEvent.emit(this.inputControl.value);
  }

  onCommitClick(event: Event): void {
    if (this.inputControl.valid) {
      event.stopPropagation();
      this.inputStatus = InputExStatus.iesView;
    }
  }

  onEditClick(): void {
    if (this.inputControl.enabled) {
      if (this.inputType === InputExType.ietNormal) {
        this.inputHtml.nativeElement.focus();
        if (document.activeElement === this.inputHtml.nativeElement) {
          this.inputStatus = InputExStatus.iesEdit;
          this.editEvent.emit(this.inputControl.value);
        }
      } else {
        this.inputHtml.nativeElement.blur();
        this.editEvent.emit(this.inputControl.value);
      }
    }
  }

  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const commitValue = this.inputCategory === InputExCategory.iecNumber ? inputElement.valueAsNumber : inputElement.value;
    this.inputEvent.emit(commitValue);
  }

  public onInputBlur(): void {
    if (this.inputControl.valid &&
      this.inputStatus === InputExStatus.iesEdit) {
      this.inputStatus = InputExStatus.iesView;
    }
  }

  public checkSelf(): void {
    if (this.inputControl.enabled) {
      (this.inputHtml.nativeElement as HTMLElement).focus();
      this.inputControl.markAsTouched({onlySelf: true});
      this.inputControl.updateValueAndValidity();
    }
  }

  public get isValid(): boolean {
    return this.inputControl.valid && this.inputStatus === InputExStatus.iesView;
  }
}
