import { useMemo } from 'react';
import { Badge } from 'rspress/theme';
import { APP_INSTALL_INFO_MAP, type SupportedApp } from './constants';
import styles from './module-install.module.scss';
import { QRCode } from './qrcode';

type BadgeProps = React.ComponentProps<typeof Badge>;

export interface AppTabContentProps {
  appType: SupportedApp;
  url: string;
  title?: string;
  badge?: React.ReactNode | (Omit<BadgeProps['type'], 'text'> & { text: React.ReactNode });
  children?: React.ReactNode;
}

export const AppTabContent: React.FC<AppTabContentProps> = ({ appType, url, title, badge, children }) => {
  const installInfo = APP_INSTALL_INFO_MAP[appType];
  const generatedUrl = installInfo?.urlTemplate ? installInfo.urlTemplate(url) : url;
  const manualInstallInfo = installInfo?.manualInstall;
  if (!manualInstallInfo) {
    return null;
  }
  const badgeProps = useMemo<BadgeProps | null>(() => {
    if (badge && typeof badge === 'object' && 'text' in badge && 'type' in badge) {
      return badge as unknown as BadgeProps;
    }
    if (badge) {
      return {
        type: 'warning',
        text: badge as string,
      };
    }
    return null;
  }, [badge]);

  return (
    <div className={['rspress-directive', styles.container].join(' ')}>
      {title || badge ? (
        <div className={[styles['item-title'], 'mb-2'].join(' ')}>
          {title && <div>{title}</div>}
          {badgeProps ? (
            <span className={styles.badge}>
              <Badge {...badgeProps} />
            </span>
          ) : null}
        </div>
      ) : null}
      {generatedUrl && (
        <>
          <div>
            <div className="rspress-directive-title">一键安装</div>
            <div className={styles.install}>
              <a href={generatedUrl}>点击一键安装</a>
              <QRCode value={generatedUrl} />
            </div>
          </div>
          <hr className="my-4 border-t border-solid border-divider-light" />
        </>
      )}
      <div>
        <div className="rspress-directive-title">手动安装</div>
        <div className="mb-2">
          <strong>安装路径</strong>
          <div>{manualInstallInfo.path}</div>
        </div>

        <div>
          <strong>{manualInstallInfo.urlTitle}</strong>
          <div className={styles['url-wrap']}>
            <div className="rspress-scrollbar">
              <code>{url}</code>
            </div>
          </div>
        </div>
      </div>

      {children ? (
        <>
          <hr className="my-4 border-t border-solid border-divider-light" />
          {children}
        </>
      ) : null}
    </div>
  );
};
