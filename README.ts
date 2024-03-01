import { ButtonModule } from '@gs-ux-uitoolkit-angular/button';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { every, findIndex, first, orderBy, some } from 'lodash-es';
import { IconModule } from '@gs-ux-uitoolkit-angular/icon-font';
import { InputModule } from '@gs-ux-uitoolkit-angular/input';
import { TreeInstance, TreeModule, TreeNode, TreeNodeMap, TreeOptions } from '@gs-ux-uitoolkit-angular/tree';

import { BaseColumnPicker } from '@gsam-fi/grids/column-picker';
import { ColumnCategories, ColumnListData, DragDropItem, SelectedColumn, SelectedPacket } from '@gsam-fi/grids/typings';
import { GsAnalyticsService, trackByField } from '@gsam-fi/common';

import { AnalyticsEvents, AnalyticsProperties } from '../../analytics.events';
import { BASE_COLUMN_PICKER } from './column-picker.tokens';
import { DragDropListsComponent } from '../drag-drop-lists/drag-drop-lists.component';
import { DragDropListsContentDirective } from '../drag-drop-lists/drag-drop-lists.directive';

@Component({
  selector: 'metrics-column-picker',
  imports: [
    CommonModule,
    ButtonModule,
    DragDropListsComponent,
    DragDropListsContentDirective,
    IconModule,
    InputModule,
    TreeModule
  ],
  providers: [{
      provide: BASE_COLUMN_PICKER,
      useClass: BaseColumnPicker
  }],
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
  tags: string[] = ["All", "FI IG", "FI HY", "FI EM", "FI Sovs", "FI Muni", "Equities"];
  activeTag: string = "All";
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
    @Inject(BASE_COLUMN_PICKER) private readonly columnPickerImpl: BaseColumnPicker,
  ) {
    this.options = columnPickerImpl.getOptions<TreeOptions>();
  }

  ngOnInit(): void {
    this.treeFilter$ = new Subject<string>();
    this.treeFilter$.pipe(debounceTime(250)).subscribe((value: string) => {
      if (!value?.length || value.length < 2) {
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
        const searchState = { ...api.getState() } as Record<string, TreeNode & { expanded: boolean; visible: boolean; childrenKeys: string[] }>;
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

      this.analytics.event(AnalyticsEvents.SEARCH_COLUMNS, { [AnalyticsProperties.SEARCH_TERM]: value.toLowerCase() });
    });

    this.originalTreeState = [];
    this.treeInstances = [];
    this.columnPickerImpl.catalogue = this.catalogue;
    this.catalogueAsTree = this.columnPickerImpl.processCatalogueAsTree(this.groupByTitle);
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



<div class="row column-picker h-100">
    <div class="col h-100">
        <div class="d-flex flex-column h-100 p-3 pt-2">
            <div class="col-auto ms-auto"><gs-icon size="sm" name="clear" type="outlined" (click)="close()" class="column-picker__close-picker"></gs-icon></div>
            <div class="col flex-grow-1 column-picker__columns">
                <div class="row h-100">
                    <div class="col d-flex flex-column h-100 column-picker__columns-pane">
                        <h6 class="gs-uitk-text-heading-06">Choose columns</h6>
                        <div class="row mt-2 mb-3 g-0 flex-nowrap">
                            @for(tag of tags; track $index){
                                <div class="col-auto me-1">
                                    <gs-button size="sm" shape="circle" class="metrics-button" emphasis="subtle"
                                        [actionType]="tag === activeTag ? 'primary' : 'secondary'">
                                        {{ tag }}
                                    </gs-button>
                                </div>
                            }
                        </div>
                        <div class="row mb-4">
                            <div class="col">
                                <gs-input type="search" placeholder="Search columns" class="w-100" size="sm"
                                    (valueChange)="treeFilterChanged($event)" />
                            </div>
                        </div>
                        <div class="row column-picker__trees-wrapper">
                            <div class="col pt-0 flex-grow-1">
                                <div class="row"
                                    *ngFor="let categories of catalogueAsTree; let first=first; let last=last; trackBy: trackCategoryId" [hidden]="hiddenCategories[categories.categoryId]">
                                    <div class="col" [class.column-picker__tree]="!last" *ngIf="!categories.hidden">
                                        <h6 class="gs-uitk-text-heading-07 column-picker__tree--heading"
                                            [class.mt-0]="first">{{ categories.categoryName }}</h6>
                                        <gs-tree [data]="categories.tree" [options]="options"
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
