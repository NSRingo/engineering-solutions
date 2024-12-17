import { Suspense, lazy } from 'react';
import { Popover } from '../popover';

import type { Contributor, User } from './types';

import styles from './contributors.module.scss';

export interface ContributorItemProps {
  contributor: Contributor;
}

export const ContributorItem: React.FC<ContributorItemProps> = ({ contributor }) => {
  return (
    <a className={styles['contributor-item']} href={contributor.html_url} target="_blank" rel="noopener noreferrer">
      <Popover overlay={<UserCard username={contributor.login} />} placement="top">
        <figure style={{ backgroundImage: `url("${contributor.avatar_url}")` }} />
      </Popover>
    </a>
  );
};

const fetchUser = async (username: string): Promise<User> => {
  const cachedUser = sessionStorage.getItem(`user_${username}`);
  if (cachedUser) {
    try {
      return JSON.parse(cachedUser);
    } catch (error) {}
  }

  const response = await fetch(`https://api.github.com/users/${username}`);
  if (!response.ok) {
    return { login: username } as User;
  }

  const user = await response.json();
  sessionStorage.setItem(`user_${username}`, JSON.stringify(user));
  return user;
};

const createUserCard = (username: string) =>
  lazy(async () => {
    const user = await fetchUser(username);
    return {
      default: () => (
        <div className={styles['user-card']}>
          <img className={styles['user-card__avatar']} src={user.avatar_url} alt={user.login} />
          <div>
            <a href={user.html_url} target="_blank" rel="noopener noreferrer">
              <strong>{user.login}</strong>
              {user.name && <span className="ml-2">{user.name}</span>}
            </a>
          </div>
          <div className={styles['user-card__details']}>
            {user.company && (
              <div>
                <svg viewBox="0 0 16 16">
                  <path d="M1.75 16A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0h8.5C11.216 0 12 .784 12 1.75v12.5c0 .085-.006.168-.018.25h2.268a.25.25 0 0 0 .25-.25V8.285a.25.25 0 0 0-.111-.208l-1.055-.703a.749.749 0 1 1 .832-1.248l1.055.703c.487.325.779.871.779 1.456v5.965A1.75 1.75 0 0 1 14.25 16h-3.5a.766.766 0 0 1-.197-.026c-.099.017-.2.026-.303.026h-3a.75.75 0 0 1-.75-.75V14h-1v1.25a.75.75 0 0 1-.75.75Zm-.25-1.75c0 .138.112.25.25.25H4v-1.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 .75.75v1.25h2.25a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25ZM3.75 6h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM3 3.75A.75.75 0 0 1 3.75 3h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 3 3.75Zm4 3A.75.75 0 0 1 7.75 6h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 7 6.75ZM7.75 3h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM3 9.75A.75.75 0 0 1 3.75 9h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 3 9.75ZM7.75 9h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5Z"></path>
                </svg>
                {user.company}
              </div>
            )}
            {user.location && (
              <div>
                <svg viewBox="0 0 16 16">
                  <path d="m12.596 11.596-3.535 3.536a1.5 1.5 0 0 1-2.122 0l-3.535-3.536a6.5 6.5 0 1 1 9.192-9.193 6.5 6.5 0 0 1 0 9.193Zm-1.06-8.132v-.001a5 5 0 1 0-7.072 7.072L8 14.07l3.536-3.534a5 5 0 0 0 0-7.072ZM8 9a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 9Z"></path>
                </svg>
                {user.location}
              </div>
            )}
          </div>
        </div>
      ),
    };
  });

const UserCard: React.FC<{ username: string }> = ({ username }) => {
  const AsyncUserCard = createUserCard(username);

  return (
    <Suspense fallback={<div className={styles['user-card']}>Loading...</div>}>
      <AsyncUserCard />
    </Suspense>
  );
};
