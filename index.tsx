

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// =================================================================================
// ALL APPLICATION CODE IS BUNDLED INTO THIS FILE
// This is to ensure the app runs correctly when opening index.html directly from the local file system (file://).
// =================================================================================

// --- from types.ts ---
interface Account {
  id: string;
  email: string;
  nickname: string;
  color: string;
  tistoryId?: string;
  tistoryPassword?: string;
  tistoryBlogUrl?: string;
  wordpressUsername?: string;
  wordpressPassword?: string;
  wordpressUrl?: string;
  blogspotUsername?: string;
  blogspotPassword?: string;
  blogspotUrl?: string;
  naverId?: string;
  naverPassword?: string;
  naverBlogUrl?: string;
  chromeProfile?: string;
}

// --- from components/Icons.tsx ---
type IconProps = {
  className?: string;
};

const PlusIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const PlusCircleIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const PencilIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const TrashIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

const GoogleIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
        <path fill="#4285F4" d="M24 9.8c3.8 0 6.9 1.6 9.1 3.7l6.8-6.8C35.9 2.6 30.4 0 24 0 14.8 0 7.1 5.3 4 12.9l8.3 6.4C14.3 13.1 18.8 9.8 24 9.8z"></path>
        <path fill="#34A853" d="M46.2 25.1c0-1.7-.1-3.3-.4-4.9H24v9.3h12.4c-.5 3-2.1 5.6-4.6 7.4l7.6 5.9c4.4-4.1 7-10 7-17.7z"></path>
        <path fill="#FBBC05" d="M12.3 19.3c-1.1 3.3-1.1 7 0 10.3l-8.3 6.4C1.3 30.6 0 25.4 0 20s1.3-10.6 4-15.1l8.3 6.4z"></path>
        <path fill="#EA4335" d="M24 48c6.4 0 11.9-2.1 15.9-5.7l-7.6-5.9c-2.1 1.4-4.9 2.3-7.9 2.3-5.2 0-9.7-3.3-11.7-8.1l-8.3 6.4C7.1 42.7 14.8 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);

const BulkAddIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 12 2.25a2.251 2.251 0 0 1 1.447 3.757M5.25 6.375a2.25 2.25 0 0 1 2.25-2.25h8.25a2.25 2.25 0 0 1 2.25 2.25v9.75A2.25 2.25 0 0 1 18 18.75H7.5A2.25 2.25 0 0 1 5.25 16.5V6.375Z" />
  </svg>
);

const ArrowsUpDownIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
    </svg>
);

const BackupIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const RestoreIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
);

const SearchIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const SunIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
  </svg>
);

const MoonIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
  </svg>
);

const SpinnerIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...props} className={`animate-spin ${props.className}`}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const SparklesIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);

const InfoIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
);

const CopyIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
);

const CheckIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);

const LinkIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
);

const LetterCircleIcon: React.FC<IconProps & { letter: string }> = ({ letter, ...props }) => (
  <svg viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" {...props}>
      <circle cx="12" cy="12" r="10" />
      <text x="12" y="17" textAnchor="middle" fontSize="13" fontWeight="bold" fill="currentColor" stroke="none">{letter}</text>
  </svg>
);

const TistoryIcon: React.FC<IconProps> = (props) => (
  <LetterCircleIcon letter="T" {...props} />
);

const NaverIcon: React.FC<IconProps> = (props) => (
  <LetterCircleIcon letter="N" {...props} />
);

const BlogspotIcon: React.FC<IconProps> = (props) => (
  <LetterCircleIcon letter="B" {...props} />
);

const WordpressIcon: React.FC<IconProps> = (props) => (
  <LetterCircleIcon letter="W" {...props} />
);

// --- from components/CommandModal.tsx ---
interface CommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  command: string;
}
const CommandModal: React.FC<CommandModalProps> = ({ isOpen, onClose, title, command }) => {
  const [buttonText, setButtonText] = useState('명령어 복사');
  const [altButtonText, setAltButtonText] = useState('명령어 복사');

  const commandForX86 = command.replace("Program Files", "Program Files (x86)");
  const hasAlternative = commandForX86 !== command;

  useEffect(() => { 
    if (isOpen) {
      setButtonText('명령어 복사'); 
      setAltButtonText('명령어 복사');
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = useCallback((textToCopy: string, setText: React.Dispatch<React.SetStateAction<string>>) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setText('복사됨!');
      setTimeout(() => setText('명령어 복사'), 2000);
    }).catch(err => {
      console.error('Failed to copy command: ', err);
      setText('복사 실패');
      setTimeout(() => setText('명령어 복사'), 2000);
    });
  }, []);

  if (!isOpen) return null;
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby="command-modal-title">
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6">
          <h2 id="command-modal-title" className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
          <div className="space-y-4">
              <div>
                  <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">1. 기본 명령어 (64비트 Windows)</label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">아래 명령어를 복사한 후, <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">Win</kbd> + <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">R</kbd> 키를 눌러 실행창에 붙여넣고 실행하세요.</p>
                  <div className="relative">
                    <input type="text" readOnly value={command} className="w-full pl-3 pr-24 py-2 font-mono text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <button onClick={() => handleCopy(command, setButtonText)} className="absolute inset-y-0 right-0 m-1 px-3 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors">{buttonText}</button>
                  </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                  <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">2. 오류 발생 시 해결 방법</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      위 명령어가 작동하지 않는다면 (예: '파일을 찾을 수 없습니다' 오류), Chrome이 다른 경로에 설치된 것입니다. 아래 방법을 시도해보세요.
                  </p>
                  
                  {hasAlternative && (
                    <div className="mt-4">
                        <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">방법 A: 32비트용 명령어 시도</label>
                        <div className="relative mt-2">
                            <input type="text" readOnly value={commandForX86} className="w-full pl-3 pr-24 py-2 font-mono text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            <button onClick={() => handleCopy(commandForX86, setAltButtonText)} className="absolute inset-y-0 right-0 m-1 px-3 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors">{altButtonText}</button>
                        </div>
                    </div>
                  )}

                  <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">방법 B: 직접 경로 찾아서 수정</p>
                      <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1 pl-2">
                          <li>바탕화면의 <strong>Chrome 바로가기 아이콘</strong>을 마우스 오른쪽 버튼으로 클릭합니다.</li>
                          <li>메뉴에서 <strong>'속성(Properties)'</strong>을 선택합니다.</li>
                          <li>'바로 가기' 탭의 <strong>'대상(Target)'</strong> 필드에 있는 텍스트 전체를 복사합니다. (예: <code>"C:\..."</code>)</li>
                          <li>위 명령어에서 <code>"C:\Program Files\..."</code> 부분만 복사한 내용으로 교체한 후 다시 실행해보세요.</li>
                      </ol>
                  </div>
              </div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-600 px-6 py-3 flex justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-500 dark:text-gray-200 border border-gray-300 dark:border-gray-400 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">닫기</button>
        </div>
      </div>
    </div>
  );
};


// --- from components/ConfirmModal.tsx ---
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'destructive';
  confirmText?: string;
  cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    children, 
    variant = 'default',
    confirmText,
    cancelText
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const confirmButtonBaseClasses = "px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";
  const destructiveClasses = "bg-red-600 hover:bg-red-700 focus:ring-red-500";
  const defaultClasses = "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500";
  const confirmClasses = variant === 'destructive' ? destructiveClasses : defaultClasses;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 id="confirm-modal-title" className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h2>
          <div className="text-gray-700 dark:text-gray-300">
            {children}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-600 px-6 py-3 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-500 dark:text-gray-200 border border-gray-300 dark:border-gray-400 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            {cancelText || 'Cancel'}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`${confirmButtonBaseClasses} ${confirmClasses}`}
          >
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- from components/TistoryModal.tsx ---
interface TistoryData {
  tistoryId: string;
  tistoryPassword?: string;
  tistoryBlogUrl: string;
}
interface TistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TistoryData) => void;
  accountToEdit: Account | null;
}
const TistoryModal: React.FC<TistoryModalProps> = ({ isOpen, onClose, onSave, accountToEdit }) => {
  const [tistoryId, setTistoryId] = useState('');
  const [tistoryPassword, setTistoryPassword] = useState('');
  const [tistoryBlogUrl, setTistoryBlogUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (accountToEdit) {
      setTistoryId(accountToEdit.tistoryId || '');
      setTistoryPassword(accountToEdit.tistoryPassword || '');
      setTistoryBlogUrl((accountToEdit.tistoryBlogUrl || '').replace(/^https?:\/\//, ''));
    } else {
      setTistoryId('');
      setTistoryPassword('');
      setTistoryBlogUrl('');
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
    if (!tistoryId.trim()) {
      setError('티스토리 아이디를 입력해주세요.');
      return;
    }
    const trimmedUrlPart = tistoryBlogUrl.trim();
    if (!trimmedUrlPart) {
      setError('유효한 티스토리 블로그 주소를 입력해주세요.');
      return;
    }
    onSave({ tistoryId, tistoryPassword, tistoryBlogUrl: `https://` + trimmedUrlPart });
  }, [tistoryId, tistoryPassword, tistoryBlogUrl, onSave]);
  
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => { if (e.target === e.currentTarget) onClose(); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby="tistory-modal-title">
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 id="tistory-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-4">티스토리 블로그 정보</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">계정: <span className="font-medium">{accountToEdit?.email}</span></p>
            {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
            <div className="space-y-4">
              <div>
                <label htmlFor="tistoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">티스토리 아이디 (이메일)</label>
                <input type="text" id="tistoryId" value={tistoryId} onChange={(e) => setTistoryId(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white" placeholder="tistory_user@example.com" required />
              </div>
              <div>
                <label htmlFor="tistoryPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">비밀번호</label>
                <input type="password" id="tistoryPassword" value={tistoryPassword} onChange={(e) => setTistoryPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white" placeholder="••••••••" />
              </div>
              <div>
                <label htmlFor="tistoryBlogUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">티스토리 블로그 주소</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm dark:bg-gray-500 dark:border-gray-400 dark:text-gray-400">https://</span>
                  <input type="text" id="tistoryBlogUrl" value={tistoryBlogUrl} onChange={(e) => setTistoryBlogUrl(e.target.value.replace(/^https?:\/\//, ''))} className="block w-full flex-1 rounded-none rounded-r-md px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white" placeholder="yourblog.tistory.com" required />
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

// --- from components/WordpressModal.tsx ---
interface WordpressData {
  wordpressUsername: string;
  wordpressPassword?: string;
  wordpressUrl: string;
}
interface WordpressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: WordpressData) => void;
  accountToEdit: Account | null;
}
const WordpressModal: React.FC<WordpressModalProps> = ({ isOpen, onClose, onSave, accountToEdit }) => {
  const [wordpressUsername, setWordpressUsername] = useState('');
  const [wordpressPassword, setWordpressPassword] = useState('');
  const [wordpressUrl, setWordpressUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (accountToEdit) {
      setWordpressUsername(accountToEdit.wordpressUsername || '');
      setWordpressPassword(accountToEdit.wordpressPassword || '');
      setWordpressUrl((accountToEdit.wordpressUrl || '').replace(/^https?:\/\//, ''));
    } else {
      setWordpressUsername('');
      setWordpressPassword('');
      setWordpressUrl('');
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
    if (!wordpressUsername.trim()) {
      setError('워드프레스 아이디를 입력해주세요.');
      return;
    }
    const trimmedUrlPart = wordpressUrl.trim();
    if (!trimmedUrlPart) {
      setError('유효한 워드프레스 주소를 입력해주세요.');
      return;
    }
    onSave({ wordpressUsername, wordpressPassword, wordpressUrl: `https://` + trimmedUrlPart });
  }, [wordpressUsername, wordpressPassword, wordpressUrl, onSave]);
  
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => { if (e.target === e.currentTarget) onClose(); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby="wordpress-modal-title">
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 id="wordpress-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-4">워드프레스 정보</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">계정: <span className="font-medium">{accountToEdit?.email}</span></p>
            {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
            <div className="space-y-4">
              <div>
                <label htmlFor="wordpressUsername" className="block text-sm font-medium text-gray-700 dark:text-gray-300">워드프레스 아이디 (이메일)</label>
                <input type="text" id="wordpressUsername" value={wordpressUsername} onChange={(e) => setWordpressUsername(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white" placeholder="wordpress_user" required />
              </div>
              <div>
                <label htmlFor="wordpressPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">비밀번호</label>
                <input type="password" id="wordpressPassword" value={wordpressPassword} onChange={(e) => setWordpressPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white" placeholder="••••••••" />
              </div>
              <div>
                <label htmlFor="wordpressUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">워드프레스 주소</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm dark:bg-gray-500 dark:border-gray-400 dark:text-gray-400">https://</span>
                  <input type="text" id="wordpressUrl" value={wordpressUrl} onChange={(e) => setWordpressUrl(e.target.value.replace(/^https?:\/\//, ''))} className="block w-full flex-1 rounded-none rounded-r-md px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white" placeholder="example.com" required />
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

// --- from components/BlogspotModal.tsx ---
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
const BlogspotModal: React.FC<BlogspotModalProps> = ({ isOpen, onClose, onSave, accountToEdit }) => {
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

// --- from components/NaverModal.tsx ---
interface NaverData {
  naverId: string;
  naverPassword?: string;
  naverBlogUrl: string;
}
interface NaverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NaverData) => void;
  accountToEdit: Account | null;
}
const NaverModal: React.FC<NaverModalProps> = ({ isOpen, onClose, onSave, accountToEdit }) => {
  const [naverId, setNaverId] = useState('');
  const [naverPassword, setNaverPassword] = useState('');
  const [naverBlogUrl, setNaverBlogUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (accountToEdit) {
      setNaverId(accountToEdit.naverId || '');
      setNaverPassword(accountToEdit.naverPassword || '');
      setNaverBlogUrl((accountToEdit.naverBlogUrl || '').replace(/^https?:\/\//, ''));
    } else {
      setNaverId('');
      setNaverPassword('');
      setNaverBlogUrl('');
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
    if (!naverId.trim()) {
      setError('네이버 아이디를 입력해주세요.');
      return;
    }
    const trimmedUrlPart = naverBlogUrl.trim();
    if (!trimmedUrlPart) {
      setError('유효한 네이버 블로그 주소를 입력해주세요.');
      return;
    }
    onSave({ naverId, naverPassword, naverBlogUrl: `https://` + trimmedUrlPart });
  }, [naverId, naverPassword, naverBlogUrl, onSave]);
  
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => { if (e.target === e.currentTarget) onClose(); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby="naver-modal-title">
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 id="naver-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-4">네이버 블로그 정보</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">계정: <span className="font-medium">{accountToEdit?.email}</span></p>
            {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
            <div className="space-y-4">
              <div>
                <label htmlFor="naverId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">네이버 아이디 (이메일)</label>
                <input type="text" id="naverId" value={naverId} onChange={(e) => setNaverId(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white" placeholder="naver_user" required />
              </div>
              <div>
                <label htmlFor="naverPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">비밀번호</label>
                <input type="password" id="naverPassword" value={naverPassword} onChange={(e) => setNaverPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white" placeholder="••••••••" />
              </div>
              <div>
                <label htmlFor="naverBlogUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">네이버 블로그 주소</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm dark:bg-gray-500 dark:border-gray-400 dark:text-gray-400">https://</span>
                  <input type="text" id="naverBlogUrl" value={naverBlogUrl} onChange={(e) => setNaverBlogUrl(e.target.value.replace(/^https?:\/\//, ''))} className="block w-full flex-1 rounded-none rounded-r-md px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white" placeholder="blog.naver.com/yourid" required />
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

// --- from components/ProfileSyncModal.tsx ---
interface ProfileSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (pastedText: string) => void;
}
const ProfileSyncModal: React.FC<ProfileSyncModalProps> = ({ isOpen, onClose, onApply }) => {
  const [pastedText, setPastedText] = useState('');
  const [copiedScript, setCopiedScript] = useState<'powershell' | 'python' | null>(null);

  const powershellScript = `$chromePath = Join-Path $env:LOCALAPPDATA "Google\\Chrome\\User Data"
if (-not (Test-Path $chromePath)) {
    Write-Error "Chrome User Data directory not found at '$chromePath'."
    return
}
Get-ChildItem $chromePath -Directory |
Where-Object { $_.Name -match '^Default$|^Profile \\d+$' } |
ForEach-Object {
    $prefFile = Join-Path $_.FullName "Preferences"
    if (Test-Path $prefFile) {
        try {
            $json = Get-Content $prefFile -Raw -Encoding UTF8 | ConvertFrom-Json
            $email = ($json.account_info | Where-Object { $_.email }).email -join ", "
            if ($email) {
                Write-Host "$($_.Name) -> $($email)"
            }
        } catch {}
    }
}
`;
  const pythonScript = `import os
import json

try:
    local_app_data = os.getenv("LOCALAPPDATA")
    if not local_app_data:
        print("Error: LOCALAPPDATA environment variable not found.")
    else:
        chrome_path = os.path.join(local_app_data, "Google", "Chrome", "User Data")
        if os.path.isdir(chrome_path):
            for d in os.listdir(chrome_path):
                if d == "Default" or d.startswith("Profile "):
                    pref_file = os.path.join(chrome_path, d, "Preferences")
                    if os.path.exists(pref_file):
                        with open(pref_file, "r", encoding="utf-8") as f:
                            try:
                                data = json.load(f)
                                accounts = data.get("account_info", [])
                                if accounts:
                                    emails = [a.get("email", "") for a in accounts if a.get("email")]
                                    if emails:
                                        print(f"{d} -> {', '.join(emails)}")
                            except Exception:
                                continue
        else:
            print(f"Error: Chrome user data directory not found at {chrome_path}")
except Exception as e:
    print(f"An error occurred: {e}")
`;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = (scriptType: 'powershell' | 'python', script: string) => {
    navigator.clipboard.writeText(script).then(() => {
        setCopiedScript(scriptType);
        setTimeout(() => setCopiedScript(null), 2000);
    });
  };

  const handleSubmit = () => {
    if (pastedText.trim()) {
      onApply(pastedText);
    }
    onClose();
  };
  
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => { if (e.target === e.currentTarget) onClose(); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby="profile-sync-title">
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-xl w-full max-w-3xl flex flex-col" style={{height: '90vh'}}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-600">
          <h2 id="profile-sync-title" className="text-2xl font-bold text-gray-900 dark:text-white">Chrome 프로필 자동 연결</h2>
        </div>
        <div className="flex-grow p-6 overflow-y-auto space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">1단계: 스크립트 복사</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">사용하시는 환경에 맞는 스크립트를 복사하세요. (일반적으로 Windows에서는 PowerShell을 사용합니다)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="font-medium text-gray-700 dark:text-gray-300">PowerShell (Windows)</label>
                        <button onClick={() => handleCopy('powershell', powershellScript)} className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                            {copiedScript === 'powershell' ? <CheckIcon className="h-4 w-4 mr-1"/> : <CopyIcon className="h-4 w-4 mr-1"/>}
                            {copiedScript === 'powershell' ? '복사됨!' : '스크립트 복사'}
                        </button>
                    </div>
                    <pre className="text-xs bg-gray-100 dark:bg-gray-800 rounded-md p-3 overflow-x-auto"><code>{powershellScript}</code></pre>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="font-medium text-gray-700 dark:text-gray-300">Python</label>
                         <button onClick={() => handleCopy('python', pythonScript)} className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                            {copiedScript === 'python' ? <CheckIcon className="h-4 w-4 mr-1"/> : <CopyIcon className="h-4 w-4 mr-1"/>}
                            {copiedScript === 'python' ? '복사됨!' : '스크립트 복사'}
                        </button>
                    </div>
                    <pre className="text-xs bg-gray-100 dark:bg-gray-800 rounded-md p-3 overflow-x-auto"><code>{pythonScript}</code></pre>
                </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">2단계: 스크립트 실행 및 결과 복사</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">PowerShell 또는 터미널(cmd)을 열고, 복사한 스크립트를 붙여넣어 실행하세요. 출력된 결과 전체를 복사합니다.</p>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">예시 결과: <br/><code>Default -&gt; mymainaccount@gmail.com</code><br/><code>Profile 1 -&gt; testuser01@gmail.com</code></p>
          </div>
          <div>
             <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">3단계: 결과 붙여넣기</h3>
             <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">복사한 결과를 아래 상자에 붙여넣으세요.</p>
             <textarea value={pastedText} onChange={(e) => setPastedText(e.target.value)} className="w-full h-32 p-2 font-mono text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white" placeholder="여기에 스크립트 실행 결과를 붙여넣으세요..." />
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-600/50 px-6 py-3 flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-600">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-500 dark:text-gray-200 border border-gray-300 dark:border-gray-400 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">취소</button>
          <button type="button" onClick={handleSubmit} disabled={!pastedText.trim()} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">프로필 적용하기</button>
        </div>
      </div>
    </div>
  );
};

// --- from components/BulkAddModal.tsx ---
interface BulkData {
  email: string;
  password: string;
  tistoryBlogUrl: string;
  naverBlogUrl: string;
  blogspotUrl: string;
  wordpressUrl: string;
}
interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<BulkData>[]) => void;
}
const BulkAddModal: React.FC<BulkAddModalProps> = ({ isOpen, onClose, onSave }) => {
  const [rowCount, setRowCount] = useState(50);
  const [gridData, setGridData] = useState<BulkData[]>(() => 
    Array.from({ length: 50 }, () => ({ email: '', password: '', tistoryBlogUrl: '', naverBlogUrl: '', blogspotUrl: '', wordpressUrl: '' }))
  );

  useEffect(() => {
    if (!isOpen) {
        setRowCount(50);
        setGridData(Array.from({ length: 50 }, () => ({ email: '', password: '', tistoryBlogUrl: '', naverBlogUrl: '', blogspotUrl: '', wordpressUrl: '' })));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  
  useEffect(() => {
    setGridData(currentData => {
        const newData = Array.from({ length: rowCount }, (_, i) => 
            currentData[i] || { email: '', password: '', tistoryBlogUrl: '', naverBlogUrl: '', blogspotUrl: '', wordpressUrl: '' }
        );
        return newData;
    });
  }, [rowCount]);

  const handleInputChange = (rowIndex: number, field: keyof BulkData, value: string) => {
    const newData = [...gridData];
    const newRow = { ...newData[rowIndex] };
    if (field.endsWith('Url')) {
        (newRow[field] as string) = value.replace(/^https?:\/\//, '');
    } else {
        (newRow[field] as string) = value;
    }
    newData[rowIndex] = newRow;
    setGridData(newData);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pasteText = e.clipboardData.getData('text/plain');
    const lines = pasteText.split(/\r?\n/).filter(line => line.trim() !== '');
    const target = e.target as HTMLInputElement;
    const startRow = parseInt(target.dataset.row || '0', 10);
    const startColName = target.dataset.col as keyof BulkData;
    const colOrder: (keyof BulkData)[] = ['email', 'password', 'tistoryBlogUrl', 'naverBlogUrl', 'blogspotUrl', 'wordpressUrl'];
    const startColIndex = colOrder.indexOf(startColName);
    if (startColIndex === -1) return;
    const newData = [...gridData];
    lines.forEach((line, lineIndex) => {
        const currentRowIndex = startRow + lineIndex;
        if (currentRowIndex >= rowCount) return;
        const values = line.split('\t');
        values.forEach((value, valueIndex) => {
            const currentColIndex = startColIndex + valueIndex;
            if (currentColIndex >= colOrder.length) return;
            const field = colOrder[currentColIndex];
            let processedValue = value.trim();
            if (field.endsWith('Url')) {
                processedValue = processedValue.replace(/^https?:\/\//, '');
            }
            (newData[currentRowIndex][field] as string) = processedValue;
        });
    });
    setGridData(newData);
  };

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const processedData = gridData.map(row => {
        const data: Partial<BulkData> = {
            email: row.email.trim(),
            password: row.password.trim(),
        };
        if (row.tistoryBlogUrl.trim()) data.tistoryBlogUrl = 'https://' + row.tistoryBlogUrl.trim();
        if (row.naverBlogUrl.trim()) data.naverBlogUrl = 'https://' + row.naverBlogUrl.trim();
        if (row.blogspotUrl.trim()) data.blogspotUrl = 'https://' + row.blogspotUrl.trim();
        if (row.wordpressUrl.trim()) data.wordpressUrl = 'https://' + row.wordpressUrl.trim();
        return data;
    });
    const validData = processedData.filter(row => row.email && row.password);
    if (validData.length > 0) {
      onSave(validData);
    } else {
      onClose();
    }
  }, [gridData, onSave, onClose]);
  
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => { if (e.target === e.currentTarget) onClose(); };

  if (!isOpen) return null;

  const RowButton: React.FC<{count: number}> = ({ count }) => (
    <button type="button" onClick={() => setRowCount(count)} className={`px-3 py-1 text-sm rounded-md transition-colors ${ rowCount === count ? 'bg-indigo-600 text-white font-semibold' : 'bg-gray-200 dark:bg-gray-500 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-400' }`}>
        {count}행
    </button>
  );
  
  const renderUrlInput = (index: number, field: 'tistoryBlogUrl' | 'naverBlogUrl' | 'blogspotUrl' | 'wordpressUrl', placeholder: string) => (
    <div className="flex items-center h-full focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
        <span className="pl-6 pr-1 text-gray-500 dark:text-gray-400 select-none">https://</span>
        <input type="text" data-row={index} data-col={field} value={gridData[index][field]} onChange={(e) => handleInputChange(index, field, e.target.value)} className="w-full h-full pr-6 py-2 bg-transparent focus:outline-none text-gray-900 dark:text-white" placeholder={placeholder} />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby="bulk-add-modal-title">
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-xl w-full max-w-7xl flex flex-col" style={{height: '90vh'}}>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 dark:border-gray-600">
            <h2 id="bulk-add-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-2">계정 일괄 추가</h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>스프레드시트에서 <strong>이메일</strong>, <strong>비밀번호</strong>, <strong>각 블로그 홈페이지</strong> 열을 복사하여 아래 표에 붙여넣으세요.</p>
            </div>
            <div className="mt-4 flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">행 개수:</span>
                <RowButton count={50} />
                <RowButton count={100} />
            </div>
          </div>
          <div className="flex-grow p-6 overflow-hidden" onPaste={handlePaste}>
            <div className="h-full overflow-auto border border-gray-300 dark:border-gray-500 rounded-lg">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 table-fixed">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-600 dark:text-gray-300 sticky top-0 z-10">
                      <tr>
                          <th scope="col" className="w-12 px-4 py-3">#</th>
                          <th scope="col" className="w-1/5 px-6 py-3">Email</th>
                          <th scope="col" className="w-[15%] px-6 py-3">Password</th>
                          <th scope="col" className="px-6 py-3">Tistory</th>
                          <th scope="col" className="px-6 py-3">Naver</th>
                          <th scope="col" className="px-6 py-3">Blogspot</th>
                          <th scope="col" className="px-6 py-3">Wordpress</th>
                      </tr>
                  </thead>
                  <tbody>
                      {gridData.map((row, index) => (
                          <tr key={index} className="bg-white dark:bg-gray-700 border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500">
                              <td className="px-4 py-2 text-center text-gray-400 dark:text-gray-500">{index + 1}</td>
                              <td className="p-0"><input type="email" data-row={index} data-col="email" value={row.email} onChange={(e) => handleInputChange(index, 'email', e.target.value)} className="w-full h-full px-6 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 text-gray-900 dark:text-white" placeholder="example@google.com" /></td>
                              <td className="p-0"><input type="password" data-row={index} data-col="password" value={row.password} onChange={(e) => handleInputChange(index, 'password', e.target.value)} className="w-full h-full px-6 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 text-gray-900 dark:text-white" placeholder="••••••••" /></td>
                              <td className="p-0">{renderUrlInput(index, 'tistoryBlogUrl', 'blog.tistory.com')}</td>
                              <td className="p-0">{renderUrlInput(index, 'naverBlogUrl', 'blog.naver.com/id')}</td>
                              <td className="p-0">{renderUrlInput(index, 'blogspotUrl', 'blog.blogspot.com')}</td>
                              <td className="p-0">{renderUrlInput(index, 'wordpressUrl', 'example.com')}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-600/50 px-6 py-3 flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-600">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-500 dark:text-gray-200 border border-gray-300 dark:border-gray-400 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">취소</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">저장</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- from components/Header.tsx ---
interface HeaderProps {
  onAddAccount: () => void;
  onBulkAdd: () => void;
  onProfileSync: () => void;
  sortOption: string;
  onSortChange: (option: string) => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
  isRestoring: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  theme: 'light' | 'dark';
  onThemeChange: () => void;
}

const sortOptions: { [key: string]: string } = {
  'email-asc': '이메일 (A-Z)',
  'email-desc': '이메일 (Z-A)',
  'wordpress-enabled': '워드프레스',
  'blogspot-enabled': '블로그스팟',
  'naver-enabled': '네이버블로그',
  'tistory-enabled': '티스토리블로그',
};

const Header: React.FC<HeaderProps> = ({ 
    onAddAccount, onBulkAdd, onProfileSync, sortOption, onSortChange, onBackup, onRestore, isRestoring, searchQuery, onSearchChange, theme, onThemeChange
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSortOptionClick = (option: string) => {
    onSortChange(option);
    setIsDropdownOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onRestore(file);
    }
    if(event.target) {
      event.target.value = '';
    }
  }

  const handleRestoreClick = () => { fileInputRef.current?.click(); };

  return (
    <header className="bg-white dark:bg-gray-700 shadow-md sticky top-0 z-10">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center flex-shrink-0">
             <GoogleIcon className="h-8 w-8 text-indigo-500" />
            <h1 className="ml-3 text-2xl font-bold text-gray-900 dark:text-white hidden md:block">Account Manager</h1>
          </div>
          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-start">
            <div className="max-w-lg w-full lg:max-w-xs">
              <label htmlFor="search" className="sr-only">Search accounts</label>
              <div className="relative text-gray-400 focus-within:text-gray-600 dark:focus-within:text-gray-300">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center"><SearchIcon className="h-5 w-5" /></div>
                <input id="search" className="block w-full bg-white dark:bg-gray-600 py-2 pl-10 pr-3 border border-gray-300 dark:border-gray-500 rounded-md leading-5 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="이메일 또는 닉네임 검색..." type="search" name="search" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-500 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-700 focus:ring-indigo-500 transition" aria-haspopup="true" aria-expanded={isDropdownOpen}>
                <ArrowsUpDownIcon className="h-5 w-5 sm:mr-2 -ml-1" />
                <span className="hidden sm:inline">정렬: {sortOptions[sortOption]}</span>
              </button>
              {isDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-600 ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    {Object.entries(sortOptions).map(([key, value]) => (
                       <button key={key} onClick={() => handleSortOptionClick(key)} className={`${ sortOption === key ? 'bg-gray-100 dark:bg-gray-500 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200' } group flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-500`} role="menuitem">{value}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
            <button onClick={onBackup} title="Backup" className="hidden sm:inline-flex items-center p-2 border border-gray-300 dark:border-gray-500 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-700 focus:ring-indigo-500 transition"><BackupIcon className="h-5 w-5" /></button>
            <button onClick={handleRestoreClick} title="Restore" disabled={isRestoring} className="hidden sm:inline-flex items-center p-2 border border-gray-300 dark:border-gray-500 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-700 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed">{isRestoring ? <SpinnerIcon className="h-5 w-5" /> : <RestoreIcon className="h-5 w-5" />}</button>
            <button onClick={onProfileSync} title="프로필 가져오기" className="hidden sm:inline-flex items-center p-2 border border-gray-300 dark:border-gray-500 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-700 focus:ring-indigo-500 transition"><LinkIcon className="h-5 w-5" /></button>
            <button onClick={onBulkAdd} className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-500 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-700 focus:ring-indigo-500 transition"><BulkAddIcon className="h-5 w-5 sm:mr-2 -ml-1" /><span className="hidden sm:inline">일괄 추가</span></button>
            <button onClick={onAddAccount} className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-700 focus:ring-indigo-500 transition"><PlusIcon className="h-5 w-5 sm:mr-2 -ml-1" /><span className="hidden sm:inline">계정 추가</span></button>
            <button onClick={onThemeChange} className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-700 focus:ring-indigo-500 transition" aria-label="Toggle theme">{theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}</button>
          </div>
        </div>
      </div>
    </header>
  );
};

// --- from components/AccountCard.tsx ---
interface AccountCardProps {
  account: Account;
  onEdit: () => void;
  onDelete: () => void;
  onBlogClick: (url: string, blogName: string) => void;
}
const AccountCard: React.FC<AccountCardProps> = ({ account, onEdit, onDelete, onBlogClick }) => {
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

// --- from components/AccountModal.tsx ---
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
const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onSave, accountToEdit, onOpenTistory, onOpenWordpress, onOpenBlogspot, onOpenNaver, existingEmails }) => {
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
    
    if (!process.env.API_KEY) {
        setError("현재 환경에서는 닉네임 추천 기능을 사용할 수 없습니다.");
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

// --- from App.tsx ---
const App: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  
  const [isTistoryModalOpen, setIsTistoryModalOpen] = useState(false);
  const [isWordpressModalOpen, setIsWordpressModalOpen] = useState(false);
  const [isBlogspotModalOpen, setIsBlogspotModalOpen] = useState(false);
  const [isNaverModalOpen, setIsNaverModalOpen] = useState(false);
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [isProfileSyncModalOpen, setIsProfileSyncModalOpen] = useState(false);
  
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [sortOption, setSortOption] = useState<string>('email-asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const storedTheme = window.localStorage.getItem('theme');
        if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme;
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  interface ConfirmModalState { isOpen: boolean; title: string; message: string; onConfirm: () => void; variant?: 'default' | 'destructive'; confirmText?: string; cancelText?: string; }
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({ isOpen: false, title: '', message: '', onConfirm: () => {}, });

  interface CommandModalState { isOpen: boolean; title: string; command: string; }
  const [commandModal, setCommandModal] = useState<CommandModalState>({ isOpen: false, title: '', command: '' });

  useEffect(() => {
    try {
      const storedAccounts = localStorage.getItem('google-accounts');
      if (storedAccounts) setAccounts(JSON.parse(storedAccounts));
    } catch (error) { console.error("Failed to load accounts from localStorage", error); }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('google-accounts', JSON.stringify(accounts)); } 
    catch (error) { console.error("Failed to save accounts to localStorage", error); }
  }, [accounts]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    try { localStorage.setItem('theme', theme); } 
    catch (error) { console.error("Failed to save theme to localStorage", error); }
  }, [theme]);

  const handleThemeChange = useCallback(() => setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light'), []);
  
  const updateAccountDetails = useCallback((accountId: string, updates: Partial<Omit<Account, 'id'>>) => {
    let updatedAccount: Account | null = null;
    setAccounts(prev => prev.map(acc => {
        if (acc.id === accountId) {
            updatedAccount = { ...acc, ...updates };
            return updatedAccount;
        }
        return acc;
    }));
    if (editingAccount && editingAccount.id === accountId && updatedAccount) setEditingAccount(updatedAccount);
  }, [editingAccount]);

  const getChoseong = (str: string): string => {
    if (!str) return "";
    const CHOSEONG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
    return str.split('').map(char => {
      const code = char.charCodeAt(0) - 44032;
      if (code >= 0 && code <= 11171) {
        return CHOSEONG[Math.floor(code / 588)];
      }
      return char;
    }).join('');
  };

  const filteredAccounts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return accounts;
    const blogFilters = [
      { key: 'naver', name: '네이버', urlProp: 'naverBlogUrl' as keyof Account },
      { key: 'blogspot', name: '블로그스팟', urlProp: 'blogspotUrl' as keyof Account },
      { key: 'wordpress', name: '워드프레스', urlProp: 'wordpressUrl' as keyof Account },
    ];
    const queryChoseong = getChoseong(query);
    for (const filter of blogFilters) {
      const filterNameChoseong = getChoseong(filter.name);
      if (filter.name.startsWith(query) || (queryChoseong.length > 0 && filterNameChoseong.startsWith(queryChoseong)) || filter.key.startsWith(query)) {
        return accounts.filter(acc => {
          const url = acc[filter.urlProp];
          return url && typeof url === 'string' && url.trim() !== '';
        });
      }
    }
    return accounts.filter(acc => acc.email.toLowerCase().includes(query) || acc.nickname.toLowerCase().includes(query));
  }, [accounts, searchQuery]);

  const sortedAccounts = useMemo(() => {
    const accountsCopy = [...filteredAccounts];
    const sortByBlog = (blogUrlProp: keyof Account) => accountsCopy.sort((a, b) => {
        const aUrl = a[blogUrlProp]; const bUrl = b[blogUrlProp];
        const aHasBlog = typeof aUrl === 'string' && aUrl.trim() !== '';
        const bHasBlog = typeof bUrl === 'string' && bUrl.trim() !== '';
        if (aHasBlog && !bHasBlog) return -1;
        if (!aHasBlog && bHasBlog) return 1;
        return a.email.localeCompare(b.email);
    });
    switch (sortOption) {
      case 'email-desc': return accountsCopy.sort((a, b) => b.email.localeCompare(a.email));
      case 'wordpress-enabled': return sortByBlog('wordpressUrl');
      case 'blogspot-enabled': return sortByBlog('blogspotUrl');
      case 'naver-enabled': return sortByBlog('naverBlogUrl');
      case 'tistory-enabled': return sortByBlog('tistoryBlogUrl');
      case 'email-asc': default: return accountsCopy.sort((a, b) => a.email.localeCompare(b.email));
    }
  }, [filteredAccounts, sortOption]);

  const existingEmails = useMemo(() => accounts.map(acc => acc.email.toLowerCase()), [accounts]);
  const openAddModal = useCallback(() => { setEditingAccount(null); setIsModalOpen(true); }, []);
  const openEditModal = useCallback((account: Account) => { setEditingAccount(account); setIsModalOpen(true); }, []);
  const closeModal = useCallback(() => { setIsModalOpen(false); setEditingAccount(null); }, []);
  const openTistoryModal = useCallback((account: Account) => { setSelectedAccount(account); setIsTistoryModalOpen(true); }, []);
  const closeTistoryModal = useCallback(() => { setIsTistoryModalOpen(false); setSelectedAccount(null); }, []);
  const openWordpressModal = useCallback((account: Account) => { setSelectedAccount(account); setIsWordpressModalOpen(true); }, []);
  const closeWordpressModal = useCallback(() => { setIsWordpressModalOpen(false); setSelectedAccount(null); }, []);
  const openBlogspotModal = useCallback((account: Account) => { setSelectedAccount(account); setIsBlogspotModalOpen(true); }, []);
  const closeBlogspotModal = useCallback(() => { setIsBlogspotModalOpen(false); setSelectedAccount(null); }, []);
  const openNaverModal = useCallback((account: Account) => { setSelectedAccount(account); setIsNaverModalOpen(true); }, []);
  const closeNaverModal = useCallback(() => { setIsNaverModalOpen(false); setSelectedAccount(null); }, []);
  const openBulkAddModal = useCallback(() => setIsBulkAddModalOpen(true), []);
  const closeBulkAddModal = useCallback(() => setIsBulkAddModalOpen(false), []);
  const openProfileSyncModal = useCallback(() => setIsProfileSyncModalOpen(true), []);
  const closeProfileSyncModal = useCallback(() => setIsProfileSyncModalOpen(false), []);

  const handleSaveTistory = useCallback((data: any) => { if (selectedAccount) { updateAccountDetails(selectedAccount.id, data); closeTistoryModal(); } }, [selectedAccount, closeTistoryModal, updateAccountDetails]);
  const handleSaveWordpress = useCallback((data: any) => { if (selectedAccount) { updateAccountDetails(selectedAccount.id, data); closeWordpressModal(); } }, [selectedAccount, closeWordpressModal, updateAccountDetails]);
  const handleSaveBlogspot = useCallback((data: any) => { if (selectedAccount) { updateAccountDetails(selectedAccount.id, data); closeBlogspotModal(); } }, [selectedAccount, closeBlogspotModal, updateAccountDetails]);
  const handleSaveNaver = useCallback((data: any) => { if (selectedAccount) { updateAccountDetails(selectedAccount.id, data); closeNaverModal(); } }, [selectedAccount, closeNaverModal, updateAccountDetails]);

  const handleSaveAccount = useCallback((accountData: Omit<Account, 'id' | 'color' >, id?: string) => {
    if (id) {
      setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, ...accountData } : acc));
    } else {
      const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'];
      const newAccount: Account = { id: crypto.randomUUID(), ...accountData, color: colors[Math.floor(Math.random() * colors.length)] };
      setAccounts(prev => [newAccount, ...prev]);
    }
    closeModal();
  }, [closeModal]);

  const handleDeleteAccount = useCallback((id: string) => {
    setConfirmModal({
        isOpen: true, title: '계정 삭제 확인', message: '정말로 이 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
        onConfirm: () => { setAccounts(prev => prev.filter(acc => acc.id !== id)); setConfirmModal(prev => ({ ...prev, isOpen: false })); },
        variant: 'destructive', confirmText: '삭제', cancelText: '취소',
    });
  }, []);

  const handleSaveBulkAdd = useCallback((data: any[]) => {
    const newAccounts: Account[] = [];
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'];
    const existingEmailsSet = new Set(accounts.map(acc => acc.email));
    let addedCount = 0, skippedCount = 0;

    for (const item of data) {
      const { email, password, tistoryBlogUrl, naverBlogUrl, blogspotUrl, wordpressUrl } = item;
      if (email && password && /^\S+@\S+\.\S+$/.test(email) && !existingEmailsSet.has(email)) {
        newAccounts.push({
          id: crypto.randomUUID(), email, nickname: email, color: colors[Math.floor(Math.random() * colors.length)],
          tistoryId: email, tistoryPassword: password, tistoryBlogUrl,
          naverId: email, naverPassword: password, naverBlogUrl,
          blogspotUsername: email, blogspotPassword: password, blogspotUrl,
          wordpressUsername: email, wordpressPassword: password, wordpressUrl,
        });
        existingEmailsSet.add(email);
        addedCount++;
      } else if (email || password || tistoryBlogUrl || naverBlogUrl || blogspotUrl || wordpressUrl) {
        skippedCount++;
      }
    }
    if (addedCount > 0) setAccounts(prev => [...prev, ...newAccounts]);
    let alertMessage = "";
    if (addedCount > 0) alertMessage += `${addedCount}개의 계정이 성공적으로 추가되었습니다!`;
    if (skippedCount > 0) alertMessage += (alertMessage ? "\n" : "") + `${skippedCount}개의 계정은 데이터가 유효하지 않거나 중복되어 건너뛰었습니다.`;
    if (!alertMessage) alertMessage = "유효한 새 계정을 찾을 수 없습니다. 형식을 확인해주세요 (최소 이메일, 비밀번호 필요).";
    alert(alertMessage);
    closeBulkAddModal();
  }, [accounts, closeBulkAddModal]);
  
  const handleBackup = useCallback(() => {
    if (accounts.length === 0) { alert("백업할 데이터가 없습니다."); return; }
    const dataStr = JSON.stringify(accounts, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const dateString = new Date().toISOString().slice(0,10).replace(/-/g,"");
    const filename = `google-accounts-backup-${dateString}.json`;
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert(`계정 데이터가 '${filename}' 파일로 저장되었습니다.`);
  }, [accounts]);

  const handleRestore = useCallback(async (file: File) => {
    if (!file) return;
    setIsRestoring(true);
    try {
        const fileContent = await file.text();
        const restoredAccounts = JSON.parse(fileContent);
        if (!Array.isArray(restoredAccounts) || (restoredAccounts.length > 0 && (!restoredAccounts[0].id || !restoredAccounts[0].email))) {
            throw new Error("유효하지 않은 백업 파일 형식입니다.");
        }
        setConfirmModal({
            isOpen: true, title: '데이터 복원 확인', message: `백업 파일에서 ${restoredAccounts.length}개의 계정을 찾았습니다. 기존 데이터를 덮어쓰고 복원하시겠습니까?`,
            onConfirm: () => { setAccounts(restoredAccounts); setSearchQuery(''); alert(`성공적으로 복원되었습니다.`); setConfirmModal(prev => ({ ...prev, isOpen: false })); },
            variant: 'default', confirmText: '복원', cancelText: '취소'
        });
    } catch (error) {
        alert(`복원에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
        setIsRestoring(false);
    }
  }, [setAccounts, setSearchQuery]);

  const handleProfileSync = useCallback((pastedText: string) => {
    const profileMap = new Map<string, string>();
    const lines = pastedText.split(/\r?\n/).filter(line => line.trim() !== '');
    const regex = /^(Default|Profile\s\d+)\s*->\s*([\w.-]+@[\w.-]+\.\w+)/;
    for (const line of lines) {
        const match = line.trim().match(regex);
        if (match && match.length === 3) profileMap.set(match[2].toLowerCase(), match[1]);
    }
    if (profileMap.size === 0) { alert("유효한 프로필 정보를 찾지 못했습니다. 복사한 텍스트 형식을 확인해주세요."); return; }
    let updatedCount = 0;
    const updatedAccounts = accounts.map(account => {
        const emailLower = account.email.toLowerCase();
        if (profileMap.has(emailLower)) {
            const profileName = profileMap.get(emailLower);
            if (account.chromeProfile !== profileName) {
                updatedCount++;
                return { ...account, chromeProfile: profileName };
            }
        }
        return account;
    });
    setAccounts(updatedAccounts);
    alert(`${accounts.length}개 계정 중 ${updatedCount}개 계정의 Chrome 프로필 정보가 업데이트되었습니다.`);
  }, [accounts]);

  const handleBlogIconClick = useCallback((account: Account, blogUrl: string, blogName: string) => {
      const getWriteUrl = (name: string, url: string): string => {
          if (!url) return '';
          try {
              const urlObject = new URL(url);
              switch (name.toLowerCase()) {
                  case 'tistory':
                      return `${urlObject.origin}/manage/post`;
                  case 'wordpress':
                      return `${urlObject.origin}/wp-admin/post-new.php`;
                  case 'naver':
                      return 'https://blog.naver.com/PostWrite.naver';
                  case 'blogspot':
                      return 'https://www.blogger.com/';
                  default:
                      return url;
              }
          } catch (e) {
              console.error("Invalid URL:", url);
              return url;
          }
      };

      const targetUrl = getWriteUrl(blogName, blogUrl);

      if (account.chromeProfile && account.chromeProfile.trim() !== '') {
          const profileDir = account.chromeProfile.trim();
          const command = `"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --profile-directory="${profileDir}" "${targetUrl}"`;
          setCommandModal({
              isOpen: true,
              title: `${account.nickname} - ${blogName} 글쓰기 바로가기`,
              command: command,
          });
      } else {
          window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }
  }, []);

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200">
      <Header onAddAccount={openAddModal} onBulkAdd={openBulkAddModal} onProfileSync={openProfileSyncModal} sortOption={sortOption} onSortChange={setSortOption} onBackup={handleBackup} onRestore={handleRestore} isRestoring={isRestoring} searchQuery={searchQuery} onSearchChange={setSearchQuery} theme={theme} onThemeChange={handleThemeChange} />
      <main className="p-4 sm:p-6 lg:p-8">
        {accounts.length > 0 && sortedAccounts.length === 0 ? (
          <div className="text-center py-20 px-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-400">검색 결과 없음</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-500">"{searchQuery}"에 대한 검색 결과가 없습니다.</p>
          </div>
        ) : accounts.length === 0 ? (
           <div className="text-center py-20 px-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-400">계정이 없습니다</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-500">아래 버튼을 클릭하여 첫 Google 계정을 추가하거나 여러 계정을 일괄 추가하세요.</p>
            <button onClick={openAddModal} className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"><PlusCircleIcon className="h-6 w-6 mr-2" />계정 추가</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {sortedAccounts.map(account => (<AccountCard key={account.id} account={account} onEdit={() => openEditModal(account)} onDelete={() => handleDeleteAccount(account.id)} onBlogClick={(url, name) => handleBlogIconClick(account, url, name)} />))}
          </div>
        )}
      </main>
      <AccountModal isOpen={isModalOpen} onClose={closeModal} onSave={handleSaveAccount} accountToEdit={editingAccount} onOpenTistory={openTistoryModal} onOpenWordpress={openWordpressModal} onOpenBlogspot={openBlogspotModal} onOpenNaver={openNaverModal} existingEmails={existingEmails} />
      <TistoryModal isOpen={isTistoryModalOpen} onClose={closeTistoryModal} onSave={handleSaveTistory} accountToEdit={selectedAccount} />
      <WordpressModal isOpen={isWordpressModalOpen} onClose={closeWordpressModal} onSave={handleSaveWordpress} accountToEdit={selectedAccount} />
      <BlogspotModal isOpen={isBlogspotModalOpen} onClose={closeBlogspotModal} onSave={handleSaveBlogspot} accountToEdit={selectedAccount} />
      <NaverModal isOpen={isNaverModalOpen} onClose={closeNaverModal} onSave={handleSaveNaver} accountToEdit={selectedAccount} />
      <BulkAddModal isOpen={isBulkAddModalOpen} onClose={closeBulkAddModal} onSave={handleSaveBulkAdd} />
      <ConfirmModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal(prev => ({...prev, isOpen: false}))} onConfirm={confirmModal.onConfirm} title={confirmModal.title} variant={confirmModal.variant} confirmText={confirmModal.confirmText} cancelText={confirmModal.cancelText}><p className="text-sm text-gray-500 dark:text-gray-400">{confirmModal.message}</p></ConfirmModal>
      <ProfileSyncModal isOpen={isProfileSyncModalOpen} onClose={closeProfileSyncModal} onApply={handleProfileSync} />
      <CommandModal isOpen={commandModal.isOpen} onClose={() => setCommandModal(prev => ({...prev, isOpen: false}))} title={commandModal.title} command={commandModal.command} />
    </div>
  );
};

// --- Original index.tsx logic to render the App ---
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
