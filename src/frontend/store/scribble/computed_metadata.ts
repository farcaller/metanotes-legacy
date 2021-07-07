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

import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';
import yaml from 'js-yaml';
import { makeAutoObservable } from 'mobx';

import { DraftKey, TitleKey, InstantiateKey, ContentTypeKey } from './metadata';
import { ScribbleID } from './ids';

const ajv = new Ajv();
const TagSchemaDefinition: JSONSchemaType<string[]> = {
  // "$schema": "https://json-schema.org/draft/2019-09/schema",
  // "$id": "https://metanotes.org/schemas/v1/tag.schema.json",
  // "title": "Metanotes tag attribute",
  type: 'array',
  items: {
    type: 'string',
  },
};
const TagSchema = ajv.compile(TagSchemaDefinition);

const ListSchemaDefinition: JSONSchemaType<string[]> = {
  // "$schema": "https://json-schema.org/draft/2019-09/schema",
  // "$id": "https://metanotes.org/schemas/v1/tag.schema.json",
  // "title": "Metanotes list attribute",
  type: 'array',
  items: {
    type: 'string',
  },
};
const ListSchema = ajv.compile(ListSchemaDefinition);

interface Version {
  getMeta(key: string): string|undefined;
}

/**
 * Mobx model for the scribble version's computed metadata.
 */
export default class ComputedMetadata {
  /** The owning version. */
  private version: Version;

  /**
   * Creates a new computed metadata.
   *
   * @param version The owning version.
   */
  constructor(version: Version) {
    makeAutoObservable<ComputedMetadata, 'version'>(this, {
      version: false,
    });
    this.version = version;
  }

  /**
   * Returns the parsed field.
   *
   * @param field The Field name in the original metadata.
   * @param schema The schema to validate against.
   * @param empty The default value that's returned if validation fails.
   * @returns The parsed value or empty if validation fails.
   */
  private fieldWithSchema<T>(field: string, schema: ValidateFunction<string[]>, empty: T): T {
    const val = this.version.getMeta(field);
    if (!val) { return empty; }

    const parsedVal = yaml.load(val) as unknown as T;
    if (schema(parsedVal)) {
      return parsedVal;
    }
    // eslint-disable-next-line no-console
    console.error(`scribble version ${this.version} has incorrectly formatted field ${field}: ${parsedVal}`);
    return empty;
  }

  get tags(): string[] {
    return this.fieldWithSchema('tags', TagSchema, []);
  }

  get list(): string[] {
    return this.fieldWithSchema('list', ListSchema, []);
  }

  get isDraft(): boolean {
    return this.version.getMeta(DraftKey) === 'true';
  }

  get title(): string {
    return this.version.getMeta(TitleKey) ?? '';
  }

  get instantiate(): ScribbleID|undefined {
    return this.version.getMeta(InstantiateKey);
  }

  get contentType(): string {
    return this.version.getMeta(ContentTypeKey);
  }
}
