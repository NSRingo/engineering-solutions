import styles from './popover-content.module.scss';

const PROJECTS = [
  {
    url: 'https://nsringo.github.io/',
    title: 'iRingo',
    description: '解锁完整的 Apple 功能和集成服务',
  },
  {
    url: 'https://dualsubs.github.io/',
    title: 'DualSubs',
    description: '双语及增强字幕生成工具',
  },
  {
    url: 'https://biliuniverse.io/',
    title: 'BiliUniverse',
    description: '哔哩哔哩功能优化及增强解决方案',
  },
];

export const PopoverContent: React.FC = () => {
  const renderLink = ({ url, title, description }: (typeof PROJECTS)[number]) => {
    return (
      <a key={title} className={styles.item} href={url} target="_blank" rel="noopener noreferrer">
        <span className={styles.title}>{title}</span>
        <span className={styles.description}>{description}</span>
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
