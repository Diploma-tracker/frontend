import {
  type PersistRecord,
  type PersistStorage,
  withCookie,
} from '@reatom/core';

// Cookie persistence is outside feature tests; document.cookie cannot subscribe.
const cookieRecords = new Map<string, PersistRecord<string>>();
const cookieStorage: PersistStorage<string> = {
  name: 'test cookies',
  cache: cookieRecords,
  get: ({ key }) => cookieRecords.get(key) ?? null,
  set: ({ key }, record) => {
    cookieRecords.set(key, record);
  },
};

withCookie.storageAtom.set(cookieStorage);

export function resetCookieStorage() {
  cookieRecords.clear();
}
