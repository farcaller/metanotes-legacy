// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

interface FetchIdle {
  type: 'idle';
}

interface FetchPending {
  type: 'pending';
}

export interface FetchFailed {
  type: 'failed';
  error: Error;
}

export type FetchStatus = FetchIdle | FetchPending | FetchFailed;

/**
 * Type guard for the FetchStatus.
 *
 * @param status The status.
 * @returns FetchIdle if the status is idle.
 */
export function isIdle(status: FetchStatus): status is FetchIdle {
  return status.type === 'idle';
}

/**
 * Type guard for the FetchStatus.
 *
 * @param status The status.
 * @returns FetchPending if the status is pending.
 */
export function isPending(status: FetchStatus): status is FetchPending {
  return status.type === 'pending';
}

/**
 * Type guard for the FetchStatus.
 *
 * @param status The status.
 * @returns FetchFailed if the status is failed.
 */
export function isFailed(status: FetchStatus): status is FetchFailed {
  return status.type === 'failed';
}
