import { JSONNode } from 'query-ast';
import { SchemaNodeType, DependencyFile } from '..';
import buildRules from './buildRules';

const buildFiles = (files: DependencyFile[]): JSONNode<SchemaNodeType>[] => {
  const filesValue = files.map((file) => {
    const rules = buildRules(file.content);
    const currentFile: JSONNode<SchemaNodeType> = {
      type: 'file',
      value: [
        {
          type: 'fileLocation',
          value: file.location,
        },
        rules,
      ],
    };

    return currentFile;
  });

  return filesValue;
};

export default buildFiles;
