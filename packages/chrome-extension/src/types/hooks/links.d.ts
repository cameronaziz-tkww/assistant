declare namespace Hooks {
  namespace Links {
    interface UseLinksDispatch {
      standard: App.Links.StandarBuiltConfig[];
      custom: App.Links.BuildConfig[];
      active: (App.Links.CustomConfig | App.Links.StandardBuiltConfig)[]
      enabled: (App.Links.CustomConfig | App.Links.StandardBuiltConfig)[]
      all: (App.Links.CustomConfig | App.Links.StandardBuiltConfig)[]
    }

    interface UseLinks {
      (): UseLinksDispatch;
    }

    interface UseGetLinksDispatch {
      (): void;
    }

    interface UseGetLinks {
      (): UseGetLinksDispatch;
    }

    interface UpdateLink<T extends keyof App.Links.Link> {
      id: App.Links.Name | string;
      key: T;
      value: App.Links.Link[T];
      noStorage?: boolean;
    }

    interface UseUpdateLinkDispatch {
      <T extends keyof App.Links.Link>(config: UpdateLink<T>): void;
    }

    interface UseUpdateLink {
      (): UseUpdateLinkDispatch
    }

    interface UseDeleteLinkDispatch {
      (linkId: string): void;
    }

    interface UseDeleteLink {
      (): UseDeleteLinkDispatch
    }

    interface UseReorderLinksDispatch {
      reorder(dragIndex: number, hoverIndex: number, sourcePosition: number): void;
      save(): void;
    }

    interface UseReorderLinks {
      (): UseReorderLinksDispatch
    }

    interface UseCreateLinkDispatch {
      (link: App.Links.CreateConfig): void;
    }

    interface UseCreateLink {
      (): UseCreateLinkDispatch
    }

    interface UseHotkeyLinksDispatch {
      (nextEnabled: boolean): void;
    }

    interface UseHotkeyLinks {
      (): UseHotkeyLinksDispatch
    }

    interface UseSaveLinksDispatch {
      save(): void;
    }

    interface UseSaveLinks {
      (): UseSaveLinksDispatch
    }
  }
}