import React, { useEffect } from 'react';
import Router from 'next/router';

import * as MenuAPI from './api/MenuApi';

export default function Home() {
  const dataMenu = async () => {
    const resultMenu = await MenuAPI.getMenuBuyer();
    if (resultMenu !== null) {
      Router.push({
        pathname: '/dashboard',
      });
    }
  };

  useEffect(() => {
    dataMenu();
  }, []);

  return <div />;
}
