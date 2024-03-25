callFilterTreeInstance(value: string, eventName?: string, treeEvent?: TreeExpandEvent, expandArr?: ((ColumnPacket & { categoryId: string; columnId?: string }) | undefined)[]): void {
    if (eventName === 'overflow') {
      this.activeTag = value;
      value = this.activeTag === 'All' ? '' : value;
      this.searchText = '';
      this.analytics.event(AnalyticsEvents.CLICK_QUICK_DESK_FILTER, { [AnalyticsProperties.QUICK_DESK_FILTER]: value });
    } else {
      this.searchText = value;
    }

    console.log(expandArr);

    if (this.activeTag === 'All' && (!value?.length || value.length < 2)) {
      this.treeInstances.forEach((instance, position) => {
        const state = this.originalTreeState[position];
        instance.api.setState(state);
      });

      this.hiddenCategories = {};
      this.analytics.event(AnalyticsEvents.RESET_SEARCH_COLUMNS, {});

      return;
    }

    if(eventName === 'expand' && this.searchText.length > 1){
      return;
    }

    if (this.activeTag !== 'All') {
      this.treeInstances.forEach((instance) => {
        let category = '';
        const api = instance.api;
        const searchState = { ...api.getState() } as Record<
          string,
          TreeNode & { expanded: boolean; visible: boolean; childrenKeys: string[]; parentKey: string | undefined; }
        >;
        Object.keys(searchState).forEach((key) => {
          let visible = true;
          category = first(key.split('|')) || '';
          let hasChildren = false;
          if (searchState[key].href?.includes(`|${this.activeTag}|`)) {
            if (this.searchText.length > 1) {
              hasChildren = some(
                searchState[key].childrenKeys,
                (child) =>
                  (searchState[child].href?.includes(`|${this.activeTag}|`) && searchState[child].name.toLowerCase().includes(this.searchText.toLowerCase())) ||
                  searchState[child].childrenKeys.some((cName) => searchState[cName].href?.includes(`|${this.activeTag}|`) && searchState[cName].name.toLowerCase().includes(this.searchText.toLowerCase())),
              );
            } else {
              hasChildren = some(searchState[key].childrenKeys, (child) =>
                treeEvent?.itemKey === key && searchState[child].href?.includes(`|${this.activeTag}|`) ||
                searchState[child].childrenKeys.some((cName) => searchState[cName].href?.includes(`|${this.activeTag}|`)),
              );
            }

            if (this.searchText.length > 1 && !searchState[key].name.toLowerCase().includes(this.searchText.toLowerCase()) && !hasChildren) {
              visible = false;
            } else if (this.searchText.length <= 1 && !hasChildren && searchState[key].childrenKeys.length === 0) {
              if(!key.includes(String(treeEvent?.itemKey))){
                visible = false;
              }
            }
          } else {
            visible = false;
          }

          searchState[key] = {
            ...searchState[key],
            visible,
            expanded: hasChildren,
          };
        });
        console.log(searchState);
        this.hiddenCategories[category] = every(searchState, { visible: false });
        api.setState(searchState);
      });
    } else {
      this.treeInstances.forEach((instance) => {
        let category = '';
        const api = instance.api;
        const searchState = { ...api.getState() } as Record<
          string,
          TreeNode & { expanded: boolean; visible: boolean; childrenKeys: string[]; parentKey: string | undefined }
        >;
        Object.keys(searchState).forEach((key) => {
          let visible = true;
          category = first(key.split('|')) || '';
          const hasChildren = some(
            searchState[key].childrenKeys,
            (child) =>
              searchState[child].name.toLowerCase().includes(value.toLowerCase()) ||
              searchState[child].childrenKeys.some((cName) => searchState[cName].name.toLowerCase().includes(value.toLowerCase())),
          );

          if (!searchState[key].name.toLowerCase().includes(value.toLowerCase()) && !hasChildren) {
              visible = false;
          }

          searchState[key] = {
            ...searchState[key],
            visible,
            expanded: hasChildren,
          };
        });

        this.hiddenCategories[category] = every(searchState, { visible: false });
        api.setState(searchState);
      });
    }

    this.analytics.event(AnalyticsEvents.SEARCH_COLUMNS, { [AnalyticsProperties.SEARCH_TERM]: value.toLowerCase() });
  }




<gs-checkbox _ngcontent-ng-c9982543="" data-gs-uitk-component="checkbox" size="sm" data-size="sm" data-label-placement="right" class="gs-checkbox gs-uitk-c-1xshiws ng-star-inserted"><gs-label data-gs-uitk-component="label" data-cy="gs-uitk-checkbox__label" data-size="sm" class="gs-label gs-uitk-c-0"><label data-cy="gs-uitk-label" class="gs-checkbox__label gs-label__label gs-uitk-c-1h2g7x"><span data-cy="gs-uitk-checkbox__container" class="gs-checkbox__container gs-uitk-c-s7mngh"><input type="checkbox" data-cy="gs-uitk-checkbox__input" class="gs-checkbox__input gs-uitk-c-165ttyl" value="bmk" disabled="true"><span data-cy="gs-uitk-checkbox__inner" class="gs-checkbox__inner gs-uitk-c-1ibs2h7"></span></span><span data-cy="gs-uitk-checkbox__children" class="gs-checkbox__children gs-uitk-c-16zo6al">Benchmark </span></label></gs-label></gs-checkbox>



import { OnChanges, OnDestroy, EventEmitter, ElementRef, SimpleChanges, ApplicationRef, ChangeDetectorRef, ComponentFactoryResolver, Injector, AfterViewInit } from '@angular/core';
import { TreeInstance, TreeProps, TreeFilterablePlugin } from './common-src';
import { ThemeService } from '@gs-ux-uitoolkit-angular/theme';
import * as i0 from "@angular/core";
/**
 * A tree is a vertical list of hierarchical items. Users can explore and view a tree by
 * expanding and collapsing groups of data.
 */
export declare class Tree implements OnChanges, OnDestroy, AfterViewInit {
    elementRef: ElementRef;
    private themeService;
    private appRef;
    private changeDetectorRef;
    private componentFactoryResolver;
    private injector;
    /**
     * The data (tree nodes) for the Tree.
     */
    data?: TreeProps['data'];
    /**
     * Options to configure the Tree.
     */
    options?: TreeProps['options'];
    /**
     * Additional classes to add on the element.
     */
    customClass?: TreeProps['className'];
    /**
     * Style classes to override.
     */
    classes?: TreeProps['classes'];
    /**
     * Event exposing the tree instance, triggered once the tree has been initialized.
     */
    instance: EventEmitter<TreeInstance>;
    private filterEl?;
    private nativeElement;
    private treeInstance?;
    private treeComponent;
    private cssClasses;
    filterOptions?: TreeFilterablePlugin;
    private themeSubscription;
    TREE_ELEMENTS: {
        treeContainer: string;
        treeItem: string;
        treeItemContent: string;
        treeItemCheckbox: string;
        treeItemLabel: string;
        treeItemExpander: string;
        treeItemLoadingIcon: string;
        treeItemAsyncError: string;
        treeItemChildren: string;
        treeItemIcon: string;
        treeItemToolkitIcon: string;
        treeItemCustomIcon: string;
        treeItemSublabel: string;
        treeFilter: string;
        treeFilterInput: string;
        treeFilterCancel: string;
    };
    constructor(elementRef: ElementRef, themeService: ThemeService, appRef: ApplicationRef, changeDetectorRef: ChangeDetectorRef, componentFactoryResolver: ComponentFactoryResolver, injector: Injector);
    private updateTheme;
    ngAfterViewInit(): void;
    private captureComponentAnalytics;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    private setup;
    private append;
    private destroyChildren;
    getClasses(): string;
    getFilterInputClassesProp(): {
        root: string;
        input: string;
    };
    private getFilterClasses;
    private getFilterInputClasses;
    private getFilterInputEl;
    static ɵfac: i0.ɵɵFactoryDeclaration<Tree, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<Tree, "gs-tree", never, { "data": "data"; "options": "options"; "customClass": "class"; "classes": "classes"; }, { "instance": "instance"; }, never, never, false, never>;
}






import { InternalTreeNode, TreeCallPluginViewRendererEvent, TreeCollapseAllEvent, TreeCollapseEvent, TreeDeselectEvent, TreeExecuteExpansionEvent, TreeExpandAllEvent, TreeExpandEvent, TreePluginViewRendererRemovedEvent, TreeSelectEvent, TreeStateViewUpdateEvent } from './tree-internal-types';
import { IconBaseProps, IconElementComponent } from '@gs-ux-uitoolkit-angular/icon-font';
/**
 * Tree node data provided by user.
 */
export interface TreeNode {
    name: string;
    key: TreeNodeKey;
    children?: TreeNode[];
    href?: string;
    isParent?: boolean;
}
/**
 * Node key supported types.
 */
export declare type TreeNodeKey = string | number;
/**
 * Todo: expose TreeNode to customRenderers instead of the internal version.
 */
export interface CustomRendererNode extends InternalTreeNode {
}
/**
 * Tree options provided by user.
 */
export interface TreeOptions {
    id?: string;
    collapseSiblings?: boolean;
    ellipsisOverflow?: boolean;
    navTreeStyle?: boolean;
    customRenderer?: TreeNodeLabelCustomRenderer;
    asyncLoading?: TreeAsyncLoadingOptions;
    plugins?: TreePlugins;
}
export interface TreeInstance {
    /**
     * API for interacting with the tree instance.
     */
    api: TreeAPI;
    /**
     * Register a callback to a tree event.
     */
    on(name: 'executeExpansion', callback: (event: TreeExecuteExpansionEvent) => void, scope?: any): void;
    on(name: 'expand', callback: (event: TreeExpandEvent) => void, scope?: any): void;
    on(name: 'expandAll', callback: (event: TreeExpandAllEvent) => void, scope?: any): void;
    on(name: 'collapse', callback: (event: TreeCollapseEvent) => void, scope?: any): void;
    on(name: 'collapseAll', callback: (event: TreeCollapseAllEvent) => void, scope?: any): void;
    on(name: 'select', callback: (event: TreeSelectEvent) => void, scope?: any): void;
    on(name: 'deselect', callback: (event: TreeDeselectEvent) => void, scope?: any): void;
    on(name: 'stateViewUpdate', callback: (event: TreeStateViewUpdateEvent) => void, scope?: any): void;
    on(name: 'callPluginViewRenderer', callback: (event: TreeCallPluginViewRendererEvent) => void, scope?: any): void;
    on(name: 'pluginViewRendererRemoved', callback: (event: TreePluginViewRendererRemovedEvent) => void, scope?: any): void;
    /**
     * Remove a callback from a tree event.
     */
    off(name: 'executeExpansion', callback: (event: TreeExecuteExpansionEvent) => void): void;
    off(name: 'expand', callback: (event: TreeExpandEvent) => void): void;
    off(name: 'expandAll', callback: (event: TreeExpandAllEvent) => void): void;
    off(name: 'collapse', callback: (event: TreeCollapseEvent) => void): void;
    off(name: 'collapseAll', callback: (event: TreeCollapseAllEvent) => void): void;
    off(name: 'select', callback: (event: TreeSelectEvent) => void): void;
    off(name: 'deselect', callback: (event: TreeDeselectEvent) => void): void;
    off(name: 'stateViewUpdate', callback: (event: TreeStateViewUpdateEvent) => void): void;
    off(name: 'callPluginViewRenderer', callback: (event: TreeCallPluginViewRendererEvent) => void): void;
    off(name: 'pluginViewRendererRemoved', callback: (event: TreePluginViewRendererRemovedEvent) => void): void;
}
export interface TreeAPI {
    /**
     * Returns the internal state of the tree. Useful for saving and later reinstating the state.
     *
     * Use with caution. If you need tree node state for your app logic, use the specific api methods like `getSelectedNodes`.
     */
    getState: () => TreeNodeMap;
    /**
     * Sets the internal state of the tree. Use when reinstating the state of the tree from saved state.
     *
     * Use with caution. Modifying internal tree state is beyond what was received by the `getState` api is not recommended, as you can corrupt the tree.
     */
    setState: (state: TreeNodeMap) => void;
    /**
     * Returns the tree node state.
     */
    getNodeState: (key: TreeNodeKey) => TreeNode;
    /**
     * Set the label name for the given node.
     */
    setLabelName: (key: TreeNodeKey, newName?: string) => void;
    /**
     * Expand the given node.
     */
    expand: (key: TreeNodeKey, expandParents?: boolean) => void;
    /**
     * Expand all nodes.
     */
    expandAll: () => void;
    /**
     * Collapse the given node.
     */
    collapse: (key: TreeNodeKey) => void;
    /**
     * Collapse all nodes.
     */
    collapseAll: () => void;
    /**
     * Enable the {@link subLabel} plugin.
     */
    enableSubLabel: () => void;
    /**
     * Disable the {@link subLabel} plugin.
     */
    disableSubLabel: () => void;
    /**
     * Enable the {@link icon} plugin.
     */
    enableIcons: () => void;
    /**
     * Disable the {@link icon} plugin.
     */
    disableIcons: () => void;
    /**
     * Enable the {@link selectable} plugin.
     */
    enableSelection: () => void;
    /**
     * Disable the {@link selectable} plugin.
     */
    disableSelection: () => void;
    /**
     * Get the current {@link allowSelfUnselect} config.
     *
     * Requires the {@link selectable} plugin to be enabled.
     */
    getAllowSelfUnselect: () => boolean;
    /**
     * Set the {@link allowSelfUnselect} config.
     *
     * Requires the {@link selectable} plugin to be enabled.
     */
    setAllowSelfUnselect: (allowSelfUnselect: boolean) => void;
    /**
     * Get the current {@link checkboxSelect} config.
     *
     * Requires the {@link selectable} plugin to be enabled.
     */
    getCheckboxSelect: () => boolean;
    /**
     * Set the {@link checkboxSelect} config.
     *
     * Requires the {@link selectable} plugin to be enabled.
     */
    setCheckboxSelect: (checkboxSelect: boolean) => void;
    /**
     * Get the current {@link expandOnSelect} config.
     *
     * Requires the {@link selectable} plugin to be enabled.
     */
    getExpandOnSelect: () => boolean;
    /**
     * Set the {@link expandOnSelect} config.
     *
     * Requires the {@link selectable} plugin to be enabled.
     */
    setExpandOnSelect: (expandOnSelect: boolean) => void;
    /**
     * Get the current {@link parentSelect} config.
     *
     * Requires the {@link selectable} plugin to be enabled.
     */
    getParentSelect: () => boolean;
    /**
     * Set the {@link parentSelect} config.
     *
     * Requires the {@link selectable} plugin to be enabled.
     */
    setParentSelect: (parentSelect: boolean) => void;
    /**
     * Get the current {@link multiSelect} config.
     *
     * Requires the {@link selectable} plugin to be enabled.
     */
    getMultiSelect: () => boolean;
    /**
     * Set the {@link multiSelect} config.
     *
     * Requires the {@link selectable} plugin to be enabled.
     */
    setMultiSelect: (multiSelect: boolean) => void;
    /**
     * Get all current {@link selectable} config values.
     *
     * Requires the {@link selectable} plugin to be enabled.
     */
    getSelectableState: () => SelectableState;
    /**
     * Set all {@link selectable} config values.
     *
     * Requires the {@link selectable} plugin to be enabled.
     */
    setSelectableState: (state: Partial<SelectableState>) => void;
    /**
     * Returns the keys of all nodes currently selected.
     *
     * Requires the {@link selectable} plugin to be enabled.
     */
    getSelectedNodes: () => TreeNodeKey[];
    /**
     * Toggle selection on the given node.
     *
     * Requires the {@link selectable} plugin to be enabled.
     */
    select: (itemKey: TreeNodeKey, expandParents?: boolean) => void;
    /**
     * Deselect all nodes.
     *
     * Requires the {@link selectable} plugin to be enabled.
     */
    deselectAllNodes: () => void;
}
/**
 * User-defined function to custom render tree node Labels
 */
export declare type TreeNodeLabelCustomRenderer = (label: HTMLElement, item: CustomRendererNode, container: HTMLElement) => HTMLElement;
/**
 * User-provided options for asynchronously loading tree nodes
 */
export interface TreeAsyncLoadingOptions {
    fetchData: FetchAsyncTreeNodesFunc;
    cacheNodes?: boolean;
}
/**
 * User-defined function to fetch tree nodes asynchronously
 */
export declare type FetchAsyncTreeNodesFunc = (key: TreeNodeKey) => Promise<TreeNode[]>;
/**
 * Tree plugin options provided by user
 */
export interface TreePlugins {
    selectable?: TreeSelectablePlugin;
    icons?: TreeIconsPlugin;
    subLabel?: TreeSubLabelPlugin;
    filterable?: TreeFilterablePlugin;
}
/**
 * Tree Selectable plugin options provided by user
 */
export interface TreeSelectablePlugin extends Partial<SelectableState> {
    customRenderer?: TreeSelectablePluginCustomRenderer;
}
/**
 * Selectable settings maintained internally
 */
export interface SelectableState {
    /**
     * Parent nodes can be selected.
     */
    parentSelect: boolean;
    /**
     * More than one node can be selected.
     */
    multiSelect: boolean;
    /**
     * Checkboxes are used to visualize selected/deselected nodes.
     */
    checkboxSelect: boolean;
    /**
     * When a parent node is selected/deselected, it also expands/collapses the parent's children.
     */
    expandOnSelect: boolean;
    /**
     * Nodes can be deselected without users choosing a different node.
     */
    allowSelfUnselect: boolean;
}
/**
 * User-defined function to custom render tree plugin checkboxes
 */
export declare type TreeSelectablePluginCustomRenderer = (checkBoxInputEl: HTMLInputElement, container: HTMLElement) => HTMLInputElement;
/**
 * Tree Icons plugin options provided by user
 */
export declare type TreeIconsPlugin = TreeIconsPluginToolkit | TreeIconsPluginCustom;
/**
 * Provide a toolkit icon name
 */
export declare type TreeIconsPluginToolkit = IconBaseProps;
/**
 * Provide an icon custom renderer
 */
export interface TreeIconsPluginCustom {
    customRenderer: TreeIconCustomRenderer;
}
/**
 * User-defined function to custom render tree plugin icons
 */
export declare type TreeIconCustomRenderer = (label: HTMLElement, iconElement: HTMLElement, container: HTMLElement, treeNode: TreeNode) => HTMLElement | IconElementComponent;
/**
 * Tree SubLabel plugin options provided by user
 */
export interface TreeSubLabelPlugin {
    subLabel?: string;
    customRenderer?: TreeSubLabelPluginCustomRenderer;
}
/**
 * User-defined function to custom render tree plugin sublabels
 */
export declare type TreeSubLabelPluginCustomRenderer = (label: HTMLElement, subLabelEl: HTMLElement, container: HTMLElement, treeNode: TreeNode) => HTMLElement;
/**
 * Tree Filterable plugin options provided by user
 */
export interface TreeFilterablePlugin {
    minFilterLength?: number;
    placeholderText?: string;
    inputDebounceTime?: number;
}
/**
 * A map of tree nodes by their key.
 */
export interface TreeNodeMap {
    [key: string]: TreeNode;
    [key: number]: TreeNode;
}
/**
 * Events emitted by the tree.
 */
export declare type TreeEventName = 'expand' | 'expandAll' | 'collapse' | 'collapseAll' | 'select' | 'deselect';
/**
 * API methods available on the tree instance.
 */
export declare type TreeAPIName = keyof TreeAPI;
/**
 * Render callbacks required to render other UIT components in Tree component.
 * Angular or React version of callback should be passed depending on the framework being used.
 *
 */
export interface TreeRenderCallbacks {
    renderLoadingIcon: (container: HTMLElement) => () => void;
}





<div class="row column-picker h-100">
    <div class="col h-100">
        <div class="d-flex flex-column h-100 p-3 pt-2">
            <div class="col-auto ms-auto"><gs-icon size="sm" name="clear" type="outlined" (click)="close()" class="column-picker__close-picker"></gs-icon></div>
            <div class="col flex-grow-1 column-picker__columns">
                <div class="row h-100">
                    <div class="col d-flex flex-column h-100 column-picker__columns-pane">
                        <h6 class="gs-uitk-text-heading-06">Choose columns</h6>
                        @if(tags.length){
                            <metrics-overflow-buttons [tags]="tags" (callFilterTreeInstance)="callFilterTreeInstance($event, 'overflow')"></metrics-overflow-buttons>
                        }
                        <div class="row mb-4">
                            <div class="col">
                                <gs-input [value]="searchText" type="search" placeholder="Search columns" class="w-100" size="sm"
                                    (valueChange)="treeFilterChanged($event)"/>
                            </div>
                        </div>
                        <div class="row column-picker__trees-wrapper">
                            <div class="col pt-0 flex-grow-1">
                                <div class="row"
                                    *ngFor="let categories of catalogueAsTree; let first=first; let last=last; trackBy: trackCategoryId" [hidden]="hiddenCategories[categories.categoryId]">
                                    <div class="col" [class.column-picker__tree]="!last" *ngIf="!categories.hidden">
                                        <h6 class="gs-uitk-text-heading-07 column-picker__tree--heading"
                                            [class.mt-0]="first">{{ categories.categoryName }}</h6>
                                        <gs-tree (clickExpandButton)="onClickExpandButton()" [data]="categories.tree" [options]="options"
                                            (instance)="treeInstanceCallback($event)"></gs-tree>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col h-100">
                        <div class="column-picker__selected-columns-pane">
                            <h6 class="gs-uitk-text-heading-06 d-flex mx-1">Selected Columns <span
                                    class="ms-auto column-picker__clear" (click)="clearSelectedPackets()">Clear
                                    all</span></h6>
                            <metrics-drag-drop-lists class="d-block column-picker__selected-columns-pane-wrapper"
                                placeholder="Please select columns to appear in this list" [items]="listItems"
                                (listReordered)="columnsReordered($event)" (itemRemoved)="packetRemoved($event)">
                            </metrics-drag-drop-lists>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-auto ms-auto">
                <gs-button emphasis="bold" actionType="primary" size="sm"
                    (click)="emitSelectedColumns()" [disabled]="!listItems.length">Done</gs-button>
            </div>
        </div>
    </div>
</div>





import { ButtonComponent, ButtonModule } from '@gs-ux-uitoolkit-angular/button';
import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { debounceTime, Subject } from 'rxjs';
import { every, findIndex, first, flatMap, isEmpty, orderBy, some, uniq } from 'lodash-es';
import { IconModule } from '@gs-ux-uitoolkit-angular/icon-font';
import { InputModule } from '@gs-ux-uitoolkit-angular/input';
import { TreeInstance, TreeModule, TreeNode, TreeNodeMap, TreeOptions } from '@gs-ux-uitoolkit-angular/tree';

import { BaseColumnPicker } from '@gsam-fi/grids/column-picker';
import { ColumnCategories, ColumnListData, ColumnPacket, DragDropItem, SelectedColumn, SelectedPacket } from '@gsam-fi/grids/typings';
import { GsAnalyticsService, trackByField } from '@gsam-fi/common';

import { AnalyticsEvents, AnalyticsProperties } from '../../analytics.events';
import { BASE_COLUMN_PICKER } from './column-picker.tokens';
import { DragDropListsComponent } from '../drag-drop-lists/drag-drop-lists.component';
import { DragDropListsContentDirective } from '../drag-drop-lists/drag-drop-lists.directive';
import { OverflowButtonsComponent } from '../common/overflow-buttons/overflow-buttons.component';

@Component({
  selector: 'metrics-column-picker',
  imports: [CommonModule, ButtonModule, DragDropListsComponent, DragDropListsContentDirective, IconModule, InputModule, TreeModule, OverflowButtonsComponent],
  providers: [
    {
      provide: BASE_COLUMN_PICKER,
      useClass: BaseColumnPicker,
    },
  ],
  templateUrl: './column-picker.component.html',
  styleUrl: './column-picker.component.scss',
  standalone: true,
})
export class ColumnPickerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() groupByTitle: boolean = false;
  @Input() catalogue: ColumnCategories[] = [];
  @Input() selectedColumns: SelectedColumn[] = [];
  @Output() readonly columnsChanged: EventEmitter<{ categoryId: string; packetId: string; columns?: string[] }[]> = new EventEmitter();
  @Output() readonly closed: EventEmitter<void> = new EventEmitter();
  @ViewChild('overflowButton', { read: ButtonComponent }) readonly dropdownButtonRef!: ButtonComponent;
  tags: string[] = [];
  activeTag: string = 'All';
  activeTreeParentKey: string | undefined = '';
  activeTreeKey = '';
  searchText: string = '';
  overflowDropdownVisible = false;
  overflowMenu: string[] = [];
  packetsToRender: string[] = [];
  catalogueAsTree: ColumnCategories[] = [];
  listItems: DragDropItem<ColumnListData>[] = [];
  hiddenCategories: Record<string, boolean> = {};
  options!: TreeOptions;
  selectedPackets: Record<string, SelectedPacket> = {};
  trackCategoryId = trackByField('categoryId');
  trackColumnField = trackByField('field');
  treeInstances!: TreeInstance[];
  private columnOrdered: DragDropItem<ColumnListData>[] = [];
  private originalTreeState!: TreeNodeMap[];
  private treeFilter$!: Subject<string>;

  constructor(
    private readonly analytics: GsAnalyticsService,
    private readonly cd: ChangeDetectorRef,
    @Inject(BASE_COLUMN_PICKER) private readonly columnPickerImpl: BaseColumnPicker,
  ) {
    this.options = columnPickerImpl.getOptions<TreeOptions>();
  }

  ngOnInit(): void {
    this.treeFilter$ = new Subject<string>();

    this.treeFilter$.pipe(debounceTime(250)).subscribe((value: string) => {
      this.callFilterTreeInstance(value);
    });

    this.originalTreeState = [];
    this.treeInstances = [];
    this.columnPickerImpl.catalogue = this.catalogue;
    this.catalogueAsTree = this.columnPickerImpl.processCatalogueAsTree(this.groupByTitle);

    const tagsArr = uniq(
      flatMap(this.catalogueAsTree, 'packets')
        .map((packet: ColumnPacket) => packet.tags)
        .flat()
        .filter((tag): tag is string => typeof tag === 'string' && tag.length > 0),
    );

    this.tags = tagsArr;
  }

  callFilterTreeInstance(value: string, isOverFlow?: string): void {
    if (isOverFlow === 'overflow') {
      this.activeTag = value;
      value = this.activeTag === 'All' ? '' : value;
      this.searchText = '';
      this.activeTreeKey = '';
      this.activeTreeParentKey = '';
      this.analytics.event(AnalyticsEvents.CLICK_QUICK_DESK_FILTER, { [AnalyticsProperties.QUICK_DESK_FILTER]: value });
    }

    if (this.activeTag === 'All' && (!value?.length || value.length < 2)) {
      this.treeInstances.forEach((instance, position) => {
        const state = this.originalTreeState[position];
        instance.api.setState(state);
      });

      this.hiddenCategories = {};
      this.analytics.event(AnalyticsEvents.RESET_SEARCH_COLUMNS, {});

      return;
    }

    this.treeInstances.forEach((instance) => {
      let category = '';
      const api = instance.api;
      const searchState = { ...api.getState() } as Record<
        string,
        TreeNode & { expanded: boolean; visible: boolean; childrenKeys: string[]; parentKey: string | undefined }
      >;
      Object.keys(searchState).forEach((key) => {
        let visible = true;
        category = first(key.split('|')) || '';
        const hasChildren = some(
          searchState[key].childrenKeys,
          (child) =>
            searchState[child].name.toLowerCase().includes(value.toLowerCase()) ||
            searchState[child].childrenKeys.some((cName) => searchState[cName].name.toLowerCase().includes(value.toLowerCase())),
        );

        if (this.activeTag !== 'All' && !isEmpty(this.activeTreeKey)) {
          if (this.activeTreeParentKey === key || key.includes(this.activeTreeKey)) {
            if (!searchState[key].name.toLowerCase().includes(value.toLowerCase()) && !hasChildren) {
              visible = false;
            }
          } else {
            visible = false;
          }
        } else if (!searchState[key].name.toLowerCase().includes(value.toLowerCase()) && !hasChildren) {
          visible = false;
        } else {
          this.activeTreeParentKey = searchState[key].parentKey;
          this.activeTreeKey = key;
        }

        searchState[key] = {
          ...searchState[key],
          visible,
          expanded: hasChildren,
        };
      });

      this.hiddenCategories[category] = every(searchState, { visible: false });
      api.setState(searchState);
    });

    this.analytics.event(AnalyticsEvents.SEARCH_COLUMNS, { [AnalyticsProperties.SEARCH_TERM]: value.toLowerCase() });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.catalogue && !changes.catalogue.firstChange) {
      this.columnPickerImpl.catalogue = changes.catalogue.currentValue as ColumnCategories[];
      this.catalogueAsTree = this.columnPickerImpl.processCatalogueAsTree(this.groupByTitle);
    }

    if (changes.selectedColumns) {
      const selectedColumns = changes.selectedColumns.currentValue as SelectedColumn[];
      this.selectedPackets = this.columnPickerImpl.generatePacketsFromSelectedColumns(selectedColumns);
      this.catalogue.forEach((category) => {
        if (!this.selectedPackets[category.categoryId]) {
          this.selectedPackets[category.categoryId] = { packets: [] };
        }
      });

      this.transformIntoListItems(this.selectedPackets);
      this.columnOrdered = orderBy(this.listItems, (item) => {
        const [categoryId, packetId] = item.data?.id.split('|') || [];

        return findIndex(selectedColumns, { categoryId, packetId });
      });
    }
  }

  ngOnDestroy(): void {
    this.originalTreeState = [];
    this.treeInstances = [];
    this.treeFilter$.complete();
  }

  onClickExpandButton(): void {
    const abc = "abc";
    console.log(abc);
  }

  clearSelectedPackets(): void {
    this.listItems = [];
    this.columnOrdered = [];

    Object.keys(this.selectedPackets).forEach((categoryId) => {
      this.selectedPackets[categoryId] = { packets: [] };
    });
    this.treeInstances.forEach((instance) => instance.api.deselectAllNodes());
    this.analytics.event(AnalyticsEvents.CLEAR_SELECTED_PACKETS, {});
  }

  close(): void {
    this.closed.emit();
    this.analytics.event(AnalyticsEvents.CLOSE_COLUMN_PICKER, {});
  }

  columnsReordered(columns: DragDropItem<ColumnListData>[]): void {
    this.columnOrdered = columns;
    this.analytics.event(AnalyticsEvents.REORDER_SELECTED_PACKETS, {
      [AnalyticsProperties.SELECTED_COLUMNS]: columns.map((col) => col.data?.includedColumns.map((includedCol) => includedCol.field)).flat(),
    });
  }

  emitSelectedColumns(): void {
    const orderedSelectedColumnSets = this.columnPickerImpl.getSelectedColumnSetsInOrder(this.columnOrdered, this.selectedPackets);
    this.columnsChanged.emit(orderedSelectedColumnSets);
    this.analytics.event(AnalyticsEvents.APPLY_COLUMN_PICKER, {
      [AnalyticsProperties.SELECTED_CATEGORIES]: orderedSelectedColumnSets.map((col) => col.categoryId),
      [AnalyticsProperties.SELECTED_PACKETS]: orderedSelectedColumnSets.map((col) => col.packetId),
      [AnalyticsProperties.SELECTED_COLUMNS]: orderedSelectedColumnSets.map((col) => col.columns?.flat()),
    });
  }

  packetRemoved({ item, parentId }: { item: DragDropItem<ColumnListData>; parentId?: string }): void {
    if (!item.data) {
      return;
    }

    const data = item.data;
    const tree = this.treeInstances.find((instance) => Object.keys(instance.api.getState()).includes(parentId ?? data.id));

    if (tree) {
      tree.api.select(data.id);
      this.analytics.event(AnalyticsEvents.DESELECT_COLUMN_PACKET, { [AnalyticsProperties.SELECTED_PACKETS]: data.id });
    }
  }

  treeInstanceCallback(treeInstance: TreeInstance): void {
    const instance = this.columnPickerImpl.registerTreeInstance({
      treeInstance,
      selectedPacketsRef: this.selectedPackets,
      listItemsCallback: (selectedPacketsRef) => this.transformIntoListItems(selectedPacketsRef),
      analyticsCallback: (callbackEvent) => this.analyticsCallback(callbackEvent),
    });
    this.treeInstances.push(instance);
    this.originalTreeState.push({ ...instance.api.getState() });
    this.transformIntoListItems(this.selectedPackets);
  }

  treeFilterChanged($event: string | number | undefined): void {
    const value = $event as string;
    this.searchText = value;
    this.treeFilter$.next(value);
  }

  private transformIntoListItems(selectedPackets: Record<string, SelectedPacket>): void {
    this.listItems = this.columnPickerImpl.orderSelectedPacketsIntoListItems(selectedPackets, this.columnOrdered);
    this.columnOrdered = this.listItems;
  }

  private analyticsCallback(callbackEvent: { type: string; identifiers: { categoryId: string; packetId: string; columnId?: string } }): void {
    let eventName: AnalyticsEvents | undefined = undefined;

    switch (callbackEvent.type) {
      case 'select':
        eventName = callbackEvent.identifiers.columnId ? AnalyticsEvents.SELECT_COLUMN : AnalyticsEvents.SELECT_COLUMN_PACKET;
        break;

      case 'deselect':
        eventName = callbackEvent.identifiers.columnId ? AnalyticsEvents.DESELECT_COLUMN : AnalyticsEvents.DESELECT_COLUMN_PACKET;
        break;

      case 'expand':
        eventName = AnalyticsEvents.EXPAND_COLUMN_PACKET;
        break;

      case 'collapse':
        eventName = AnalyticsEvents.COLLAPSE_COLUMN_PACKET;
        break;

      default:
        break;
    }

    if (eventName) {
      this.analytics.event(eventName, {
        [AnalyticsProperties.SELECTED_CATEGORIES]: callbackEvent.identifiers.categoryId,
        [AnalyticsProperties.SELECTED_COLUMNS]: callbackEvent.identifiers.columnId,
        [AnalyticsProperties.SELECTED_PACKETS]: callbackEvent.identifiers.packetId,
      });
    }
  }
}

