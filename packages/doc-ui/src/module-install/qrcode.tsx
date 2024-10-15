import { QRCodeSVG } from '@rc-component/qrcode';
import { Popover } from '../popover';
import IconQrCode from './icons/qrcode.svg';
import styles from './module-install.module.scss';

export const QRCode: React.FC<{ value: string }> = ({ value }) => {
  return (
    <Popover
      overlay={
        <QRCodeSVG
          className={styles.qrcode}
          value={value}
          fgColor="var(--rp-c-text-1)"
          bgColor="transparent"
          marginSize={4}
        />
      }
      placement="bottomLeft"
    >
      <span>
        <IconQrCode className={styles['qrcode-handler']} />
      </span>
    </Popover>
  );
};
