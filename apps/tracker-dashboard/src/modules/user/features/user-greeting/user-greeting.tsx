import { useState } from 'react';
import { useInterval } from 'react-use';

import { userAtom } from '@/modules/user';
import { k, useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';

const getGreetingKey = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return k('common.greeting.morning');
  if (hour >= 12 && hour < 18) return k('common.greeting.afternoon');
  if (hour >= 18 && hour < 23) return k('common.greeting.evening');

  return k('common.greeting.night');
};

export const UserGreeting = reatomComponent(function UserGreeting() {
  const { t } = useTranslation();

  const [greetingKey, setGreetingKey] = useState<string>(getGreetingKey);

  const user = userAtom();

  useInterval(() => {
    setGreetingKey(getGreetingKey());
  }, 60000);

  return (
    <div className="flex items-center space-x-2">
      <h1 className="text-2xl font-bold">
        {t(greetingKey)}, {user.firstName}!
      </h1>
    </div>
  );
});
