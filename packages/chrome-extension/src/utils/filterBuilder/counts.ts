const counts = <T extends App.Filter.Item>(config: App.Filter.FilterGroupConfig<T>, full: string, items: T[]): number =>
  items.filter((item, index) => config.run(item, full, index)).length;

export default counts;