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

interface UploadIdle {
  type: 'idle';
}

interface UploadPending {
  type: 'pending';
}

export interface UploadFailed {
  type: 'failed';
  error: Error;
}

export type UploadStatus = UploadIdle | UploadPending | UploadFailed;

/**
 * Type guard for the UploadStatus.
 *
 * @param status The status.
 * @returns UploadIdle if the status is idle.
 */
export function isIdleUpload(status: UploadStatus): status is UploadIdle {
  return status.type === 'idle';
}

/**
 * Type guard for the UploadStatus.
 *
 * @param status The status.
 * @returns UploadPending if the status is pending.
 */
export function isPendingUpload(status: UploadStatus): status is UploadPending {
  return status.type === 'pending';
}

/**
 * Type guard for the UploadStatus.
 *
 * @param status The status.
 * @returns UploadFailed if the status is failed.
 */
export function isFailedUpload(status: UploadStatus): status is UploadFailed {
  return status.type === 'failed';
}
