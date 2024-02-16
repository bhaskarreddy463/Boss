import {
    ChangeDetectionStrategy,
    Component,
    Input,
    ViewChild,
    Output,
    EventEmitter,
    SimpleChanges,
    ElementRef,
    HostBinding,
    ChangeDetectorRef,
} from '@angular/core';
import {
    applyPredicateToQuery,
    getActiveMenuOption,
    getDisplayName,
    getNextMenuOptionIndex,
    getNumMenuOptions,
    getPredicatesInQuery,
    getPrevMenuOptionIndex,
    getVisibleMenu,
    removeDimensionPredicateFromQuery,
    removeObjectFromQuery,
    transformPredicatesToFilter,
    type DimensionConfig,
    type DimensionValueConfig,
    type QueryfieldPredicateConfig,
    DisplayNameConfig,
    RightOperand,
    ViewConfig,
    SelectionArguments,
    QueryfieldAPIConfig,
    normalizeAngularFeatures,
    type SortDropdownItems,
    NormalizedQueryfieldPredicateConfig,
    DimensionPredicateCollections,
    QueryChangeEvent,
    normalizeRightOperand,
    normalizeDimension,
    transformPredicateToQueryForm,
    CurrentPredicateConfig,
    dimensionHasSingleOperator,
    dimensionIsSwitch,
    dimensionPredicateCollectionsWithId,
    NOT_EQUAL,
    EQUALS,
    OFF_SWITCH,
    ON_SWITCH,
    RightOperandPrimitive,
    type QueryFieldSize,
    IdentifierConfig,
    DeserializedOption,
    DeserializedOptionCategories,
    FilterConfig,
    getQueryfieldRootClasses,
    getQueryfieldContainerClasses,
    QueryfieldCssClasses,
    queryfieldStyleSheet,
    type QueryfieldOverrideClasses,
    getQueryfieldQueryClasses,
    getQueryfieldDimensionPredicateCollectionsClasses,
    getQueryfieldInputIconClasses,
    getQueryfieldDimensionPredicateCollectionContainerClasses,
    getQueryfieldDimensionPredicateCollectionClasses,
    getQueryfieldDpcNameClasses,
    getQueryfieldDpcPredicatesClasses,
    getQueryfieldDpcPredicateClasses,
    getQueryfieldPredicateOperatorClasses,
    getQueryfieldRightOperandClasses,
    getQueryfieldItemRemoveIconClasses,
    getQueryfieldBuildingPredicateLeftOperandClasses,
    getQueryfieldBuildingPredicateOperatorClasses,
    getQueryfieldDropdownClasses,
    getQueryfieldFreeInputClasses,
    getQueryfieldDropdownMenuClasses,
    getQueryfieldDropdownWarningClasses,
    getQueryfieldDropdownHeaderClasses,
    getQueryfieldDropdownItemClasses,
    getQueryfieldRemoveIconContainerClasses,
    getQueryfieldRemoveIconClasses,
} from './common-src';
import { type IconBaseProps } from '@gs-ux-uitoolkit-angular/icon-font';
// tslint:disable-next-line:import-name
import { KeyHelpers, throttle } from '@gs-ux-uitoolkit-angular/shared';
import { AnalyticsDetails } from '@gs-ux-uitoolkit-angular/analytics';
import { Subscription } from 'rxjs';
import { componentAnalytics } from './analytics-tracking';
import { ThemeService } from '@gs-ux-uitoolkit-angular/theme';

// tslint:disable-next-line:import-name

/**
 * Queryfield combines features of a data filter with a search and lookup field.
 * This particular component allows the user to query a search result with any and
 *    all combinations of free-form text along with a set of predetermined filter terms.
 *
 * @visibleName QueryField
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'gs-queryfield',
    host: {
        'data-gs-uitk-component': 'queryfield',
    },
    template: `
        <gs-row>
            <gs-col>
                <div
                    #queryfieldContainer
                    data-cy="gs-uitk-queryfield__queryfield-container"
                    tabindex="-1"
                    [class]="getContainerClasses(selectionInfo.selectedCollectionId !== undefined)"
                    (click)="toggleMenu(true)"
                    (focus)="toggleMenu(true)"
                    (blur)="toggleMenu(false); toggleSelection(false)"
                    (keydown)="handleQueryFieldKeyDown($event)"
                    (keyup)="handleQueryFieldKeyUp()"
                >
                    <div
                        [class]="getQueryClasses()"
                        data-cy="gs-uitk-queryfield__queryfield-border"
                    >
                        <ul [class]="getDimensionPredicateCollectionsClasses()">
                            <div [class]="getInputIconClasses()">
                                <gs-icon
                                    [icon]="icon"
                                    class="{{ iconClassName }} search-icon"
                                    aria-hidden="true"
                                    data-cy="gs-uitk-queryfield__icon"
                                ></gs-icon>
                            </div>
                            <div
                                [class]="getDimensionPredicateCollectionContainerClasses()"
                                (click)="focusInput()"
                                data-cy="gs-uitk-queryfield__dimension-predicate-collection-ctr"
                            >
                                <!--<dimension-predicate-collection></dimension-predicate-collection>-->
                                <li
                                    *ngFor="let dpc of dimensionPredicateCollections"
                                    [class]="
                                        getDimensionPredicateCollectionClasses(
                                            selectionInfo.selectedCollectionId === dpc.id
                                        )
                                    "
                                    data-cy="gs-uitk-queryfield__dimension-predicate-collection"
                                >
                                    <span
                                        [class]="getDpcNameClasses()"
                                        data-cy="gs-uitk-queryfield__leftOperand"
                                        >{{ getDimensionConfig(dpc).displayText }}</span
                                    >
                                    <ul [class]="getDpcPredicatesClasses()">
                                        <!--<Predicate></Predicate> -->
                                        <ng-container
                                            *ngIf="!dimensionExistsAndIsSwitch(dpc.dimensionName)"
                                        >
                                            <li
                                                [class]="getDpcPredicateClasses()"
                                                *ngFor="let p of dpc.predicates"
                                            >
                                                <!--<Operator></Operator>-->
                                                <span
                                                    [class]="getPredicateOperatorClasses()"
                                                    data-cy="gs-uitk-queryfield__operator"
                                                    >{{ p.operator }}</span
                                                >

                                                <!--<RightOperand></RightOperand>-->
                                                <span
                                                    [class]="getRightOperandClasses()"
                                                    data-cy="gs-uitk-queryfield__rightOperand"
                                                    >{{ p.rightOperand.operand1.displayText }}</span
                                                >

                                                <!--<Operator></Operator>-->
                                                <span
                                                    *ngIf="!!p.rightOperand.operand2"
                                                    [class]="getPredicateOperatorClasses()"
                                                    data-cy="gs-uitk-queryfield__operator"
                                                >
                                                    and</span
                                                >

                                                <!--<RightOperand></RightOperand>-->
                                                <span
                                                    *ngIf="!!p.rightOperand.operand2"
                                                    [class]="getRightOperandClasses()"
                                                    data-cy="gs-uitk-queryfield__rightOperand"
                                                    >{{ p.rightOperand.operand2.displayText }}</span
                                                >
                                            </li>
                                        </ng-container>
                                        <span
                                            [class]="
                                                getItemRemoveIconClasses(
                                                    !!dimensionExistsAndIsSwitch(dpc.dimensionName)
                                                )
                                            "
                                            (click)="
                                                remove({
                                                    dimensionPredicateCollectionId: dpc.id,
                                                    predicateId: null
                                                })
                                            "
                                            data-cy="gs-uitk-queryfield__remove"
                                        >
                                            <gs-icon name="close" type="filled"></gs-icon>
                                        </span>
                                    </ul>
                                </li>

                                <!--<buildingPredicate></buildingPredicate>-->
                                <li
                                    *ngIf="currentPredicate.leftOperand"
                                    [class]="getBuildingDimensionPredicateCollectionClasses()"
                                    data-cy="gs-uitk-queryfield__building-predicate"
                                >
                                    <span [class]="getBuildingPredicateLeftOperandClasses()">{{
                                        getBuildingPredicateDisplayName({
                                            name: currentPredicate.leftOperand,
                                            dimensions: dimensions
                                        })
                                    }}</span>

                                    <span
                                        *ngIf="currentPredicate.operator"
                                        [class]="getBuildingPredicateOperatorClasses()"
                                        >{{
                                            getBuildingPredicateDisplayName({
                                                name: currentPredicate.operator,
                                                dimensions: dimensions
                                            })
                                        }}</span
                                    >
                                    <!--If and only if there is a rightOperand means that a between predicate is being built-->
                                    <span
                                        *ngIf="currentPredicate.rightOperand"
                                        [class]="getBuildingPredicateOperatorClasses()"
                                        >{{
                                            currentPredicate.rightOperand.operand1.displayText
                                        }}</span
                                    >

                                    <span
                                        *ngIf="currentPredicate.rightOperand"
                                        [class]="getBuildingPredicateOperatorClasses()"
                                        >and</span
                                    >
                                </li>

                                <!--<free-input></free-input>-->
                                <div
                                    [class]="getDropdownClasses(shouldDisplayConstructionMenu())"
                                    data-cy="gs-uitk-queryfield__dropdown"
                                >
                                    <div #childWrapper>
                                        <ng-content
                                            select="gs-queryfield-custom-input"
                                        ></ng-content>
                                    </div>
                                    <input
                                        *ngIf="shouldDisplayConstructionMenu() || !hasCustomInput()"
                                        #freeInput
                                        [class]="getFreeInputClasses()"
                                        value="{{ freeInputValue }}"
                                        (focus)="toggleMenu(true)"
                                        (blur)="toggleMenu(false); toggleSelection(false)"
                                        (input)="handleFreeInputChange($event)"
                                        [placeholder]="getFreeTextPlaceHolder()"
                                        data-cy="gs-uitk-queryfield__free-input"
                                    />
                                    <ul
                                        *ngIf="shouldDisplayConstructionMenu()"
                                        [class]="getDropdownMenuClasses()"
                                        data-cy="gs-uitk-queryfield__dropdown-menu"
                                    >
                                        <div
                                            *ngIf="displayDropdownWarning"
                                            [class]="getDropdownMenuWarningClasses()"
                                        >
                                            <gs-icon
                                                name="warning"
                                                type="filled"
                                                style="margin-right: 4px"
                                            ></gs-icon>
                                            {{ displayDropdownWarning }}
                                        </div>
                                        <li
                                            class="option-category"
                                            *ngFor="let oc of optionsToDisplay"
                                        >
                                            <div *ngIf="oc.viewConfig && oc.viewConfig.displayText">
                                                <!--<div *ngIf="oc.viewConfig.iconClass" class='icon-background' [style.backgroundColor]="oc.viewConfig.bgColor">-->
                                                <!--<i class="{{oc.viewConfig.iconClass}}"></i>-->
                                                <!--</div>-->
                                                <h3
                                                    [class]="getDropdownHeaderClasses()"
                                                    data-cy="gs-uitk-queryfield__dropdown-header"
                                                >
                                                    {{ getOptionCategoryTitle(oc.viewConfig) }}
                                                </h3>
                                            </div>
                                            <ul style="padding-left: 0px">
                                                <!--<Option></Option> -->
                                                <li
                                                    [class]="getDropdownItemClasses(!!o.isActive)"
                                                    *ngFor="let o of oc.options"
                                                    (click)="
                                                        handleOptionSelection({
                                                            optionType: o.optionType,
                                                            selectionArgs: o.selectionArgs,
                                                            displayText: o.displayText,
                                                            selectMultipleValues: $event.ctrlKey
                                                        })
                                                    "
                                                    data-cy="gs-uitk-queryfield__option"
                                                >
                                                    <span [innerHTML]="renderDisplayText(o)"></span>
                                                </li>
                                                <h3
                                                    [class]="getDropdownHeaderClasses()"
                                                    *ngIf="
                                                        displayedDifference &&
                                                        displayedDifference > 0 &&
                                                        oc.viewConfig
                                                    "
                                                    data-cy="gs-uitk-queryfield__hidden-options-text"
                                                >
                                                    <i> {{ hiddenOptionsText }} </i>
                                                </h3>
                                            </ul>
                                        </li>
                                    </ul>
                                </div>
                                <div
                                    *ngIf="
                                        clearable &&
                                        query.dimensionPredicateCollections.length !== 0
                                    "
                                    data-cy="gs-uitk-queryfield__remove-icon"
                                    title="Remove all pills"
                                    [class]="getRemoveIconContainerClasses()"
                                    (click)="removeAllPills()"
                                >
                                    <gs-icon
                                        name="cancel"
                                        type="filled"
                                        [class]="getRemoveIconClasses()"
                                        aria-hidden="true"
                                    ></gs-icon>
                                </div>
                            </div>
                        </ul>
                    </div>
                </div>
            </gs-col>

            <ng-container *ngIf="debug">
                <queryfield-debug
                    [selectionInfo]="selectionInfo"
                    [freeInputValue]="freeInputValue"
                    [query]="query"
                    [filter]="filter"
                    [currentPredicate]="currentPredicate"
                    [activeOptionIndex]="activeOptionIndex"
                ></queryfield-debug>
            </ng-container>
        </gs-row>
    `,
})
export class QueryFieldComponent {
    public displaySuggestionMenu: boolean = false;
    public query: { dimensionPredicateCollections: DimensionPredicateCollections[] } = {
        dimensionPredicateCollections: [],
    };
    public filter: FilterConfig = {
        value: '',
    };
    public currentPredicate: CurrentPredicateConfig = {
        dimensionPredicateCollectionId: null,
        leftOperand: null,
        operator: null,
        predicateId: null,
        rightOperand: null,
    };
    public activeOptionIndex = 0;
    public dimensionPredicateCollections: DimensionPredicateCollections[] = [];
    public freeInputNode: HTMLInputElement | null = null;
    public freeInputValue = '';
    public optionCategories: DeserializedOptionCategories[] = [];
    public matchStrings: string[] = [];
    public selectionInfo: { selectedCollectionId?: number | null } = {
        selectedCollectionId: undefined,
    };
    public displayDropdownWarning = '';
    public allowKeyDownEvent = true;
    public optionsToDisplay?: DeserializedOptionCategories[];
    public displayedDifference?: number;
    public hiddenOptionsText?: string;

    @HostBinding('class') hostClasses = this.getRootClasses();

    @Input()
    public onQueryChange!: ({
        changeCode,
        predicates,
        filter,
        currentPredicate,
        componentFilter,
        selectedPill,
    }: QueryChangeEvent) => DimensionValueConfig[];
    @Output()
    public instanceCallback: EventEmitter<QueryfieldAPIConfig>;

    /**
     * Array of dimension objects describing available dimension options.
     */
    @Input() public dimensions: DimensionConfig[] = [];

    /**
     * Array of values that can be rendered in the Queryfield.
     */
    @Input() public dimensionValues: DimensionValueConfig[] = [];

    /**
     * Whether free text searches are allowed.
     */
    @Input() public allowFreeTextPredicate = true;

    /**
     * Wait time before a query is processed.
     */
    @Input() public throttleWait: number = 0;

    /**
     * Whether or not to disable creating a new pill when the space key is pressed.
     */
    @Input() public disableCreatePillOnSpace: boolean = false;

    /**
     * Prints the query events to the console so you see what is being passed to/emitted from Queryfield.
     */
    @Input() public debug: boolean = false;

    /**
     * A placeholder to render in the input element.
     */
    @Input() public placeholder?: string = 'Search For...';

    /**
     * Array of initial predicates to be programmatically set on the Queryfield.
     */
    @Input() public predicates: QueryfieldPredicateConfig[] = [];

    /**
     * When not defined or set to `true` (default), QueryField will sort all dropdown menu items
     * alphabetically. When set to `false`, dropdown items will not be sorted; they will appear in
     * the order in which they are passed into Queryfield.
     *
     * Sorting can be defined more granually on dimensions, operators, or values. To do so, set
     * sortDropdownItems to an object with each key set to `true` or `false` depending on whether it
     * should be sorted or not:
     *
     *     {
     *         dimensions: false,
     *         operators: false,
     *         values: true,
     *     }
     */
    @Input() public sortDropdownItems: SortDropdownItems = true;

    /**
     * Whether to automatically select the operator if there is only one (e.g. if 'equals' is the
     *    only operator for the dimension 'City', 'equals' will automatically be selected when
     *    'City' is).
     */
    @Input() public autoSelectSingleOperator: boolean = false;

    /**
     * Whether the QueryField shows in borderless form (to allow wrapping).
     */
    @Input() public borderless: boolean = false;

    /**
     * Whether to embed button that clears all the pills on click inside the QueryField.
     */
    @Input() public clearable: boolean = false;

    /**
     * Icon to display.
     */
    @Input() public icon?: IconBaseProps;

    /**
     * Class used to specify an icon.
     */
    @Input() public iconClassName?: string;

    /**
     * Maximum number of list Items to display for Options (operands and operators) in Queryfield.
     */
    @Input() public maxOptionsToDisplay?: number = 100;

    /**
     * Size of the queryfield input
     */
    @Input() public size: QueryFieldSize = 'md';

    /**
     * Style classes to override.
     */
    @Input() public classes?: QueryfieldOverrideClasses;

    public queryfieldContainer!: HTMLDivElement;

    private cssClasses!: QueryfieldCssClasses;

    @ViewChild('freeInput', { static: false }) public freeInput!: ElementRef<HTMLInputElement>;
    @ViewChild('queryfieldContainer', { static: true })
    public queryfieldContainerRef!: ElementRef<HTMLDivElement>;
    @ViewChild('childWrapper', { static: true }) public childWrapper!: ElementRef<HTMLDivElement>;
    private themeSubscription: Subscription;

    constructor(
        private elementRef: ElementRef,
        private changeDetector: ChangeDetectorRef,
        private themeService: ThemeService
    ) {
        this.instanceCallback = new EventEmitter();

        this.themeSubscription = themeService.theme$.subscribe(() => {
            this.mountStyleSheet();
            this.changeDetector.markForCheck();
        });
    }

    public ngOnInit() {
        this.mountStyleSheet();
        this.dimensionValues = this.dimensionValues || [];
        this.predicates = this.predicates || [];
    }

    public ngAfterViewInit() {
        this.elementRef.nativeElement
            .querySelector('[data-cy="gs-uitk-queryfield__dropdown"]')
            .addEventListener('contextmenu', (event: MouseEvent) => {
                event.preventDefault();
            });
        this.saveFreeInputNode();
        this.saveQueryfieldContainerNode();
        this.broadcastQueryChange = throttle(
            this.broadcastQueryChange.bind(this),
            this.throttleWait
        );
        this.instanceCallback.emit(this.queryfieldApi());
        this.captureComponentAnalytics();
    }

    private captureComponentAnalytics() {
        const features = normalizeAngularFeatures(this);
        componentAnalytics.trackRender({
            features: features as unknown as AnalyticsDetails,
            officialComponentName: 'queryfield',
        });
    }

    public ngOnChanges(changes: SimpleChanges) {
        this.placeholder = this.placeholder != null ? this.placeholder : 'Search For...';
        this.iconClassName = this.iconClassName != null ? this.iconClassName : '';
        this.icon = this.icon != null ? this.icon : { name: 'search', type: 'filled' };
        if (changes.dimensions) {
            const dimensions = changes.dimensions.currentValue;
            if (!dimensions || dimensions.length === 0) {
                throw new Error('dimensions must be an array and have at least one element');
            }
        }
        if (changes.predicates) {
            this.queryfieldApi().setQueryfieldState(changes.predicates.currentValue || []);
        }
        if (changes.allowFreeTextPredicate && changes.allowFreeTextPredicate.currentValue == null) {
            throw new Error('allowFreeTextPredicate must be defined and set to a boolean value');
        }
        if (changes.onQueryChange && changes.onQueryChange.currentValue == null) {
            throw new Error('The onQueryChange function is required to use the queryfield');
        }
        this.updateOptionCategories();
        this.mountStyleSheet();
    }

    ngOnDestroy() {
        this.themeSubscription.unsubscribe();
        queryfieldStyleSheet.unmount(this);
    }

    private mountStyleSheet() {
        const theme = this.themeService.getTheme();
        this.cssClasses = queryfieldStyleSheet.mount(this, { size: this.size, theme });
        this.hostClasses = this.getRootClasses();
    }

    public queryfieldApi() {
        const api = {
            setQueryfieldState: (dpc: QueryfieldPredicateConfig[]) => {
                const normalizeDimensionPredicateCollection = dpc.map(normalizeDimension);

                const dimensionPredicateCollections = dimensionPredicateCollectionsWithId(
                    normalizeDimensionPredicateCollection as NormalizedQueryfieldPredicateConfig[]
                );

                this.query.dimensionPredicateCollections = dimensionPredicateCollections;
                this.dimensionPredicateCollections = dimensionPredicateCollections;
                this.updateFilter({
                    value: '',
                });
            },
            clearQueryfieldState: () => {
                this.query.dimensionPredicateCollections = [];
                this.dimensionPredicateCollections = [];
                this.updateFilter({
                    value: '',
                });
                this.exitOutOfQueryField();
            },
        };
        return api;
    }

    public focusInput() {
        this.freeInputNode!.focus();
    }

    public blurInput() {
        this.freeInputNode!.blur();
    }

    public getBuildingPredicateDisplayName(options: DisplayNameConfig) {
        return getDisplayName(options);
    }

    public shouldDisplayConstructionMenu() {
        const { operator, leftOperand, rightOperand } = this.currentPredicate;
        // If there's a custom input, block the menu from opening if the operator has been seleced
        if (this.hasCustomInput()) {
            return operator === null;
        }

        // Case of selecting dimension
        if (leftOperand === null) {
            return true;
        }

        // Case of selecting an operator
        if (leftOperand !== null && operator === null) {
            return true;
        }

        // Case of selecting a value
        if (operator !== null && rightOperand === null) {
            return true;
        }

        // Case of selecting a second value if using the between operator
        if (operator === 'between' && rightOperand && !rightOperand.operand2) {
            return true;
        }

        return false;
    }

    public hasCustomInput() {
        return !!this.childWrapper.nativeElement.firstElementChild;
    }

    public isRightOperandObject(ro: RightOperand) {
        return typeof ro === 'object';
    }

    public getFreeTextPlaceHolder() {
        if (this.currentPredicate.leftOperand !== null && this.currentPredicate.operator === null) {
            return 'search operator...';
        }

        if (
            this.currentPredicate.operator !== null &&
            this.currentPredicate.rightOperand === null
        ) {
            return 'search value...';
        }

        return this.placeholder;
    }

    public getOptionCategoryTitle(viewConfig: ViewConfig) {
        if (this.currentPredicate.leftOperand !== null && this.currentPredicate.operator === null) {
            return `Search: ${getDisplayName({
                name: this.currentPredicate.leftOperand,
                dimensions: this.dimensions,
            })} `;
        }

        if (
            this.currentPredicate.operator !== null &&
            this.currentPredicate.rightOperand === null
        ) {
            return `Search: ${getDisplayName({
                name: this.currentPredicate.leftOperand,
                dimensions: this.dimensions,
            })} ${this.currentPredicate.operator}`;
        }

        return viewConfig.displayText || 'default';
    }

    public handleOptionSelection({
        optionType,
        selectionArgs,
        displayText,
        selectMultipleValues,
    }: {
        optionType: string;
        selectionArgs: SelectionArguments;
        displayText?: string;
        selectMultipleValues: boolean;
    }) {
        const normalizedDisplayText =
            selectionArgs.leftOperand === 'FREE TEXT' ? this.filter.value : displayText;
        if (optionType === 'dimension') {
            this.handleDimensionOptionSelection(selectionArgs, normalizedDisplayText);
        }
        if (optionType === 'predicate') {
            this.handlePredicateOptionSelection(
                selectionArgs,
                normalizedDisplayText,
                selectMultipleValues
            );
        }
        if (optionType === 'operator') {
            this.handleOperatorOptionSelection(selectionArgs);
        }
    }

    private handleDimensionOptionSelection(
        { dimensionName }: { dimensionName: string },
        displayText: string = dimensionName
    ) {
        this.updateFilter({
            value: '',
        });
        const dimension = this.dimensions.find(
            d => d.name === dimensionName && d.viewConfig.displayText === displayText
        );

        if (dimension && dimensionIsSwitch(dimension)) {
            const oppositeSwitchExistsInDPC = this.query.dimensionPredicateCollections.find(d => {
                return d.dimensionName === dimension.name;
            });
            // If the switch exists, we want to remove it before adding the new one (i.e. toggle)
            if (oppositeSwitchExistsInDPC) {
                this.query = removeObjectFromQuery({
                    query: this.query,
                    identifiers: { dimensionPredicateCollectionId: oppositeSwitchExistsInDPC.id },
                });
            }

            // Add the new switch
            this.updateCurrentPredicate({
                leftOperand: dimensionName,
                operator: dimension.type === ON_SWITCH ? EQUALS : NOT_EQUAL,
                rightOperand: true,
            });
        } else {
            this.updateCurrentPredicate({
                leftOperand: dimensionName,
            });
        }
    }

    public handlePredicateOptionSelection(
        { leftOperand, rightOperand }: { leftOperand: string; rightOperand: RightOperandPrimitive },
        displayText?: string,
        selectMultipleValues: boolean = false
    ) {
        this.updateFilter({
            value: '',
        });
        const rightOperandObj = {
            value: rightOperand,
            displayText: displayText !== undefined ? displayText : String(rightOperand),
        };

        if (this.currentPredicate.rightOperand) {
            this.updateCurrentPredicate(
                {
                    leftOperand,
                    rightOperand: {
                        operand1: this.currentPredicate.rightOperand.operand1,
                        operand2: rightOperandObj,
                    },
                },
                { selectMultipleValues }
            );
        } else {
            this.updateCurrentPredicate(
                {
                    leftOperand,
                    rightOperand: {
                        operand1: rightOperandObj,
                    },
                },
                { selectMultipleValues }
            );
        }
    }

    public handleOperatorOptionSelection({ operatorName }: { operatorName: string }) {
        this.updateFilter({
            value: '',
        });
        this.updateCurrentPredicate({
            operator: operatorName,
        });
    }

    public updateFilter(updates: FilterConfig) {
        this.filter = { ...this.filter, ...updates };
        this.broadcastQueryChange('updateFilter');

        this.matchStrings = [this.filter.value];
        this.activeOptionIndex = 0;
    }

    public updateCurrentPredicate(
        updates: {
            leftOperand?: string | null;
            operator?: string | null;
            rightOperand?: RightOperand | null;
        },
        options: { selectMultipleValues?: boolean } = { selectMultipleValues: false }
    ) {
        const currentPredicate = this.currentPredicate;
        if (updates.rightOperand != null && (currentPredicate.operator || updates.operator)) {
            const operator = currentPredicate.operator || updates.operator;
            updates.rightOperand = normalizeRightOperand(updates.rightOperand, operator!);
        }

        const newCurrentPredicate = { ...currentPredicate, ...updates } as CurrentPredicateConfig;

        const tempObj = applyPredicateToQuery({
            query: this.query,
            predicate: newCurrentPredicate,
        });

        this.query = tempObj.query;
        this.currentPredicate = tempObj.currentPredicate;

        this.broadcastQueryChange('updateCurrentPredicate');
        this.freeInputValue = '';

        this.updateOptionCategories();

        this.dimensionPredicateCollections = this.query.dimensionPredicateCollections;

        this.matchStrings = [this.filter.value];
        this.activeOptionIndex = 0;

        if (
            this.autoSelectSingleOperator &&
            newCurrentPredicate.leftOperand !== null &&
            newCurrentPredicate.operator === null
        ) {
            const dimension = this.dimensions.find(d => d.name === newCurrentPredicate.leftOperand);
            if (dimension && dimensionHasSingleOperator(dimension)) {
                this.handleOperatorOptionSelection({
                    operatorName: dimension.operators[0].name,
                });
                return;
            }
        }

        if (options.selectMultipleValues) {
            // Multiple values under the same dimension/operator to be selected, so the current leftOperand/operator will be re-used
            this.updateCurrentPredicate({
                leftOperand: currentPredicate.leftOperand,
                operator: currentPredicate.operator,
            });
        }
    }

    public getCurrentPredicateCollectionIndex() {
        const currentIndex = this.query.dimensionPredicateCollections.findIndex(
            d => d.id === this.selectionInfo.selectedCollectionId
        );
        return currentIndex < 0 ? null : currentIndex;
    }

    public selectPreviousPredicateCollection() {
        this.toggleMenu(false);
        const currentIndex = this.getCurrentPredicateCollectionIndex();

        let selectedId = null;
        let indexToSelect = null;
        if (currentIndex !== null && currentIndex > 0) {
            indexToSelect = currentIndex - 1;
        } else if (currentIndex === 0) {
            indexToSelect = currentIndex;
        }

        if (indexToSelect !== null && indexToSelect >= 0) {
            selectedId = this.query.dimensionPredicateCollections[indexToSelect].id;
        } else if (this.query.dimensionPredicateCollections.length > 0) {
            selectedId =
                this.query.dimensionPredicateCollections[
                    this.query.dimensionPredicateCollections.length - 1
                ].id;
        }

        this.selectionInfo.selectedCollectionId = selectedId;
        this.broadcastQueryChange('pillSelected');
    }

    public selectNextPredicateCollection() {
        const currentIndex = this.getCurrentPredicateCollectionIndex();

        // Do not select next when nothing is selected. i.e do not select when right is pressed in input
        if (!this.selectionInfo.selectedCollectionId) {
            return;
        }

        let selectedId = null;
        let indexToSelect = null;
        if (currentIndex === this.query.dimensionPredicateCollections.length) {
            indexToSelect = currentIndex;
        } else if (
            currentIndex !== null &&
            currentIndex < this.query.dimensionPredicateCollections.length - 1
        ) {
            indexToSelect = currentIndex + 1;
        }

        if (
            indexToSelect !== null &&
            indexToSelect < this.query.dimensionPredicateCollections.length
        ) {
            selectedId = this.query.dimensionPredicateCollections[indexToSelect].id;
        }

        // If there is nothing to select then we'll be leaving selection mode so show the dropdown
        if (selectedId === null) {
            this.toggleMenu(true);
        }

        this.selectionInfo.selectedCollectionId = selectedId;
        this.broadcastQueryChange('pillSelected');
    }

    public disableDimensionPredicateCollectionSelection() {
        this.selectionInfo.selectedCollectionId = undefined;
    }

    public handleQueryFieldKeyDown(e: KeyboardEvent) {
        const keyCode = e.which;
        const actionKeyCodes = [16, 65, 67, 86, 88, 90]; // shift, a, c, v, x, z for select, copy, paste, cut, undo

        if (!(this.allowKeyDownEvent || actionKeyCodes.includes(keyCode))) {
            e.preventDefault(); // block the action if it is not a special keycode
        } else {
            switch (keyCode) {
                case KeyHelpers.keyCode.ARROW_DOWN:
                    this.handleQueryFieldArrowDownKeyDown();
                    break;
                case KeyHelpers.keyCode.ARROW_UP:
                    this.handleQueryFieldArrowUpKeyDown();
                    break;
                case KeyHelpers.keyCode.ARROW_LEFT:
                    this.handleQueryFieldArrowLeftKeyDown();
                    break;
                case KeyHelpers.keyCode.ARROW_RIGHT:
                    this.handleQueryFieldArrowRightKeyDown();
                    break;
                case KeyHelpers.keyCode.BACKSPACE:
                    this.handleQueryFieldBackspaceKeyDown();
                    break;
                case KeyHelpers.keyCode.ENTER:
                    this.handleQueryFieldEnterKeyDown(e);
                    break;
                case KeyHelpers.keyCode.SPACE:
                    this.handleQueryFieldSpaceKeyDown(e);
                    break;
                case KeyHelpers.keyCode.ESCAPE:
                    this.handleQueryFieldEscapeKeyDown();
                    break;
                default:
                    // When a pill is selected we want to ignore key presses we don't care about
                    if (this.selectionInfo.selectedCollectionId) {
                        e.preventDefault();
                    }
                    if (keyCode === KeyHelpers.keyCode.CTRL) {
                        // to prevent blocking of click events for multi-selection of values; all click events are blocked otherwise by the KeyDown event
                        this.allowKeyDownEvent = false;
                    }
                    break;
            }
        }

        this.updateOptionCategories();
    }

    public handleQueryFieldKeyUp() {
        // Reset if set to false during multi-selections of values
        this.allowKeyDownEvent = true;
    }

    public handleQueryFieldArrowDownKeyDown() {
        const nextMenuOptionIndex = getNextMenuOptionIndex({
            dimensions: this.dimensions,
            dimensionValues: this.dimensionValues,
            allowFreeTextPredicate: this.allowFreeTextPredicate,
            filter: this.filter,
            currentPredicate: this.currentPredicate,
            currentOptionIndex: this.activeOptionIndex,
            sortDropdownItems: this.sortDropdownItems,
        });

        this.activeOptionIndex = nextMenuOptionIndex;
    }

    public handleQueryFieldArrowUpKeyDown() {
        const prevMenuOptionIndex = getPrevMenuOptionIndex({
            dimensions: this.dimensions,
            dimensionValues: this.dimensionValues,
            allowFreeTextPredicate: this.allowFreeTextPredicate,
            filter: this.filter,
            currentPredicate: this.currentPredicate,
            currentOptionIndex: this.activeOptionIndex,
            sortDropdownItems: this.sortDropdownItems,
        });

        this.activeOptionIndex = prevMenuOptionIndex;
    }

    public handleQueryFieldArrowLeftKeyDown() {
        if (
            (this.shouldDisplayConstructionMenu() && this.currentPredicate.leftOperand !== null) ||
            this.freeInputNode!.value.length !== 0
        ) {
            this.disableDimensionPredicateCollectionSelection();
            return;
        }
        this.selectPreviousPredicateCollection();
    }

    public handleQueryFieldArrowRightKeyDown() {
        if (
            (this.shouldDisplayConstructionMenu() && this.currentPredicate.leftOperand !== null) ||
            this.freeInputNode!.value.length !== 0
        ) {
            this.disableDimensionPredicateCollectionSelection();
            return;
        }
        this.selectNextPredicateCollection();
    }

    public handleQueryFieldBackspaceKeyDown() {
        const { leftOperand, operator, rightOperand } = this.currentPredicate;

        // If building or there is text in the free text field then do not remove selected
        const freeTextIsEmpty =
            this.freeInputNode &&
            this.freeInputNode.selectionStart === 0 &&
            this.freeInputNode.value.length === 0;

        // If there is a custom input and it is currently in use (right operand is being selected)
        const customInputExists = this.childWrapper && leftOperand && operator;

        const canRemoveBuildingPredicate =
            (freeTextIsEmpty || !customInputExists) &&
            (this.currentPredicate.leftOperand || this.currentPredicate.operator);

        // Handle backspace when inside the building predicate. Menu for operator and rightOperand.
        if (canRemoveBuildingPredicate) {
            // Delete leftOperand buildingPredicate
            if (
                this.currentPredicate.leftOperand !== null &&
                this.currentPredicate.operator === null
            ) {
                this.updateCurrentPredicate({
                    leftOperand: null,
                });
            }

            // Delete operator buildingPredicate
            if (operator !== null && rightOperand === null) {
                if (this.autoSelectSingleOperator) {
                    const dimension = this.dimensions.find(d => d.name === leftOperand);
                    if (dimension && dimensionHasSingleOperator(dimension)) {
                        // Operator is autoselected with leftOperand so we want to get rid of the whole predicate
                        this.updateCurrentPredicate({
                            leftOperand: null,
                            operator: null,
                        });
                    } else {
                        this.updateCurrentPredicate({
                            operator: null,
                        });
                    }
                } else {
                    this.updateCurrentPredicate({
                        operator: null,
                    });
                }
            }

            if (
                this.currentPredicate.operator === 'between' &&
                this.currentPredicate.rightOperand !== null
            ) {
                this.updateCurrentPredicate({
                    rightOperand: null,
                });
            }

            this.updateFilter({
                value: '',
            });
            return;
        }

        if (freeTextIsEmpty) {
            let removeQuery = removeDimensionPredicateFromQuery({
                query: this.query,
                collectionId: this.selectionInfo.selectedCollectionId,
            });
            if (this.selectionInfo.selectedCollectionId === null) {
                removeQuery = removeDimensionPredicateFromQuery({ query: this.query });
            }

            this.query = removeQuery;
            this.selectionInfo.selectedCollectionId = undefined;
            this.toggleMenu(true);
            this.broadcastQueryChange('removePill');
            this.dimensionPredicateCollections = this.query.dimensionPredicateCollections;
        }
    }

    public handleQueryFieldSpaceKeyDown(e: KeyboardEvent) {
        if (!this.disableCreatePillOnSpace) {
            const numMenuOptions = getNumMenuOptions({
                dimensions: this.dimensions,
                dimensionValues: this.dimensionValues,
                allowFreeTextPredicate: this.allowFreeTextPredicate,
                filter: this.filter,
                currentPredicate: this.currentPredicate,
                sortDropdownItems: this.sortDropdownItems,
            });

            const addingLeftOperand = this.currentPredicate.leftOperand === null;
            const addingOperator =
                this.currentPredicate.leftOperand !== null &&
                this.currentPredicate.operator === null;
            const addingRightOperand =
                this.currentPredicate.leftOperand !== null &&
                this.currentPredicate.operator !== null;

            // This conditional checks that we have only one valid item left.
            if (
                ((addingLeftOperand || addingRightOperand) &&
                    ((!this.allowFreeTextPredicate && numMenuOptions === 1) ||
                        (this.allowFreeTextPredicate && numMenuOptions === 2))) ||
                (addingOperator && numMenuOptions === 1)
            ) {
                e.preventDefault();
                const { optionType, selectionArgs, displayText } = getActiveMenuOption({
                    dimensions: this.dimensions,
                    dimensionValues: this.dimensionValues,
                    allowFreeTextPredicate: this.allowFreeTextPredicate,
                    filter: this.filter,
                    currentPredicate: this.currentPredicate,
                    activeOptionIndex: 0,
                    sortDropdownItems: this.sortDropdownItems,
                });

                this.freeInputNode!.value = '';

                this.handleOptionSelection({
                    optionType,
                    selectionArgs,
                    displayText,
                    selectMultipleValues: e.ctrlKey,
                });

                this.activeOptionIndex = 0;
            }
        }
    }

    public handleQueryFieldEnterKeyDown(e: KeyboardEvent) {
        const { optionType, selectionArgs, displayText } = getActiveMenuOption({
            dimensions: this.dimensions,
            dimensionValues: this.dimensionValues,
            allowFreeTextPredicate: this.allowFreeTextPredicate,
            filter: this.filter,
            currentPredicate: this.currentPredicate,
            activeOptionIndex: this.activeOptionIndex,
            sortDropdownItems: this.sortDropdownItems,
        });

        this.handleOptionSelection({
            optionType,
            selectionArgs,
            displayText,
            selectMultipleValues: e.ctrlKey,
        });
    }

    public handleQueryFieldEscapeKeyDown() {
        const currentSelectedCollectionId = this.selectionInfo.selectedCollectionId;

        this.selectionInfo.selectedCollectionId = undefined;
        this.exitOutOfQueryField();

        if (currentSelectedCollectionId !== null) {
            this.clearFreeInputNode();
            this.focusInput();
        }
    }

    private clearFreeInputNode() {
        this.freeInputNode!.value = '';
        this.freeInputValue = '';
        this.updateFilter({
            value: '',
        });
    }

    private exitOutOfQueryField() {
        this.queryfieldContainer.focus();
        this.queryfieldContainer.blur();
        this.focusInput();
        this.blurInput();
        this.toggleMenu(false);
        this.toggleSelection(false);
    }

    public broadcastQueryChange(changeCode: string) {
        const predicates = [...getPredicatesInQuery(this.query)].map(transformPredicateToQueryForm);

        const componentFilter = transformPredicatesToFilter(predicates, this.dimensions);
        const { dimensionPredicateCollections } = this.query;
        let selectedPill =
            dimensionPredicateCollections.find(
                d => d.id === this.selectionInfo.selectedCollectionId
            ) || null;

        let selectedPillPredicates = null;

        if (selectedPill && selectedPill.predicates) {
            selectedPillPredicates = selectedPill.predicates.map(transformPredicateToQueryForm);
        }
        if (!this.onQueryChange) {
            throw new Error('The onQueryChange function is required to use the queryfield');
        }
        this.dimensionValues = this.onQueryChange({
            changeCode,
            predicates,
            filter: this.filter,
            currentPredicate: {
                leftOperand: this.currentPredicate.leftOperand,
                operator: this.currentPredicate.operator,
                rightOperand: this.currentPredicate.rightOperand,
            },
            componentFilter,
            selectedPill: selectedPillPredicates || selectedPill,
        });
    }

    public handleFreeInputChange(e: Event) {
        const target = e.target as HTMLInputElement;
        const value = target.value;

        this.freeInputValue = value;
        this.updateFilter({
            value,
        });

        this.updateOptionCategories();
    }

    public remove({ dimensionPredicateCollectionId, predicateId }: IdentifierConfig) {
        const identifiers = {
            dimensionPredicateCollectionId,
            predicateId,
        };
        this.query = removeObjectFromQuery({ query: this.query, identifiers });

        this.broadcastQueryChange('removePill');
        this.dimensionPredicateCollections = this.query.dimensionPredicateCollections;
    }

    public saveFreeInputNode() {
        this.freeInputNode = this.freeInput.nativeElement;
    }

    public saveQueryfieldContainerNode() {
        this.queryfieldContainer = this.queryfieldContainerRef.nativeElement;
    }

    public toggleMenu(val: boolean) {
        // 'show' class is added for backward-compatibility with v13,
        // can be removed in next major release
        if (val) {
            this.queryfieldContainer.classList.add(this.cssClasses.dropdownShow);
            this.queryfieldContainer.classList.add('show');
        } else {
            this.queryfieldContainer.classList.remove(this.cssClasses.dropdownShow);
            this.queryfieldContainer.classList.remove('show');
        }
    }

    public toggleSelection(val: boolean) {
        // 'selected' class is added for backward-compatibility with v13,
        // can be removed in next major release
        if (val) {
            this.queryfieldContainer.classList.add(this.cssClasses.selected);
            this.queryfieldContainer.classList.add('selected');
        } else {
            this.queryfieldContainer.classList.remove(this.cssClasses.selected);
            this.queryfieldContainer.classList.remove('selected');
            this.selectionInfo.selectedCollectionId = undefined;
        }
    }

    public renderDisplayText(o: DeserializedOption) {
        const matchStrings = [this.filter.value];
        const displayText = o.displayText!;
        const matchString = matchStrings.find(
            s => displayText!.toLowerCase().indexOf(s.toLowerCase()) > -1
        );

        if (matchString) {
            const pivot = displayText.toLowerCase().indexOf(matchString.toLowerCase());
            const start = displayText.slice(0, pivot);
            const middle = displayText.slice(pivot, pivot + matchString.length);
            const end = displayText.slice(pivot + matchString.length, displayText.length);

            return '' + start + '<b>' + middle + '</b>' + end;
        }
        return displayText;
    }

    private updateOptionCategories() {
        const visibleMenu = getVisibleMenu({
            activeOptionIndex: this.activeOptionIndex,
            allowFreeTextPredicate: this.allowFreeTextPredicate,
            currentPredicate: this.currentPredicate,
            dimensions: this.dimensions,
            dimensionValues: this.dimensionValues,
            filter: this.filter,
            sortDropdownItems: this.sortDropdownItems,
        });

        this.optionCategories = visibleMenu.optionCategories;

        this.optionsToDisplay = this.optionCategories.map(optionCategory => ({
            ...optionCategory,
            options: optionCategory.options.slice(0, this.maxOptionsToDisplay),
        }));

        this.displayedDifference = this.optionCategories.length
            ? this.optionCategories[0].options.length - this.optionsToDisplay[0].options.length
            : 0;
        const singularDifference = this.displayedDifference == 1;
        this.hiddenOptionsText = `${this.displayedDifference} more field${
            singularDifference ? '' : 's'
        }. Refine Search to display hidden item${singularDifference ? '' : 's'}
        `;
        this.displayDropdownWarning = visibleMenu.displayWarning;
    }

    public removeAllPills() {
        this.queryfieldApi().clearQueryfieldState();
        this.exitOutOfQueryField();
    }

    public getDimensionConfig(dpc: DimensionPredicateCollections) {
        const dimensionCollection = this.dimensions.filter(d => d.name === dpc.dimensionName);
        const defaultValue = {
            viewConfig: {
                displayText: 'Free text',
                bgColor: '#555',
            },
        };
        // If the dimension is a switch, we want to find the correct switch and get its config
        // If it's not a switch, we want to return the found dimension (or the default free text value if undefined)
        if (dimensionCollection[0] && dimensionIsSwitch(dimensionCollection[0])) {
            return (
                dimensionCollection.find(d =>
                    dpc.predicates[0].operator === EQUALS
                        ? d.type === ON_SWITCH
                        : d.type === OFF_SWITCH
                ) || defaultValue
            ).viewConfig;
        } else {
            return (dimensionCollection[0] || defaultValue).viewConfig;
        }
    }

    public dimensionExistsAndIsSwitch(dimensionName: string) {
        const dimension = this.dimensions.find(d => d.name === dimensionName);
        return dimension && dimensionIsSwitch(dimension);
    }

    public getRootClasses() {
        const { cssClasses, classes: overrideClasses } = this;
        return getQueryfieldRootClasses({
            cssClasses,
            overrideClasses,
        });
    }

    public getContainerClasses(selected: boolean) {
        const { cssClasses, classes: overrideClasses, size } = this;
        return getQueryfieldContainerClasses({
            cssClasses,
            overrideClasses,
            selected,
            size,
        });
    }

    public getQueryClasses() {
        const { cssClasses, classes: overrideClasses, borderless } = this;
        return getQueryfieldQueryClasses({
            cssClasses,
            overrideClasses,
            borderless,
        });
    }

    public getDimensionPredicateCollectionsClasses() {
        const { cssClasses, classes: overrideClasses } = this;
        return getQueryfieldDimensionPredicateCollectionsClasses({
            cssClasses,
            overrideClasses,
        });
    }

    public getInputIconClasses() {
        const { cssClasses, classes: overrideClasses } = this;
        return getQueryfieldInputIconClasses({
            cssClasses,
            overrideClasses,
        });
    }

    public getDimensionPredicateCollectionContainerClasses() {
        const { cssClasses, classes: overrideClasses } = this;
        return getQueryfieldDimensionPredicateCollectionContainerClasses({
            cssClasses,
            overrideClasses,
        });
    }

    public getDimensionPredicateCollectionClasses(active: boolean) {
        const { cssClasses, classes: overrideClasses } = this;
        return getQueryfieldDimensionPredicateCollectionClasses({
            cssClasses,
            overrideClasses,
            active,
        });
    }

    public getBuildingDimensionPredicateCollectionClasses() {
        const { cssClasses, classes: overrideClasses } = this;
        return getQueryfieldDimensionPredicateCollectionClasses({
            cssClasses,
            overrideClasses,
            building: true,
        });
    }

    public getDpcNameClasses() {
        const { cssClasses, classes: overrideClasses } = this;
        return getQueryfieldDpcNameClasses({
            cssClasses,
            overrideClasses,
        });
    }

    public getDpcPredicatesClasses() {
        const { cssClasses, classes: overrideClasses } = this;
        return getQueryfieldDpcPredicatesClasses({
            cssClasses,
            overrideClasses,
        });
    }

    public getDpcPredicateClasses() {
        const { cssClasses, classes: overrideClasses } = this;
        return getQueryfieldDpcPredicateClasses({
            cssClasses,
            overrideClasses,
        });
    }

    public getPredicateOperatorClasses() {
        const { cssClasses, classes: overrideClasses } = this;
        return getQueryfieldPredicateOperatorClasses({
            cssClasses,
            overrideClasses,
        });
    }

    public getRightOperandClasses() {
        const { cssClasses, classes: overrideClasses } = this;
        return getQueryfieldRightOperandClasses({
            cssClasses,
            overrideClasses,
        });
    }

    public getItemRemoveIconClasses(displayDimensionOnly: boolean) {
        const { cssClasses, classes: overrideClasses } = this;
        return getQueryfieldItemRemoveIconClasses({
            cssClasses,
            overrideClasses,
            displayDimensionOnly,
        });
    }

    public getBuildingPredicateLeftOperandClasses() {
        const { cssClasses, classes: overrideClasses } = this;
        return getQueryfieldBuildingPredicateLeftOperandClasses({
            cssClasses,
            overrideClasses,
        });
    }

    public getBuildingPredicateOperatorClasses() {
        const { cssClasses, classes: overrideClasses } = this;
        return getQueryfieldBuildingPredicateOperatorClasses({
            cssClasses,
            overrideClasses,
        });
    }

    public getDropdownClasses(active: boolean) {
        const { cssClasses, classes: overrideClasses } = this;
        return getQueryfieldDropdownClasses({
            cssClasses,
            overrideClasses,
            active,
        });
    }

    public getFreeInputClasses() {
        const { cssClasses, classes: overrideClasses } = this;
        return getQueryfieldFreeInputClasses({
            cssClasses,
            overrideClasses,
        });
    }

    public getDropdownMenuClasses() {
        const { cssClasses, classes: overrideClasses } = this;
        return getQueryfieldDropdownMenuClasses({
            cssClasses,
            overrideClasses,
        });
    }

    public getDropdownMenuWarningClasses() {
        const { cssClasses, classes: overrideClasses } = this;
        return getQueryfieldDropdownWarningClasses({
            cssClasses,
            overrideClasses,
        });
    }

    public getDropdownHeaderClasses() {
        const { cssClasses, classes: overrideClasses } = this;
        return getQueryfieldDropdownHeaderClasses({
            cssClasses,
            overrideClasses,
        });
    }

    public getDropdownItemClasses(active: boolean) {
        const { cssClasses, classes: overrideClasses } = this;
        return getQueryfieldDropdownItemClasses({
            cssClasses,
            overrideClasses,
            active,
        });
    }

    public getRemoveIconContainerClasses() {
        const { cssClasses, classes: overrideClasses } = this;
        return getQueryfieldRemoveIconContainerClasses({
            cssClasses,
            overrideClasses,
        });
    }

    public getRemoveIconClasses() {
        const { cssClasses, classes: overrideClasses } = this;
        return getQueryfieldRemoveIconClasses({
            cssClasses,
            overrideClasses,
        });
    }
}







import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CssClasses, StyleSheet } from '@gs-ux-uitoolkit-common/style';
import {
  CurrentPredicateOptions,
  DimensionConfig,
  DimensionValueConfig,
  FilterConfig,
  PredicateInQueryWithID,
  QueryChangeEvent,
  QueryFieldComponent,
  QueryfieldModule,
  QueryfieldPredicateConfig,
} from '@gs-ux-uitoolkit-angular/queryfield';
import { debounceTime, lastValueFrom, Observable, of, Subject } from 'rxjs';
import { isEqual } from 'lodash-es';

import { Column } from '@gsam-fi/grids/typings';
import GsQueryFieldStyles from '@styles/gs-queryfield';

import { DateDimensionComponent } from './custom-dimensions/date-dimension/date-dimension.component';
import { FIConstants } from '@gsam-fi/common';
import { FiPixels } from '@gsam-fi/common/design-system';

import { AllowedDimension, AllowedDimensionsOperators, AllowedDimensionTypes } from '../typings/saved-dashboards.typings';
import { DatePickerModule } from '@gs-ux-uitoolkit-angular/datepicker';
import { GshSelectorComponent } from '../gsh-selector/gsh-selector.component';
import { GshWrapperComponent } from './custom-dimensions/gsh-wrapper/gsh-wrapper.component';
import { PopoverModule } from '@gs-ux-uitoolkit-angular/popover';

const overrideStyleSheet = new StyleSheet('filter-bar-popover-styles', {
  selectorPopover: {
    paddingLeft: FiPixels.ZERO,
    paddingRight: FiPixels.ZERO,
    paddingTop: FiPixels.ZERO,
    paddingBottom: FiPixels.ZERO,
  },
});

const COVERAGE_GROUP_DIMENSION = 'research|researchSummary|coverageGroup';
const FI_CORPS_KEY = 'FI_CORPS';

@Component({
  selector: 'metrics-filter-bar',
  styleUrls: ['./filter-bar.component.scss'],
  templateUrl: 'filter-bar.component.html',
  imports: [CommonModule, DatePickerModule, QueryfieldModule, GshSelectorComponent, PopoverModule, DateDimensionComponent, GshWrapperComponent],
  standalone: true,
})
export class FilterBarComponent implements OnInit, OnChanges, OnDestroy {
  //TODO: add Input()
  @Input() allowedDimensions: { dimension: AllowedDimension; column: Column }[] = [];
  @Input() fetchDimensionValues!: ({
    predicate,
    filter,
  }: {
    predicate: CurrentPredicateOptions & { leftOperand: string };
    filter: FilterConfig;
  }) => Observable<DimensionValueConfig[]>;
  @Input() queryfieldPredicates: QueryfieldPredicateConfig[] = [];
  @Output() readonly filtersChanged: EventEmitter<PredicateInQueryWithID[]> = new EventEmitter();
  @ViewChild('queryfield', { read: QueryFieldComponent }) readonly queryfield!: QueryFieldComponent;
  allowFreeTextPredicate = false;
  allowedDimensionTypes = AllowedDimensionTypes;
  customDimensionConfig: Record<string, unknown> = {};
  customQueryfieldInput!: string | undefined;

  dimensions: DimensionConfig[] = [];
  dimensionValues: DimensionValueConfig[] = [];
  overrideClasses!: CssClasses<typeof overrideStyleSheet>;
  predicates: PredicateInQueryWithID[] = [];
  queryfieldClasses!: CssClasses<typeof GsQueryFieldStyles>;
  selectedOperator!: string | null;
  private corporateDesks = ['EMERGING_MARKET', 'HIGH_YIELD', 'INVESTMENT_GRADE'];
  private debounceFiltersChanged$: Subject<PredicateInQueryWithID[]> = new Subject();
  private filtersUpdated$: Subject<{ predicate: CurrentPredicateOptions & { leftOperand: string }; filter: FilterConfig }> = new Subject();
  private metricsDimensionConfig: FilterBarComponent['allowedDimensions'] = [];
  private predefinedOptions: Record<string, DimensionValueConfig[]> = {
    'identifiers|identifiers|advisorChannel': [
      {
        dimensionName: '',
        value: 'pwm',
        displayText: 'PWM',
      },
      {
        dimensionName: '',
        value: 'uc',
        displayText: 'PFM',
      },
      {
        dimensionName: '',
        value: 'ayco',
        displayText: 'AYCO',
      },
      {
        dimensionName: '',
        value: 'tpd',
        displayText: '3rd-Party Distributor',
      },
    ],
    'research|analystRecommendationsMuni|recommendations.ISSUER_TIER': [
      {
        dimensionName: '',
        value: 'Tier 0',
        displayText: 'Tier 0',
      },
      {
        dimensionName: '',
        value: 'Tier 1',
        displayText: 'Tier 1',
      },
      {
        dimensionName: '',
        value: 'Tier 2',
        displayText: 'Tier 2',
      },
      {
        dimensionName: '',
        value: 'Tier 3',
        displayText: 'Tier 3',
      },
    ],
    [COVERAGE_GROUP_DIMENSION]: [
      {
        dimensionName: '',
        value: FI_CORPS_KEY,
        displayText: 'FI Corporates',
      },
      {
        dimensionName: '',
        value: 'EMERGING_MARKET',
        displayText: 'Emerging Market',
      },
      {
        dimensionName: '',
        value: 'HIGH_YIELD',
        displayText: 'High Yield',
      },
      {
        dimensionName: '',
        value: 'INVESTMENT_GRADE',
        displayText: 'Investment Grade',
      },
      {
        dimensionName: '',
        value: 'FI_MUNI',
        displayText: 'Municipal',
      },
    ],
  };

  constructor(readonly changeDetector: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.updateQueryFieldCssClasses(false);
    this.overrideClasses = overrideStyleSheet.mount(this, FIConstants.NULL);
    this.queryfieldClasses = GsQueryFieldStyles.mount(this, { searchHidden: false });

    this.filtersUpdated$.pipe(debounceTime(100)).subscribe(async ({ predicate, filter }) => {
      if (!predicate.leftOperand) {
        return;
      }

      // find from dimensions
      const dimension = this.dimensions.find((_dimension) => _dimension.name === predicate.leftOperand);
      if (!dimension) {
        return;
      }

      // reset to empty list if filter is blank
      if (!filter.value || filter.value.length < 2) {
        this.dimensionValues = [];

        return;
      }

      this.dimensionValues = await lastValueFrom(this.fetchDimensionValues ? this.fetchDimensionValues({ predicate, filter }) : of([]));
    });

    this.debounceFiltersChanged$.pipe(debounceTime(100)).subscribe((filter) => this.filtersChanged.next(filter));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.allowedDimensions) {
      this.processAllowedDimensions(changes.allowedDimensions.currentValue as FilterBarComponent['allowedDimensions']);
    }

    if (changes.queryfieldPredicates) {
      this.predicates = changes.queryfieldPredicates.currentValue.predicates;
    }
  }

  ngOnDestroy(): void {
    overrideStyleSheet.unmount(this);
    GsQueryFieldStyles.unmount(this);
    this.debounceFiltersChanged$.complete();
    this.filtersUpdated$.complete();
  }

  updateQueryFieldCssClasses(visible: boolean): void {
    this.allowFreeTextPredicate = visible;

    if (this.queryfieldClasses) {
      GsQueryFieldStyles.unmount(this);
    }

    this.queryfieldClasses = GsQueryFieldStyles.mount(this, { searchHidden: !this.allowFreeTextPredicate });
  }

  onQueryChange = ({ changeCode, predicates, filter, currentPredicate }: QueryChangeEvent): DimensionValueConfig[] => {
    const metricsDimensionConfig = this.metricsDimensionConfig.find((d) => d.dimension.field === currentPredicate.leftOperand);
    const customQueryfieldInput = metricsDimensionConfig?.column.columnProperties.customFilterInput ? metricsDimensionConfig?.dimension.type : undefined;
    this.customDimensionConfig = metricsDimensionConfig?.column.columnProperties.customDimensionConfig ?? {};
    this.customQueryfieldInput = currentPredicate.operator ? customQueryfieldInput : undefined;

    this.selectedOperator = currentPredicate.operator;

    if (
      (['updateCurrentPredicate', 'removePill'].includes(changeCode) && !isEqual(this.predicates, predicates) && !currentPredicate.leftOperand) ||
      (changeCode === 'updateFilter' && !predicates.length && this.predicates?.length)
    ) {
      const fiCorpsPredicate = predicates.find((predicate) => predicate.leftOperand === COVERAGE_GROUP_DIMENSION && predicate.rightOperand === FI_CORPS_KEY);

      if (fiCorpsPredicate) {
        const coverageGroupPredicates = predicates.filter((predicate) => predicate.leftOperand === COVERAGE_GROUP_DIMENSION);

        const currentDeskValues = coverageGroupPredicates.map((predicate) => predicate.rightOperand);
        this.corporateDesks.forEach((desk) => {
          if (!currentDeskValues.includes(desk)) {
            predicates.push({
              leftOperand: COVERAGE_GROUP_DIMENSION,
              operator: AllowedDimensionsOperators.equals,
              rightOperand: desk,
            } as PredicateInQueryWithID);
          }
        });

        this.predicates = predicates.filter((predicate) => predicate !== fiCorpsPredicate);
      } else {
        this.predicates = predicates;
      }

      this.debounceFiltersChanged$.next(this.predicates);
    }

    if (changeCode === 'updateCurrentPredicate' && currentPredicate.leftOperand && currentPredicate.operator) {
      if ([AllowedDimensionsOperators.blank, AllowedDimensionsOperators.notBlank].includes(currentPredicate.operator as AllowedDimensionsOperators)) {
        setTimeout(() => {
          if (currentPredicate.leftOperand) {
            this.queryfield.dimensionValues = [];
            this.queryfield.handleQueryFieldKeyDown({ keyCode: 13, which: 13 } as KeyboardEvent);
          }
        }, 10);

        return [];
      }

      if (currentPredicate.rightOperand) {
        this.predicates = predicates;
        this.debounceFiltersChanged$.next(this.predicates);
      }
    }

    // GS QueryField doesn't support async or remote data fetching so we have to conform to its standard whilst sending async requests off afterwards
    if (changeCode === 'updateFilter') {
      const predicate = currentPredicate as CurrentPredicateOptions & { leftOperand: string };
      const dimension = this.dimensions.find((d) => d.name === predicate.leftOperand) || { name: '', dataType: undefined, type: AllowedDimensionTypes.CUSTOM };

      // hardcoded options for UI to move to config in 2024
      if (this.predefinedOptions[dimension.name]) {
        this.updateQueryFieldCssClasses(false);
        this.dimensionValues = this.predefinedOptions[dimension.name].map((dimensionConfig) => ({ ...dimensionConfig, dimensionName: predicate.leftOperand }));

        return this.dimensionValues;
      }

      if (dimension.dataType !== 'autocomplete') {
        this.updateQueryFieldCssClasses(false);
      } else {
        this.updateQueryFieldCssClasses(true);
        this.filtersUpdated$.next({ predicate, filter });
      }

      if (dimension.type === AllowedDimensionTypes.BOOLEAN) {
        this.dimensionValues = [
          {
            dimensionName: predicate.leftOperand,
            value: 'true',
            displayText: 'Yes',
          },
          {
            dimensionName: predicate.leftOperand,
            value: 'false',
            displayText: 'No',
          },
        ];
      }
    }

    // Always return dimensionValues:
    return this.dimensionValues;
  };

  updateCurrentPredicate(type: AllowedDimensionTypes, value: string): void {
    let rightOperand: string | { operand1: { value: string; displayText: string }; operand2: { value: string; displayText: string } } = value;

    if (this.selectedOperator === AllowedDimensionsOperators.between && type === AllowedDimensionTypes.DATE) {
      const dates = value.split(' to ');
      rightOperand = {
        operand1: {
          value: dates[0],
          displayText: dates[0],
        },
        operand2: {
          value: dates[1],
          displayText: dates[1],
        },
      };
    }

    this.queryfield.updateFilter({
      value: '',
    });
    this.queryfield.updateCurrentPredicate({ rightOperand });
  }

  private processAllowedDimensions(dimensions: FilterBarComponent['allowedDimensions']): void {
    this.metricsDimensionConfig = dimensions;
    this.dimensions = dimensions.map(({ dimension, column }) => {
      const operators: { name: string; displayText: string }[] = [];

      //TODO: Add new case here for custom dimension type 'GSH'
      switch (dimension.type) {
        case AllowedDimensionTypes.TEXT:
          operators.push(
            {
              name: AllowedDimensionsOperators.equals,
              displayText: 'equals',
            },
            {
              name: AllowedDimensionsOperators.contains,
              displayText: 'contains',
            },
            {
              name: AllowedDimensionsOperators.notEqual,
              displayText: 'does not equal',
            },
            {
              name: AllowedDimensionsOperators.blank,
              displayText: AllowedDimensionsOperators.blank,
            },
            {
              name: AllowedDimensionsOperators.notBlank,
              displayText: AllowedDimensionsOperators.notBlank,
            },
          );
          break;

        case AllowedDimensionTypes.NUMBER:
          operators.push(
            {
              name: AllowedDimensionsOperators.equals,
              displayText: AllowedDimensionsOperators.equals,
            },
            {
              name: AllowedDimensionsOperators.lessThan,
              displayText: AllowedDimensionsOperators.lessThan,
            },
            {
              name: AllowedDimensionsOperators.greaterThan,
              displayText: AllowedDimensionsOperators.greaterThan,
            },
            {
              name: AllowedDimensionsOperators.between,
              displayText: AllowedDimensionsOperators.between,
            },
            {
              name: AllowedDimensionsOperators.atLeast,
              displayText: AllowedDimensionsOperators.atLeast,
            },
            {
              name: AllowedDimensionsOperators.atMost,
              displayText: AllowedDimensionsOperators.atMost,
            },
            {
              name: AllowedDimensionsOperators.blank,
              displayText: AllowedDimensionsOperators.blank,
            },
            {
              name: AllowedDimensionsOperators.notBlank,
              displayText: AllowedDimensionsOperators.notBlank,
            },
          );
          break;
          case AllowedDimensionTypes.BOOLEAN:
          case AllowedDimensionTypes.GSHLEVEL:
          operators.push(
            {
              name: AllowedDimensionsOperators.equals,
              displayText: 'equals',
            },
            {
              name: AllowedDimensionsOperators.notEqual,
              displayText: 'does not equal',
            },
          );
          break;

        case AllowedDimensionTypes.DATE:
          operators.push(
            {
              name: AllowedDimensionsOperators.equals,
              displayText: AllowedDimensionsOperators.equals,
            },
            {
              name: AllowedDimensionsOperators.before,
              displayText: AllowedDimensionsOperators.before,
            },
            {
              name: AllowedDimensionsOperators.after,
              displayText: AllowedDimensionsOperators.after,
            },
            {
              name: AllowedDimensionsOperators.between,
              displayText: AllowedDimensionsOperators.between,
            },
          );
          break;

        case AllowedDimensionTypes.CUSTOM:
          // add condition on custom field being gsh
          operators.push({
            name: AllowedDimensionsOperators.equals,
            displayText: AllowedDimensionsOperators.equals,
          });
          break;
        default:
          break;
      }

      return {
        name: dimension.field,
        viewConfig: {
          displayText: column.headerName,
        },
        type: dimension.type,
        operators,
        dataType: dimension.autocomplete ? 'autocomplete' : 'fixed',
      };
    });
  }
}




<gs-queryfield [classes]="queryfieldClasses" placeholder="Search..." [dimensions]="dimensions"
    [dimensionValues]="dimensionValues" [autoSelectSingleOperator]="true" [onQueryChange]="onQueryChange"
    [maxOptionsToDisplay]="15" [disableCreatePillOnSpace]="true" [throttleWait]="0"
    [predicates]="queryfieldPredicates" [sortDropdownItems]="false" [clearable]="true">
    <gs-queryfield-custom-input *ngIf="queryFieldCustomInput" >
        <input data-input placeholder="search value..." type="text" name="date" inputId="text-input"
                className="free-input" gsPopover [gsPopoverBody]="selector" gsPopoverClass="metrics-container__light-popover" [gsPopoverClasses]="{ content: overrideClasses.selectorPopover }" [gsPopoverShowTip]="false"
                gsPopoverPlacement="bottom-left"/>
    </gs-queryfield-custom-input>
</gs-queryfield>
