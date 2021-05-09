import { getImportLocation } from '@tkww-assistant/atrules';
import { QueryWrapper } from 'query-ast';
import { SchemaNodeType, DependencyImportLocation} from '..';

const getImports = <T extends {}>(
  queryDependencies: QueryWrapper<SchemaNodeType, T>
): DependencyImportLocation<T>[] => {
  const dependencyImports: DependencyImportLocation<T>[] = []
  const files = queryDependencies
    .find('file');
  for (let i = 0; i < files.length(); i += 1) {
    const file = files.eq(i);
    const dependencyImport = getImportLocation(file);
    dependencyImports.push({
      dependencyImport,
      wrapper: file,
    });
  }

  return dependencyImports
};

export default getImports;