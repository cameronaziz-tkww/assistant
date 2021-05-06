export const nodes = <T>(list: API.DataStructure.NodeList<T>): T[] => list.nodes.map((node) => node);
