import { SchemaType }  from '@tkww-assistant/dependencies';
import { NewJSONNode } from 'query-ast';

export interface Dependencies {
  nameVersion: string;
  wrapper: NewJSONNode<SchemaType>
}

export interface Storage {
  dependencies: Dependencies[]
}

export as namespace WorkspaceState;