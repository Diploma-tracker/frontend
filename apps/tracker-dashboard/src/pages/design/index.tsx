import { PageLayout } from '@/layouts/page-layout/page-layout';
import { DesignPage } from '@/modules/design';
import { reatomComponent } from '@reatom/react';

export const DesignPageRoute = () => (
  <PageLayout height="screen" bleed>
    <DesignPage />
  </PageLayout>
);

export const DesignPageComponent = reatomComponent(
  DesignPageRoute,
  'DesignPageRoute',
);
