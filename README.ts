import { AnyAction, Dispatch, Middleware } from '@reduxjs/toolkit';
import { each, find, uniq } from 'lodash-es';
import { GetCoverageNew } from '../models/entitites-view/issuer-view-coverage.model';
import { setCoverageGroupsByIssuerEntity, setCoverageGroupsByRole } from './reducers/mappings.reducer';
import { setSelectedIssuerCoverage } from './actions/actions';

type AppMiddleware = Middleware<object, any>;

export const modifySelectedIssuerCoverage: AppMiddleware = (store) => (next: Dispatch) => (action: AnyAction) => {
  if (action.type === 'issuerView/setSelectedCoverageGroupState') {
    const { data, selectedAssetClass } = store.getState().issuerView;
    store.dispatch(
      setSelectedIssuerCoverage(
        action.payload ? (find(data[selectedAssetClass]?.coverageDeskMappingList, { coverageGroup: action.payload }) as GetCoverageNew) : {},
      ),
    );
  }

  return next(action);
};

export const computeCoverageGroupsByRole: AppMiddleware = (store) => (next: Dispatch) => (action: AnyAction) => {
  if (action.type === 'mappings/setCoverageGroups') {
    const coverageGroups = action.payload;
    const coverageGroupsByRole: { [key: string]: string[] } = {};
    each(coverageGroups, (coverageGroup) => {
      if (coverageGroupsByRole[coverageGroup.permitResource.adminRole]) {
        coverageGroupsByRole[coverageGroup.permitResource.adminRole] = uniq([
          ...coverageGroupsByRole[coverageGroup.permitResource.adminRole],
          coverageGroup.investmentviewId,
        ]);
      } else {
        coverageGroupsByRole[coverageGroup.permitResource.adminRole] = [coverageGroup.investmentviewId];
      }
    });
    store.dispatch(setCoverageGroupsByRole(coverageGroupsByRole));
  }

  return next(action);
};

export const computeCoverageGroupsByIssuerEntityType: AppMiddleware = (store) => (next: Dispatch) => (action: AnyAction) => {
  if (action.type === 'mappings/setCoverageGroups') {
    const coverageGroups = action.payload;
    const coverageGroupsByIssuerEntity: { [key: string]: string[] } = {};
    each(coverageGroups, (coverageGroup) => {
      if (coverageGroupsByIssuerEntity[coverageGroup.issuerEntityType]) {
        coverageGroupsByIssuerEntity[coverageGroup.issuerEntityType] = uniq([
          ...coverageGroupsByIssuerEntity[coverageGroup.issuerEntityType],
          coverageGroup.investmentviewId,
        ]);
      } else {
        coverageGroupsByIssuerEntity[coverageGroup.issuerEntityType] = [coverageGroup.investmentviewId];
      }
    });
    store.dispatch(setCoverageGroupsByIssuerEntity(coverageGroupsByIssuerEntity));
  }

  return next(action);
};
