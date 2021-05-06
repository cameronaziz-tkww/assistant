declare namespace Storage {
  namespace Links {
    interface All {
      linksStandard: App.Links.StandardConfig[];
      linksCustom: App.Links.CustomConfig[];
      linksOrder: App.Links.Order[]
    }
  }
}
