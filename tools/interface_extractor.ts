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

/* eslint-disable import/no-extraneous-dependencies */

import fs from 'fs';

import { Project } from 'ts-morph';
import { Command } from 'commander';
import { exit } from 'process';

const program = new Command();

program
  .requiredOption('-s <src>', 'source ts file')
  .requiredOption('-o <out>', 'output ts file')
  .requiredOption('-t <tsconfig>', 'path to the tsconfig.json')
  .option('-r <json>', 'rewrite import rules');

program.parse();
const options = program.opts();

const project = new Project({
  tsConfigFilePath: options.t,
});

const rewriteRules = options.r ? JSON.parse(options.r) : [];

const sourceFile = project.addSourceFileAtPath(options.s);
const destFile = project.createSourceFile(options.o.replace('d.ts', 'ts'));

// step 1: rewrite any imports at source if needed. This prevents the unneeded dependency on the dep.ts instead of
//         dep_interface.d.ts. Add the final imports to the dest.
for (const imp of sourceFile.getImportDeclarations()) {
  const modSpecifier = imp.getModuleSpecifierValue();
  const rewrite = rewriteRules[modSpecifier];
  if (rewrite) {
    imp.setModuleSpecifier(rewrite);
  }

  destFile.addImportDeclaration(imp.getStructure());
}

// step 2: extract the first class of the source and convert it into an interface. Add it to the dest.
const sourceClass = sourceFile.getClasses()[0];
const destInterface = sourceClass.extractInterface(sourceClass.getName());
destInterface.isDefaultExport = true;
const interfaceDecl = destFile.addInterface(destInterface);

// step 3: remove any methods/props that are marked with @internal.
for (const method of interfaceDecl.getMethods()) {
  if (method.getJsDocs().find((doc) => doc.getTags().find((tag) => tag.getTagName() === 'internal')) !== undefined) {
    method.remove();
  }
}
for (const prop of interfaceDecl.getProperties()) {
  if (prop.getJsDocs().find((doc) => doc.getTags().find((tag) => tag.getTagName() === 'internal')) !== undefined) {
    prop.remove();
  }
}

// step 4: remove any unused imports left over the step 3 cleanup.
destFile.fixUnusedIdentifiers();

const outputFiles = destFile.getEmitOutput().getOutputFiles();
const destText = outputFiles.find((of) => of.getFilePath().endsWith('.d.ts'))?.getText() as string;

const diagnostics = destFile.getPreEmitDiagnostics();
if (diagnostics.length > 0) {
  console.error(project.formatDiagnosticsWithColorAndContext(diagnostics));
  exit(1);
}

fs.writeFileSync(options.o, destText, { encoding: 'utf8' });
