import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { Account } from '../types.ts';
import {
    SpinnerIcon,
    SparklesIcon,
    InfoIcon,
    TistoryIcon,
    NaverIcon,
    BlogspotIcon,
    WordpressIcon
} from './Icons.tsx';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (accountData: Omit<Account, 'id' | 'color'>, id?: string) => void;
  accountToEdit: Account | null;
  onOpenTistory: (account: Account) => void;
  onOpenWordpress: (account: Account) => void;
  onOpenBlogspot: (account: Account) => void;
  onOpenNaver: (account: Account) => void;
  existingEmails: string[];
}
export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onSave, accountToEdit, onOpenTistory, onOpenWordpress, onOpenBlogspot, onOpenNaver, existingEmails }) => {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [chromeProfile, setChromeProfile] = useState('');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    if (accountToEdit) {
      setEmail(accountToEdit.email);
      setNickname(accountToEdit.nickname);
      setChromeProfile(accountToEdit.chromeProfile || '');
    } else {
      setEmail('');
      setNickname('');
      setChromeProfile('');
    }
    setError('');
    setSuggestions([]);
    setIsSuggesting(false);
  }, [accountToEdit, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSuggestNickname = useCallback(async () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email) || isSuggesting) {
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) setError('유효한 이메일을 입력해야 추천받을 수 있습니다.');
        return;
    }
    setError('');
    setIsSuggesting(true);
    setSuggestions([]);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the email "${email}", suggest 4 creative, short, and friendly nicknames in Korean.`,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } },
        });
        const result = JSON.parse(response.text);
        if (Array.isArray(result)) setSuggestions(result);
        else throw new Error("Invalid response format from API.");
    } catch (error) {
        console.error("Nickname suggestion failed:", error);
        setError("닉네임 추천에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
        setIsSuggesting(false);
    }
  }, [email, isSuggesting]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedNickname = nickname.trim();
    const trimmedChromeProfile = chromeProfile.trim();
    if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) { setError('유효한 이메일 주소를 입력해주세요.'); return; }
    if (!trimmedNickname) { setError('닉네임을 입력해주세요.'); return; }
    if (!accountToEdit && existingEmails.includes(trimmedEmail.toLowerCase())) { setError('이미 등록된 이메일 주소입니다.'); return; }
    onSave({ email: trimmedEmail, nickname: trimmedNickname, chromeProfile: trimmedChromeProfile }, accountToEdit?.id);
  }, [email, nickname, chromeProfile, onSave, accountToEdit, existingEmails]);
  
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => { if (e.target === e.currentTarget) onClose(); };
  const handleOpenBlogModal = (opener: (account: Account) => void) => { if (accountToEdit) opener(accountToEdit); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={handleOverlayClick}>
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{accountToEdit ? '계정 수정' : '새 계정 추가'}</h2>
            {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">이메일</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white disabled:bg-gray-200 dark:disabled:bg-gray-800" placeholder="example@google.com" required disabled={!!accountToEdit} />
              </div>
              <div>
                <div className="flex justify-between items-center">
                    <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 dark:text-gray-300">닉네임</label>
                    {!accountToEdit && (<button type="button" onClick={handleSuggestNickname} disabled={isSuggesting || !email} className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed transition-colors">{isSuggesting ? <SpinnerIcon className="h-4 w-4 mr-1" /> : <SparklesIcon className="h-4 w-4 mr-1" />} 닉네임 추천</button>)}
                </div>
                <input type="text" id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white" placeholder="업무용 계정" required />
                {suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {suggestions.map((suggestion, index) => ( <button key={index} type="button" onClick={() => setNickname(suggestion)} className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">{suggestion}</button>))}
                    </div>
                )}
              </div>
               <div>
                <div className="flex items-center">
                    <label htmlFor="chromeProfile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Chrome 프로필</label>
                    <div className="relative ml-2 group"><InfoIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" /><div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Chrome 주소창에 'chrome://version' 입력 후, '프로필 경로'의 마지막 디렉토리 이름 (예: Default, Profile 1)을 입력하세요.</div></div>
                </div>
                <input type="text" id="chromeProfile" value={chromeProfile} onChange={(e) => setChromeProfile(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white" placeholder="Profile 1" />
              </div>
              {accountToEdit && (
                <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">블로그 정보 수정</label>
                    <div className="mt-2 flex items-center space-x-4">
                        <button type="button" onClick={() => handleOpenBlogModal(onOpenTistory)} className="text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 transition-colors" aria-label="Edit Tistory Info"><TistoryIcon className="h-8 w-8" /></button>
                        <button type="button" onClick={() => handleOpenBlogModal(onOpenNaver)} className="text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400 transition-colors" aria-label="Edit Naver Info"><NaverIcon className="h-8 w-8" /></button>
                        <button type="button" onClick={() => handleOpenBlogModal(onOpenBlogspot)} className="text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors" aria-label="Edit Blogspot Info"><BlogspotIcon className="h-8 w-8" /></button>
                        <button type="button" onClick={() => handleOpenBlogModal(onOpenWordpress)} className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors" aria-label="Edit Wordpress Info"><WordpressIcon className="h-8 w-8" /></button>
                    </div>
                </div>
              )}
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
