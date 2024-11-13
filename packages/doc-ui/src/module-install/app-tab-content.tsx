import { useMemo } from 'react';
import { Badge } from 'rspress/theme';
import { APP_INSTALL_INFO_MAP, type SupportedApp } from './constants';
import styles from './module-install.module.scss';
import { QRCode } from './qrcode';

type BadgeProps = React.ComponentProps<typeof Badge>;
type IBadgeProps = Omit<BadgeProps, 'text'> & { text: React.ReactNode };

export interface AppTabContentProps {
  appType: SupportedApp;
  url: string;
  title?: string;
  badge?: React.ReactNode | IBadgeProps | Array<IBadgeProps>;
  children?: React.ReactNode;
}

export const AppTabContent: React.FC<AppTabContentProps> = ({ appType, url, title, badge, children }) => {
  const installInfo = APP_INSTALL_INFO_MAP[appType];
  const generatedUrl = installInfo?.urlTemplate ? installInfo.urlTemplate(url) : url;
  const manualInstallInfo = installInfo?.manualInstall;
  if (!manualInstallInfo) {
    return null;
  }

  const getBadgeProps = (item: IBadgeProps | React.ReactNode) => {
    if (item && typeof item === 'object' && 'text' in item && 'type' in item) {
      return item as BadgeProps;
    }
    if (item) {
      return {
        type: 'warning',
        text: item,
      } as BadgeProps;
    }
  };

  const badgeRender = useMemo(() => {
    if (Array.isArray(badge)) {
      return (
        <span className={styles.badge}>
          {badge.map((item, index) => {
            const badgeProps = getBadgeProps(item);
            if (!badgeProps) {
              return null;
            }
            return <Badge key={index} {...badgeProps} />;
          })}
        </span>
      );
    }
    const badgeProps = getBadgeProps(badge);
    if (!badgeProps) {
      return null;
    }
    return (
      <span className={styles.badge}>
        <Badge {...badgeProps} />
      </span>
    );
  }, [badge]);

  return (
    <div className={['rspress-directive', styles.container].join(' ')}>
      {title || badge ? (
        <div className={[styles['item-title'], 'mb-2'].join(' ')}>
          {title && <div>{title}</div>}
          {badgeRender}
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
