const counts = <T extends App.Filter.Item>(config: App.Filter.GroupConfig<T>, full: string, items: T[]): number =>
  items.filter((item) => config.run(item, full)).length;

export default counts;