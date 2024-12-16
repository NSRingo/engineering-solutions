import { Suspense, lazy, memo } from 'react';
import { ContributorItem } from './contributor-item';

import styles from './contributors.module.scss';
import type { Contributor } from './types';

export interface ContributorsProps {
  repo: `${string}/${string}`;
}

const fetchContributors = async (repo: string): Promise<Contributor[]> => {
  const cachedContributors = sessionStorage.getItem(`contributors_${repo}`);
  if (cachedContributors) {
    try {
      return JSON.parse(cachedContributors);
    } catch (error) {}
  }

  const response = await fetch(`https://api.github.com/repos/${repo}/contributors`);
  if (!response.ok) {
    throw new Error(`Failed to fetch contributors for ${repo}: ${response.statusText}`);
  }

  const contributors = await response.json();
  sessionStorage.setItem(`contributors_${repo}`, JSON.stringify(contributors));
  return contributors;
};

const createContributorsComponent = (repo: `${string}/${string}`) =>
  lazy(async () => {
    const contributors = await fetchContributors(repo);
    return {
      default: () => (
        <div className={styles['contributors']}>
          {contributors.map((item) => (
            <ContributorItem key={item.id} contributor={item} />
          ))}
        </div>
      ),
    };
  });

export const Contributors: React.FC<ContributorsProps> = memo(({ repo }) => {
  const AsyncContributors = createContributorsComponent(repo);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AsyncContributors />
    </Suspense>
  );
});
