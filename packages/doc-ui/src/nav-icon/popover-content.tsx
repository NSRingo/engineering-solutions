import styles from './popover-content.module.scss';

const PROJECTS = [
  {
    icon: 'https://avatars.githubusercontent.com/u/2111377?s=80&v=4',
    url: 'https://NSRingo.github.io/',
    title: 'iRingo',
    description: '解锁完整的 Apple 功能和集成服务',
  },
  {
    icon: 'https://avatars.githubusercontent.com/u/100578089?s=80&v=4',
    url: 'https://DualSubs.github.io/',
    title: 'DualSubs',
    description: '双语及增强字幕生成工具',
  },
  {
    icon: 'https://avatars.githubusercontent.com/u/129515498?s=80&v=4',
    url: 'https://BiliUniverse.io/',
    title: 'BiliUniverse',
    description: '哔哩哔哩功能优化及增强解决方案',
  },
];

export const PopoverContent: React.FC = () => {
  const renderLink = ({ icon, url, title, description }: (typeof PROJECTS)[number]) => {
    return (
      <a key={title} className={styles.item} href={url} target="_blank" rel="noopener noreferrer">
        <img className={styles.icon} src={icon} alt={title} />
        <div>
          <span className={styles.title}>{title}</span>
          <span className={styles.description}>{description}</span>
        </div>
      </a>
    );
  };
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.icon}>🍟</span> 整点薯条
      </div>

      <div className={styles.main}>{PROJECTS.map(renderLink)}</div>
    </div>
  );
};
