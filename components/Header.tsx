import React, { useState, useEffect, useRef } from 'react';
import {
    GoogleIcon,
    SearchIcon,
    ArrowsUpDownIcon,
    BackupIcon,
    RestoreIcon,
    LinkIcon,
    BulkAddIcon,
    PlusIcon,
    MoonIcon,
    SunIcon,
    SpinnerIcon
} from './Icons.tsx';

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

export const sortOptions: { [key: string]: string } = {
  'email-asc': '이메일 (A-Z)',
  'email-desc': '이메일 (Z-A)',
  'wordpress-enabled': '워드프레스',
  'blogspot-enabled': '블로그스팟',
  'naver-enabled': '네이버블로그',
  'tistory-enabled': '티스토리블로그',
};

export const Header: React.FC<HeaderProps> = ({ 
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
