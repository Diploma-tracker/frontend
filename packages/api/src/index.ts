export { API, type ApiError, type ApiResponse, type IApiClient } from './api';

export * as types from './types';
export * as model from './generated/model';
export * as iam from './generated/iam';
export * as auth from './generated/auth';
export * as allocationRound from './generated/allocation-round';
export * as supervisionApplication from './generated/supervision-application';
export * as thesisDefenseSession from './generated/thesis-defense-session';
export * as bachelorThesisProcess from './sdk/bachelor-thesis-process';

// Convenience re-exports of commonly used model types
export type { ThesisDataDTO, TopicDTO, FileDTO } from './generated/model';
