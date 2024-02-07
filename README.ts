import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { ButtonModule } from '@gs-ux-uitoolkit-angular/button';
import { colors } from '@gs-ux-uitoolkit-common/design-system';
import { CommonModule } from '@angular/common';
import { CssClasses, StyleSheet } from '@gs-ux-uitoolkit-common/style';
import { ESGMetricsService } from '../esg-dashboard/esg-metrics.service';
import { FIConstants } from '@gsam-fi/common';
import { FiPixels } from '@gsam-fi/common/design-system';
import { IconModule } from '@gs-ux-uitoolkit-angular/icon-font';
import { LabelModule } from '@gs-ux-uitoolkit-angular/label';
import { MenuModule } from '@gs-ux-uitoolkit-angular/menu';
import { PopoverModule } from '@gs-ux-uitoolkit-angular/popover';
import { QueryFieldComponent } from '@gs-ux-uitoolkit-angular/queryfield';
import { selectorData } from './gsh-selector-data';
import { TreeModule } from '@gs-ux-uitoolkit-angular/tree';

const overrideStyleSheet = new StyleSheet('gsh-label-override', {
  label: { color: colors.gray060, backgroundColor: colors.gray020, paddingLeft: FiPixels.SIXTEEN, marginBottom: FiPixels.ZERO },
});

export interface GSH {
  value: string;
  children: GSH[];
  clicked?: boolean;
}

@Component({
  selector: 'metrics-gsh-selector',
  templateUrl: 'gsh-selector.component.html',
  styleUrls: ['./gsh-selector.component.scss'],
  imports: [ButtonModule, CommonModule, IconModule, LabelModule, PopoverModule, TreeModule, MenuModule],
  standalone: true,
})
export class GshSelectorComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() queryfieldRef!: QueryFieldComponent;
  @Input() expanded: boolean | undefined;
  @Input() gshLevel: number = 3; //replace with enum
  @Input() gshChildren: GSH[] | undefined;
  @Output() readonly predicateFilterChanged: EventEmitter<string> = new EventEmitter();
  @Output() readonly outOfBounds: EventEmitter<{ direction: string; currentSelected: number; onDropdown: boolean }> = new EventEmitter();
  @ViewChildren('gshLevelButton', { read: ElementRef }) gshLevelElementRef!: QueryList<ElementRef<HTMLDivElement>>;
  @ViewChildren('dropdownButton', { read: ElementRef }) dropdownElementRef!: QueryList<ElementRef<HTMLDivElement>>;
  @ViewChildren('childCmp', { read: GshSelectorComponent }) childCmp!: QueryList<GshSelectorComponent>;
  gshLevelLabel: string | undefined;
  gshValues: GSH[] = [];
  selectedHasChildren: boolean | undefined;
  parent: GSH | undefined;
  overrideClasses!: CssClasses<typeof overrideStyleSheet>;
  parentPosition!: number;
  prevSelected: GSH | undefined;
  onDropdown!: boolean;
  expandedNodes: { [level: number]: boolean } = {};
  // queryfieldRef!: QueryFieldComponent;

  constructor(private readonly metricsService: ESGMetricsService) {}

  //this will be called for every child component
  ngOnInit(): void {
    this.overrideClasses = overrideStyleSheet.mount(this, FIConstants.NULL);
    // this.gshValues = this.store$.pipe(select(this.gshLevel));
    this.gshLevelLabel = `L${this.gshLevel}`;
    // this.gshValues = this.findGSHLevel(this.getGSH(), this.gshLevel); // gives { Agency: {}, ... ]}

    if (this.gshChildren) {
      this.gshValues = this.gshChildren;
    }

    if (!this.gshLevel) {
      this.gshLevel = 3;
    }

    this.onDropdown = true;

    if (this.gshValues.length === 0) {
      this.loadGSHLevels();
    }
  }

  private loadGSHLevels(): void {
    // this.metricsService.gshSelector('TOTALS,FI', 4).subscribe((response) => {
    console.log(selectorData);
    const res = [selectorData];
    let i = 0;
    res.forEach((resu) => {
      Object.keys(resu).forEach((result) => {
        this.gshValues.push(this.formatLevels(new Map<string, object>().set(result, Object.values(resu)[i])));
        i++;
      });
      console.log(this.gshValues);
    });
    console.log('res', res);
    // });
  }

  private formatLevels(level: Map<string, object>): GSH {
    const gsh = <GSH>{
      value: '',
      children: [],
    };

    gsh.value = level.keys().next().value;
    gsh.children = [];
    const children = level.values().next().value as object;
    const childMap = new Map<string, object>(Object.entries(children));
    if (!children) {
      return gsh;
    }

    const childCondition = Object.keys(children).length;
    if (childCondition > 0) {
      Object.keys(children).forEach((key) => gsh.children.push(this.formatLevels(new Map<string, object>().set(key, childMap.get(key) || {}))));
    }

    return gsh;
  }

  // to run on first
  ngAfterViewInit(): void {
    this.focusFirstChild(this.parentPosition, true);
  }

  selectLevel(selectedGSH: GSH, gshLevel: number): void {
    if (this.queryfieldRef) {
      // this.predicateFilterChanged.emit(`${selectedGSH.value  } (L${gshLevel})`);
      this.queryfieldRef.updateCurrentPredicate({
        rightOperand: `${selectedGSH.value} (L${gshLevel})`,
      });
    }
  }

  //to run on all after
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.expanded.currentValue && this.expanded && this.dropdownElementRef?.length) {
      this.focusFirstChild(this.parentPosition, this.onDropdown);
    }
  }

  //called by afterView + onChanges
  focusFirstChild(parentPosition = 0, onDropdown = false): void {
    this.parentPosition = parentPosition;

    if (onDropdown) {
      this.dropdownElementRef.get(0)?.nativeElement.focus();
    } else {
      this.gshLevelElementRef.get(0)?.nativeElement.focus();
    }
  }

  // new clicked logic
  selectDropdown(gsh: GSH, currentSelected: number, dropdownButtonRef: HTMLDivElement) {
    if (this.onDropdown) {
      let currentClosed = false;
      //check if any others are expanded and if so close them
      for (const expanded in this.expandedNodes) {
        if (this.expandedNodes[expanded]) {
          if (this.gshValues[expanded] === gsh) {
            currentClosed = true;
          }
          this.expandedNodes[expanded] = false;
          this.gshValues[expanded].clicked = false;
        }
      }

      if (currentClosed) {
        return;
      }

      // breaks those above childless
      dropdownButtonRef.click();
      gsh.clicked = true;
      this.expandedNodes[currentSelected] = true;
    } else {
      this.gshLevelElementRef.get(currentSelected)?.nativeElement.click();
    }
  }

  detectOutOfBounds($event: { direction: string; currentSelected: number; onDropdown: boolean }): void {
    if ($event.direction === 'down') {
      if ($event.onDropdown) {
        this.dropdownElementRef.get($event.currentSelected + 1)?.nativeElement.focus();
      } else {
        this.gshLevelElementRef.get($event.currentSelected + 1)?.nativeElement.focus();
      }
    } else if ($event.direction === 'up') {
      if ($event.onDropdown) {
        this.dropdownElementRef.get($event.currentSelected)?.nativeElement.focus();
      } else {
        this.gshLevelElementRef.get($event.currentSelected)?.nativeElement.focus();
      }
    }
  }

  navigateSelector($event: KeyboardEvent, gsh: GSH, currentSelected: number, dropdownButton?: HTMLDivElement): void {
    $event.preventDefault();

    if (!this.gshLevelElementRef) {
      return;
    }

    switch ($event.code) {
      case 'Enter':
        $event?.stopPropagation();
        if (dropdownButton) {
          this.selectDropdown(gsh, currentSelected, dropdownButton);
        }
        break;

      case 'ArrowDown':
        console.log(this.childCmp.get(currentSelected));
        if (this.expandedNodes[currentSelected] && this.childCmp.get(currentSelected)) {
          this.childCmp.get(currentSelected - (this.gshLevelElementRef.length - this.childCmp.length))?.focusFirstChild(currentSelected, this.onDropdown);
          this.childCmp.get(currentSelected - (this.gshLevelElementRef.length - this.childCmp.length))!.onDropdown = this.onDropdown;
          break;
        }

        //check if needed
        // case where dropdowns and level indexes are out of sync
        if (!this.childCmp.get(currentSelected)) {
          this.childCmp.get(currentSelected - this.dropdownElementRef.length)?.focusFirstChild(currentSelected, false);
          break;
        }

        if (currentSelected + 1 > this.gshValues.length - 1) {
          this.outOfBounds.emit({ direction: 'down', currentSelected: this.parentPosition, onDropdown: this.onDropdown });
          break;
        }

        //if on dropdown button get by dropdown ref
        if (this.onDropdown) {
          this.dropdownElementRef.get(currentSelected + 1)?.nativeElement.focus();
        } else {
          this.gshLevelElementRef.get(currentSelected + 1)?.nativeElement.focus();
        }

        break;

      case 'ArrowUp':
        //check if on first dropdown
        console.log(this.dropdownElementRef.length);
        console.log(this.gshValues);
        if (!this.dropdownElementRef.get(currentSelected - 1) && this.dropdownElementRef.length > 0) {
          const tempOnDropdown = this.onDropdown;
          this.onDropdown = true;
          this.outOfBounds.emit({ direction: 'up', currentSelected: this.parentPosition, onDropdown: tempOnDropdown });
          break;
        }

        if (currentSelected - 1 < 0) {
          if (this.dropdownElementRef.length === 0) {
            this.outOfBounds.emit({ direction: 'up', currentSelected: this.parentPosition, onDropdown: false });
          } else {
            //don't need this? - covered in first logic at top
            const tempOnDropdown = this.onDropdown;
            this.onDropdown = true;
            this.outOfBounds.emit({ direction: 'up', currentSelected: this.parentPosition, onDropdown: tempOnDropdown });
          }
          break;
        }

        if (this.onDropdown) {
          this.dropdownElementRef.get(currentSelected - 1)?.nativeElement.focus();
        } else {
          this.gshLevelElementRef.get(currentSelected - 1)?.nativeElement.focus();
        }

        break;

      case 'ArrowLeft':
        if (this.dropdownElementRef.length !== this.gshLevelElementRef.length) {
          if (this.dropdownElementRef.length === 0) {
            break;
          }
          this.dropdownElementRef.get(currentSelected - this.dropdownElementRef.length)?.nativeElement.focus();
        }
        this.dropdownElementRef.get(currentSelected)?.nativeElement.focus();
        this.onDropdown = true;

        break;

      case 'ArrowRight':
        this.gshLevelElementRef.get(currentSelected)?.nativeElement.focus();
        this.onDropdown = false;

        break;

      default:
        break;
    }
  }
}
