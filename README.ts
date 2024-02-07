@ViewChildren('gshLevelButton', { read: ElementRef }) gshLevelElementRef!: QueryList<ElementRef<HTMLDivElement>>;
  @ViewChildren('dropdownButton', { read: ElementRef }) dropdownElementRef!: QueryList<ElementRef<HTMLDivElement>>;
  @ViewChildren('childCmp', { read: GshSelectorComponent }) childCmp!: QueryList<GshSelectorComponent>;

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

private loadGSHLevels(): void {
    // this.metricsService.gshSelector('TOTALS,FI', 4).subscribe((response) => {
      console.log(selectorData);
      const res = [selectorData];
      let i = 0;
      res.forEach((resu) => {
        Object.keys(resu).forEach((result) => {
          this.gshValues.push(this.formatLevels(new Map<string, Object>().set(result, Object.values(resu)[i])));
          i++;
        });
        console.log(this.gshValues);
      });
      console.log('res', res);
    // });
  }

private formatLevels(level: Map<string, Object>): GSH {
    const gsh = <GSH>{
      value: '',
      children: []
    };
    
    gsh.value = level.keys().next().value;
    gsh.children = [];
    const children = level.values().next().value;
    const childMap = new Map<string, Object>(Object.entries(children));
    if (!children) {
      return gsh;
    }

    const childCondition = Object.keys(children).length;
    if (childCondition > 0) {
      Object.keys(children).forEach((key) => gsh.children.push(this.formatLevels(new Map().set(key, childMap.get(key)))));
    }

    return gsh;
  }


private formatLevels(level: Map<string, Object>): GSH {
    const gsh = <GSH>{};
    gsh.value = level.keys().next().value;
    gsh.children = [];
    const children = level.values().next().value;
    const childMap = new Map<string, Object>(Object.entries(children));
    if (!children) {
      return gsh;
    }

    const childCondition = Object.keys(children).length;
    if (childCondition > 0) {
      Object.keys(children).forEach((key) => gsh.children.push(this.formatLevels(new Map().set(key, childMap.get(key)))));
    }

    return gsh;
  }


private formatLevels(level: Map<string, MyNode>): GSH {
  const gsh: GSH = {
    value: '',
    children: []
  };

  const firstEntry = level.entries().next().value;

  if (!firstEntry) {
    return gsh;
  }

  const [key, currentNode] = firstEntry;

  gsh.value = currentNode.key;

  if (currentNode.children) {
    currentNode.children.forEach((childNode, childKey) => {
      const childMap = new Map<string, MyNode>().set(childKey, childNode);
      gsh.children.push(this.formatLevels(childMap));
    });
  }

  return gsh;
}

https://gitlab.aws.site.gs.com/wf/mwp-ui/gs-ux-uitoolkit/-/blob/master/components/popover/angular/src/popover.directive.ts

import {
    Directive,
    Input,
    AfterViewInit,
    ComponentRef,
    ElementRef,
    TemplateRef,
    NgZone,
    Output,
    EventEmitter,
    Renderer2,
    ApplicationRef,
    ChangeDetectorRef,
    ComponentFactoryResolver,
    Injector,
} from '@angular/core';
import tippy, { Props, Instance } from 'tippy.js';
import {
    type PopoverProps,
    popoverStyleSheet,
    PopoverCssClasses,
    getPopoverRootClasses,
} from './common-src';
import {
    GsPopoverInputs,
    createTippyOptions,
    addClasses,
    tippyStyleSheet,
    TippyCssClasses,
} from './common-base-src';
import { ThemeService } from '@gs-ux-uitoolkit-angular/theme';
import { Subscription } from 'rxjs';
import { IconComponent } from '@gs-ux-uitoolkit-angular/icon-font';
import { PopoverContentComponent } from './popover-content.component';
import { componentAnalytics } from './analytics-tracking';
import { uniqueId } from 'gs-uitk-lodash';

type TippyProps = Pick<Props, 'content'> & Partial<Props>;

/**
 * Popovers display informative text in temporary windows.
 * Popovers usually have a header and a content body.
 */
@Directive({
    selector: '[gsPopover]',
    exportAs: 'gsPopover',
})
export class Popover implements AfterViewInit {
    /**
     * Content to display in popover body
     */
    @Input() gsPopoverBody: undefined | string | TemplateRef<any>;
    /**
     * Content to display in popover header
     */
    @Input() gsPopoverHeader: undefined | string | TemplateRef<any>;
    @Input() gsPopoverSize: PopoverProps['size'] = 'md';
    @Input() gsPopoverPlacement: PopoverProps['placement'] = 'auto';
    @Input() gsPopoverShowTip: PopoverProps['showTip'] = true;
    @Input() gsPopoverDismissible: PopoverProps['dismissible'] = false;
    @Input() gsPopoverShowDelay: PopoverProps['showDelay'] = 0;
    @Input() gsPopoverHideDelay: PopoverProps['hideDelay'] = 0;
    @Input() gsPopoverTriggers: PopoverProps['triggers'];
    @Input() gsPopoverClass: PopoverProps['className'] = '';
    @Input() gsPopoverClasses?: PopoverProps['classes'];
    @Input() gsPopoverFade: PopoverProps['fade'] = false;
    @Input() gsPopoverFlip: PopoverProps['flip'] = true;
    @Input() gsPopoverContainer: PopoverProps['container'];
    @Input() set gsPopoverVisible(visible: PopoverProps['visible']) {
        if (visible) {
            this.show();
        } else {
            this.hide();
        }
    }

    /**
     * Event emitted when the popover is shown.
     */
    @Output() gsPopoverShow = new EventEmitter();

    /**
     * Event emitted when the popover is hidden.
     */
    @Output() gsPopoverHide = new EventEmitter();

    /**
     * Event emitted before the popover is shown.
     */
    @Output() gsPopoverBeforeShow = new EventEmitter();

    /**
     * Event emitted before the popover is hidden.
     */
    @Output() gsPopoverBeforeHide = new EventEmitter();

    /**
     * The CSS-in-JS classes for the component, as a result of mounting the JsStyleSheet.
     */
    public cssClasses!: PopoverCssClasses;

    public tippyCssClasses!: TippyCssClasses;

    public tippyContainerClass!: string;

    private themeSubscription: Subscription;

    /**
     * Shows the popover.
     * Consider using in conjunction with "manual" trigger property.
     * @public
     */
    public show() {
        this.instance && this.instance.show();
    }

    /**
     * Hides the popover.
     * Consider using in conjunction with "manual" trigger property.
     * @public
     */
    public hide() {
        this.instance && this.instance.hide();
    }

    /**
     * Toggles the popover.
     * Consider using in conjunction with "manual" trigger property.
     * @public
     */
    public toggle() {
        if (this.instance) {
            this.isVisible() ? this.instance.hide() : this.instance.show();
        }
    }

    /**
     * Boolean to indicate if popover is currently shown.
     * @public
     */
    public isVisible() {
        return this.instance && this.instance.state.isVisible;
    }

    // instance of popover created by this class
    private instance: Instance<TippyProps> | null = null;

    private closeButtonRef!: ComponentRef<IconComponent>;

    constructor(
        private hostElementRef: ElementRef,
        private zone: NgZone,
        private renderer: Renderer2,
        private themeService: ThemeService,
        private appRef: ApplicationRef,
        private componentFactoryResolver: ComponentFactoryResolver,
        private changeDetectorRef: ChangeDetectorRef,
        private injector: Injector
    ) {
        this.themeSubscription = this.themeService.theme$.subscribe(() => {
            this.updateTheme();
            this.changeDetectorRef.markForCheck();
        });
    }

    private updateTheme() {
        const theme = this.themeService.getTheme();
        this.tippyCssClasses = tippyStyleSheet.mount(this, { theme: theme });
        this.tippyContainerClass = getPopoverRootClasses({
            tippyCssClasses: this.tippyCssClasses,
            className: this.gsPopoverClass,
            overrideClasses: this.gsPopoverClasses,
        });
        if (this.instance) {
            const container = this.instance.popper.firstElementChild!;
            container.removeAttribute('class');
            addClasses(container, this.tippyContainerClass);
        }
    }

    public ngOnDestroy() {
        popoverStyleSheet.unmount(this);
        tippyStyleSheet.unmount(this);
        this.themeSubscription.unsubscribe();
        if (this.closeButtonRef) {
            this.closeButtonRef.destroy();
        }
    }

    // attaches an instance of 'tippy' popover to the host element on which the gsPopover is defined
    ngAfterViewInit() {
        const hostElement = this.hostElementRef.nativeElement;

        if (this.gsPopoverBody == null && this.gsPopoverHeader == null) {
            throw new Error(
                `gsPopover: No content found for popover to show.` +
                    `Please provide string or TemplateRef to [gsPopover] defined on element ${hostElement.outerHTML}`
            );
        }

        // used to identify popover using the host element
        const popoverId = uniqueId('gs-uitk-popover-');
        this.renderer.setAttribute(hostElement, 'data-gs-uitk-popover-id', popoverId);

        // run outside of angular zone to avoid events registered by tippy to trigger change detection cycles
        this.zone.runOutsideAngular(() => {
            // tippy() returns single instance or array of instances; in this case, we know it is a single instance
            this.instance = tippy(
                hostElement,
                this.getTippyOptions(popoverId)
            ) as unknown as Instance<TippyProps>;
            this.updateTheme();
        });
        componentAnalytics.trackRender({ officialComponentName: 'popover' });
    }

    /**
     * Sets options specific to tippy.js popover
     */
    private getTippyOptions(id: string): TippyProps {
        const theme = this.themeService.getTheme();
        this.cssClasses = popoverStyleSheet.mount(this, { size: this.gsPopoverSize, theme });

        const options: GsPopoverInputs = {
            id: id,
            size: this.gsPopoverSize!,
            placement: this.gsPopoverPlacement,
            showTip: this.gsPopoverShowTip,
            hideDelay: this.gsPopoverHideDelay,
            showDelay: this.gsPopoverShowDelay,
            dismissible: this.gsPopoverDismissible,
            flip: this.gsPopoverFlip,
            fade: this.gsPopoverFade,
            container: this.gsPopoverContainer,
            classes: this.gsPopoverClasses,
            triggers: this.gsPopoverTriggers,
            onShow: () => this.gsPopoverShow.emit(),
            onHide: () => this.gsPopoverHide.emit(),
            onBeforeShow: () => this.gsPopoverBeforeShow.emit(),
            onBeforeHide: () => this.gsPopoverBeforeHide.emit(),
        };

        return {
            ...createTippyOptions('popover', options, this.cssClasses),
            content: this.getPopoverContent(),
        };
    }

    /**
     * Creates a div element containing contents that the popover would show.
     * A PopoverContentComponent is dynamically created that handles string or
     * templateRef bindings for the header and footer
     */
    private getPopoverContent() {
        // Create an instance of PopoverContentComponent using component factory
        // resolver.
        const popoverContentRef = this.componentFactoryResolver
            .resolveComponentFactory(PopoverContentComponent)
            .create(this.injector);

        // Set the values that were passed through the gsPopover directive
        popoverContentRef.instance.cssClasses = this.cssClasses;
        popoverContentRef.instance.gsPopoverBody = this.gsPopoverBody;
        popoverContentRef.instance.gsPopoverHeader = this.gsPopoverHeader;
        popoverContentRef.instance.gsPopoverDismissible = this.gsPopoverDismissible;
        popoverContentRef.instance.gsPopoverClasses = this.cssClasses;

        // Attach the element to ApplicationRef to ensure this stays in the zone
        // and it's lifecycle is managed by angular
        this.appRef.attachView(popoverContentRef.hostView);

        // Create a new div and append the popoverContent's native element. This div
        // will be controlled and styled by Tippy as defined in popover-base
        const popoverTippyDiv = document.createElement('div');
        popoverTippyDiv.appendChild(popoverContentRef.instance.elementRef.nativeElement);

        // Trigger a change detection to ensure all the values are passed to the
        // dynamically component and it gets rendered on the DOM
        this.changeDetectorRef.detectChanges();

        return popoverTippyDiv;
    }
}
