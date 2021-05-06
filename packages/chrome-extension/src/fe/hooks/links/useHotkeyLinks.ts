import { links } from '@context';
import { useEffect, useState } from 'react';
import useLinks from './useLinks';
import useUpdateLink from './useUpdateLink';

const useHotkeyLinks: Hooks.Links.UseHotkeyLinks = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const { active } = useLinks();
  const updateLink = useUpdateLink();

  const trackedState = links.useTrackedState();
  const setDraft = links.useSetDraft();

  useEffect(
    () => {
      if (!trackedState.hasInit.includes('hotkeys')) {
        setDraft((draft) => {
          const draftInit = draft.hasInit.filter((link) => link !== 'hotkeys');
          draft.hasInit = [...draftInit, 'hotkeys'];
        });
      }
    },
    [],
  );

  useEffect(
    () => {
      if (isEnabled) {
        window.addEventListener('keydown', keydown);
        return () => {
          window.removeEventListener('keydown', keydown);
        };
      }

      window.removeEventListener('keydown', keydown);

      return () => {
        window.removeEventListener('keydown', keydown);
      };
    },
    [active, isEnabled],
  );

  const keydown = (event: KeyboardEvent) => {
    if (isEnabled) {
      const link = active
        .find((link) => link.hotkey?.toUpperCase() === event.key.toUpperCase());

      if (link) {
        updateLink({
          id: link.id,
          key: 'isLoading',
          value: false,
          noStorage: true,
        });
        window.location.href = link.url;
      }
    }
  };

  const updateIsEnabled = (nextEnabled: boolean) => {
    setIsEnabled(nextEnabled);
  };

  return updateIsEnabled;
};

export default useHotkeyLinks;
