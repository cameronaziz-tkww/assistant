import { SchemaType } from "@tkww-assistant/dependencies";
import { Log } from "@tkww-assistant/utils";
import { QueryWrapper } from "query-ast";

const getNameVersion = (wrapper: QueryWrapper<SchemaType>): string => {
  const name = wrapper.find('name').value();
  const version = wrapper.find('version').value();
  return `${name} - ${version}`;
};

const logLevel = (level: Log.Level) => {
  if (level === 0) {
    return 'INFO';
  }
  if (level === 1) {
    return 'WARNING';
  }
  if (level === 2) {
    return 'ERROR';
  }
  return 'UNKNOWN';
}

interface LogDroppedDependenciesConfig {
  newDependencies: QueryWrapper<SchemaType>;
  existingDependendencies: QueryWrapper<SchemaType>;
  log: Log.Logger;
}
const logDroppedDependencies = (config: LogDroppedDependenciesConfig) => {
  const { newDependencies, existingDependendencies, log } = config;
  const droppedDependencies = existingDependendencies
    .find('dependency')
    .has(({ node }) =>
      node.type === 'name' && !newDependencies
        .find('dependency')
        .find('name')
        .map(({ node }) => node.value)
        .includes(node.value)
    )
    .has(({ node }) =>
      node.type === 'version' && !newDependencies
        .find('dependency')
        .find('version')
        .map(({ node }) => node.value)
        .includes(node.value)
    );

  for (let i = 0; i < droppedDependencies.length(); i += 1) {
    const droppedDependency = droppedDependencies.eq(i);
    const nameVersionMessage = getNameVersion(droppedDependency);
    log(`Dropped ${nameVersionMessage} from active.`, 0);
  }
};

const buildNewWrappers = (wrappers: QueryWrapper<SchemaType>[], log: Log.Logger) => {
  return wrappers.map(
    (currentWrapper): WorkspaceState.Dependencies => {
      const wrapper = currentWrapper.get(0);
      const nameVersion = getNameVersion(currentWrapper)
      log(`Saving ${nameVersion} to workplace state.`, 0);
      return {
        nameVersion,
        wrapper,
      }
    }
  );
};

const buildWrappers = (wrapper: QueryWrapper<SchemaType>, log: Log.Logger) => {
  return wrapper.map(
    (node, index): WorkspaceState.Dependencies => {
      const currentWrapper = wrapper.eq(index);
      const nameVersion = getNameVersion(currentWrapper)
      log(`Addig ${nameVersion} to workplace state.`, 0);
      return {
        nameVersion,
        wrapper: node.toJSON(),
      }
    }
  );
};

export default {
  buildNewWrappers,
  buildWrappers,
  getNameVersion,
  logLevel,
  logDroppedDependencies,
};
