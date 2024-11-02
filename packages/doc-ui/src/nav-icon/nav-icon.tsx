import { Popover } from '../popover';
import IconNav from './assets/icon.svg';
import styles from './nav-icon.module.scss';
import { PopoverContent } from './popover-content';

export const NavIcon: React.FC = () => {
  return (
    <Popover overlay={<PopoverContent />} placement="bottomLeft">
      <span className={styles.icon}>
        <IconNav />
      </span>
    </Popover>
  );
};
