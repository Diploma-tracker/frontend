import { isActiveAtom } from '@/modules/bpmn-editor';
import { k } from '@/shared/utils/i18n';
import {
  FlowArrowIcon,
  type Icon,
  SquaresFourIcon,
  StackIcon,
} from '@phosphor-icons/react';
import { action, atom } from '@reatom/core';

export interface DesignTab {
  id: string;
  name: string;
  icon?: Icon;
  subTabs?: DesignTab[];
}

export const designTabs: DesignTab[] = [
  {
    id: 'project-definition',
    name: k('design.definition'),
    icon: StackIcon,
  },
  { id: 'bpmn', name: k('design.process'), icon: FlowArrowIcon },
  {
    id: 'forms',
    name: k('design.forms'),
    icon: SquaresFourIcon,
    subTabs: [
      { id: 'search', name: k('common.search') },
      {
        id: 'builder',
        name: k('sidebar.nav.formBuilder'),
        subTabs: [
          { id: 'build', name: k('formBuilder.tabs.build') },
          { id: 'preview', name: k('formBuilder.tabs.preview') },
        ],
      },
    ],
  },
];

const firstPath = (tabs: DesignTab[]): string[] => {
  const first = tabs[0];
  if (!first) return [];
  return [first.id, ...(first.subTabs ? firstPath(first.subTabs) : [])];
};

const findTab = (tabs: DesignTab[], id: string): DesignTab | undefined =>
  tabs.find((tab) => tab.id === id);

const normalizePath = (path: string[]): string[] => {
  const normalized: string[] = [];
  let siblings = designTabs;

  for (const id of path) {
    const tab = findTab(siblings, id);
    if (!tab) break;
    normalized.push(tab.id);
    if (!tab.subTabs) break;
    siblings = tab.subTabs;
  }

  let currentTabs = siblings;
  while (currentTabs.length > 0) {
    const child = currentTabs[0];
    if (!child) break;
    normalized.push(child.id);
    if (!child.subTabs) break;
    currentTabs = child.subTabs;
  }

  return normalized;
};

/** Current nested design route, e.g. ['forms', 'builder', 'preview']. */
export const activeTabPathAtom = atom<string[]>(
  firstPath(designTabs),
  'design.activeTabPath',
);

const rememberedPaths = new Map(
  designTabs.map((tab) => [tab.id, firstPath([tab])]),
);

export const setActiveTab = action((...path: string[]) => {
  const currentPath = activeTabPathAtom();
  if (currentPath[0]) {
    rememberedPaths.set(currentPath[0], [...currentPath]);
  }

  const nextPath =
    path.length === 1
      ? (rememberedPaths.get(path[0]!) ?? normalizePath(path))
      : normalizePath(path);

  activeTabPathAtom.set(nextPath);
  if (nextPath[0]) rememberedPaths.set(nextPath[0], [...nextPath]);
  isActiveAtom.set(nextPath[0] === 'bpmn');
}, 'design.setActiveTab');
