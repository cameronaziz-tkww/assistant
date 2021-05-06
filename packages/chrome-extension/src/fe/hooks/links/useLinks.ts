import { links } from '@context';
import { enabled, pathsNeeded } from './utilities';

const useLinks: Hooks.Links.UseLinks = () => {
  const trackedState = links.useTrackedState();
  const { standard, custom } = trackedState;

  const standardBuilt = trackedState.standard.map((link) => ({
    ...link,
    pathsNeeded: pathsNeeded.find((needed) => needed.name === link.id)?.pathsNeeded || [],
  }));

  return {
    enabled: enabled.all(custom, standardBuilt),
    active: enabled.active(custom, standardBuilt),
    custom,
    standard: standardBuilt,
    all: [...standard, ...trackedState.custom],
  };
};

export default useLinks;
