import Theme from 'rspress/theme';
import { NavIcon } from '..';

const Layout = () => {
  return <Theme.Layout beforeNavTitle={<NavIcon />} />;
};

export default {
  ...Theme,
  Layout,
};

export * from 'rspress/theme';
