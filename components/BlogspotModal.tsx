import React, { useState, useEffect, useCallback } from 'react';
import type { Account } from '../types.ts';

interface BlogspotData {
  blogspotUsername: string;
  blogspotPassword?: string;
  blogspotUrl: string;
}
interface BlogspotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BlogspotData) => void;
  accountToEdit: Account | null;
}
export const BlogspotModal: React.FC<BlogspotModalProps> = ({ isOpen, onClose, onSave, accountToEdit }) => {
  const [blogspotUsername, setBlogspotUsername] = useState('');
  const [blogspotPassword, setBlogspotPassword] = useState('');
  const [blogspotUrl, setBlogspotUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (accountToEdit) {
      setBlogspotUsername(accountToEdit.blogspotUsername || '');
      setBlogspotPassword(accountToEdit.blogspotPassword || '');
      setBlogspotUrl((accountToEdit.blogspotUrl || '').replace(/^https?:\/\//, ''));
    } else {
      setBlogspotUsername('');
      setBlogspotPassword('');
      setBlogspotUrl('');
    }
    setError('');
  }, [accountToEdit, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!blogspotUsername.trim()) {
      setError('블로그스팟 아이디/이메일을 입력해주세요.');
      return;
    }
    const trimmedUrlPart = blogspotUrl.trim();
    if (!trimmedUrlPart) {
      setError('유효한 블로그스팟 주소를 입력해주세요.');
      return;
    }
    onSave({ blogspotUsername, blogspotPassword, blogspotUrl: `https://` + trimmedUrlPart });
  }, [blogspotUsername, blogspotPassword, blogspotUrl, onSave]);
  
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => { if (e.target === e.currentTarget) onClose(); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby="blogspot-modal-title">
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 id="blogspot-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-4">블로그스팟 정보</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">계정: <span className="font-medium">{accountToEdit?.email}</span></p>
            {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
            <div className="space-y-4">
              <div>
                <label htmlFor="blogspotUsername" className="block text-sm font-medium text-gray-700 dark:text-gray-300">블로그스팟 아이디 (이메일)</label>
                <input type="text" id="blogspotUsername" value={blogspotUsername} onChange={(e) => setBlogspotUsername(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white" placeholder="user@gmail.com" required />
              </div>
              <div>
                <label htmlFor="blogspotPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">비밀번호</label>
                <input type="password" id="blogspotPassword" value={blogspotPassword} onChange={(e) => setBlogspotPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white" placeholder="••••••••" />
              </div>
              <div>
                <label htmlFor="blogspotUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">블로그스팟 주소</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm dark:bg-gray-500 dark:border-gray-400 dark:text-gray-400">https://</span>
                  <input type="text" id="blogspotUrl" value={blogspotUrl} onChange={(e) => setBlogspotUrl(e.target.value.replace(/^https?:\/\//, ''))} className="block w-full flex-1 rounded-none rounded-r-md px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white" placeholder="yourblog.blogspot.com" required />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-600 px-6 py-3 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-500 dark:text-gray-200 border border-gray-300 dark:border-gray-400 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">취소</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">저장</button>
          </div>
        </form>
      </div>
    </div>
  );
};
