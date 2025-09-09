import React, { useState, useCallback } from 'react';
import type { Account } from '../types.ts';
import {
    CopyIcon,
    CheckIcon,
    PencilIcon,
    TrashIcon,
    TistoryIcon,
    NaverIcon,
    BlogspotIcon,
    WordpressIcon
} from './Icons.tsx';

interface AccountCardProps {
  account: Account;
  onEdit: () => void;
  onDelete: () => void;
  onBlogClick: (url: string, blogName: string) => void;
}
export const AccountCard: React.FC<AccountCardProps> = ({ account, onEdit, onDelete, onBlogClick }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyEmail = useCallback(() => {
    navigator.clipboard.writeText(account.email).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy email: ', err);
    });
  }, [account.email]);

  const getInitials = (email: string) => email.charAt(0).toUpperCase();
  const iconBaseClass = 'transition-colors';
  const iconActiveClass = 'text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-500';
  const iconInactiveClass = 'text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60';

  const renderBlogIcon = (url: string | undefined, IconComponent: React.FC<{className?: string}>, blogName: string) => {
    if (url) {
      return (
        <button onClick={() => onBlogClick(url, blogName)} className={`${iconBaseClass} ${iconActiveClass}`} aria-label={`Open ${blogName} blog`} title={`Open ${url}`}>
          <IconComponent className="h-6 w-6" />
        </button>
      );
    }
    return (
      <button disabled className={`${iconBaseClass} ${iconInactiveClass}`} aria-label={`${blogName} URL not set`} title={`${blogName} URL not set`}>
        <IconComponent className="h-6 w-6" />
      </button>
    );
  };

  return (
    <div className="group bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`w-12 h-12 rounded-full ${account.color} flex items-center justify-center text-white text-xl font-bold`}>{getInitials(account.email)}</div>
          <div className="ml-4 flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={account.nickname}>{account.nickname}</p>
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title={account.email}>{account.email}</p>
                <button onClick={handleCopyEmail} className={`ml-2 flex-shrink-0 transition-opacity ${isCopied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'}`} aria-label="Copy email" title="Copy email">
                    {isCopied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 dark:text-gray-500 dark:group-hover:text-indigo-400" />}
                </button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-600 px-5 py-3 flex justify-end items-center space-x-3">
        <div className="flex-grow flex items-center space-x-2">
            {renderBlogIcon(account.tistoryBlogUrl, TistoryIcon, 'Tistory')}
            {renderBlogIcon(account.naverBlogUrl, NaverIcon, 'Naver')}
            {renderBlogIcon(account.blogspotUrl, BlogspotIcon, 'Blogspot')}
            {renderBlogIcon(account.wordpressUrl, WordpressIcon, 'Wordpress')}
        </div>
        <button onClick={onEdit} className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors" aria-label="Edit Account"><PencilIcon className="h-5 w-5" /></button>
        <button onClick={onDelete} className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 transition-colors" aria-label="Delete Account"><TrashIcon className="h-5 w-5" /></button>
      </div>
    </div>
  );
};
