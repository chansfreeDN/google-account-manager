import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Account } from './types.ts';
import { Header } from './components/Header.tsx';
import { AccountCard } from './components/AccountCard.tsx';
import { AccountModal } from './components/AccountModal.tsx';
import { TistoryModal } from './components/TistoryModal.tsx';
import { WordpressModal } from './components/WordpressModal.tsx';
import { BlogspotModal } from './components/BlogspotModal.tsx';
import { NaverModal } from './components/NaverModal.tsx';
import { BulkAddModal } from './components/BulkAddModal.tsx';
import { ProfileSyncModal } from './components/ProfileSyncModal.tsx';
import { ConfirmModal } from './components/ConfirmModal.tsx';
import { CommandModal } from './components/CommandModal.tsx';
import { PlusCircleIcon, PlusIcon } from './components/Icons.tsx';

// Data types for modals
interface TistoryData {
  tistoryId: string;
  tistoryPassword?: string;
  tistoryBlogUrl: string;
}
interface WordpressData {
  wordpressUsername: string;
  wordpressPassword?: string;
  wordpressUrl: string;
}
interface BlogspotData {
  blogspotUsername: string;
  blogspotPassword?: string;
  blogspotUrl: string;
}
interface NaverData {
  naverId: string;
  naverPassword?: string;
  naverBlogUrl: string;
}
interface BulkData {
  email: string;
  password: string;
  tistoryBlogUrl: string;
  naverBlogUrl: string;
  blogspotUrl: string;
  wordpressUrl: string;
}

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
      case 'email-asc': return accountsCopy.sort((a, b) => a.email.localeCompare(b.email));
      case 'email-desc': return accountsCopy.sort((a, b) => b.email.localeCompare(a.email));
      case 'wordpress-enabled': return sortByBlog('wordpressUrl');
      case 'blogspot-enabled': return sortByBlog('blogspotUrl');
      case 'naver-enabled': return sortByBlog('naverBlogUrl');
      case 'tistory-enabled': return sortByBlog('tistoryBlogUrl');
      default: return accountsCopy;
    }
  }, [filteredAccounts, sortOption]);
  
  const colors = [
    'bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500',
    'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500',
    'bg-teal-500', 'bg-cyan-500'
  ];

  const handleOpenAddModal = useCallback(() => {
    setEditingAccount(null);
    setIsModalOpen(true);
  }, []);
  
  const handleOpenEditModal = useCallback((account: Account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  }, []);

  const handleDeleteAccount = useCallback((accountToDelete: Account) => {
    setConfirmModal({
        isOpen: true,
        title: '계정 삭제',
        message: `'${accountToDelete.nickname}' (${accountToDelete.email}) 계정을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
        onConfirm: () => {
            setAccounts(prev => prev.filter(acc => acc.id !== accountToDelete.id));
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
        },
        variant: 'destructive',
        confirmText: '삭제',
        cancelText: '취소'
    });
  }, []);
  
  const handleSaveAccount = useCallback((accountData: Omit<Account, 'id' | 'color'>, id?: string) => {
    if (id) {
      updateAccountDetails(id, accountData);
    } else {
      const newAccount: Account = {
        ...accountData,
        id: Date.now().toString(),
        color: colors[accounts.length % colors.length],
      };
      setAccounts(prev => [...prev, newAccount]);
    }
    setIsModalOpen(false);
  }, [accounts.length, colors, updateAccountDetails]);

  const handleSaveTistory = useCallback((data: TistoryData) => {
    if (selectedAccount) {
        updateAccountDetails(selectedAccount.id, data);
        setIsTistoryModalOpen(false);
    }
  }, [selectedAccount, updateAccountDetails]);

  const handleSaveWordpress = useCallback((data: WordpressData) => {
    if (selectedAccount) {
        updateAccountDetails(selectedAccount.id, data);
        setIsWordpressModalOpen(false);
    }
  }, [selectedAccount, updateAccountDetails]);

  const handleSaveBlogspot = useCallback((data: BlogspotData) => {
    if (selectedAccount) {
        updateAccountDetails(selectedAccount.id, data);
        setIsBlogspotModalOpen(false);
    }
  }, [selectedAccount, updateAccountDetails]);

  const handleSaveNaver = useCallback((data: NaverData) => {
    if (selectedAccount) {
        updateAccountDetails(selectedAccount.id, data);
        setIsNaverModalOpen(false);
    }
  }, [selectedAccount, updateAccountDetails]);
  
  const handleSaveBulkAdd = useCallback((data: Partial<BulkData>[]) => {
      const newAccounts = data.map((row, index) => {
          const accountBase: Omit<Account, 'id'|'color'> = {
              email: row.email!,
              nickname: row.email!.split('@')[0],
              tistoryBlogUrl: row.tistoryBlogUrl,
              naverBlogUrl: row.naverBlogUrl,
              blogspotUrl: row.blogspotUrl,
              wordpressUrl: row.wordpressUrl,
          };
          return {
              ...accountBase,
              id: `${Date.now()}-${index}`,
              color: colors[(accounts.length + index) % colors.length],
          };
      });

      const existingEmails = new Set(accounts.map(acc => acc.email.toLowerCase()));
      const uniqueNewAccounts = newAccounts.filter(acc => !existingEmails.has(acc.email.toLowerCase()));
      
      setAccounts(prev => [...prev, ...uniqueNewAccounts]);
      setIsBulkAddModalOpen(false);
  }, [accounts, colors]);

  const openBlogModal = useCallback((setter: React.Dispatch<React.SetStateAction<boolean>>, account: Account) => {
      setSelectedAccount(account);
      setter(true);
  }, []);
  
  const handleOpenTistoryModal = useCallback((account: Account) => openBlogModal(setIsTistoryModalOpen, account), [openBlogModal]);
  const handleOpenWordpressModal = useCallback((account: Account) => openBlogModal(setIsWordpressModalOpen, account), [openBlogModal]);
  const handleOpenBlogspotModal = useCallback((account: Account) => openBlogModal(setIsBlogspotModalOpen, account), [openBlogModal]);
  const handleOpenNaverModal = useCallback((account: Account) => openBlogModal(setIsNaverModalOpen, account), [openBlogModal]);

  const handleBlogClick = useCallback((url: string, blogName: string) => {
    const account = accounts.find(acc => Object.values(acc).includes(url));
    if (account?.chromeProfile) {
        const command = `"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --profile-directory="${account.chromeProfile}" "${url}"`;
        setCommandModal({
            isOpen: true,
            title: `${account.nickname}님의 ${blogName} 블로그 열기`,
            command: command
        });
    } else {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, [accounts]);
  
  const handleBackup = useCallback(() => {
    try {
        const dataStr = JSON.stringify(accounts, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `account_manager_backup_${new Date().toISOString().slice(0, 10)}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    } catch (error) {
        console.error("Backup failed:", error);
        alert("백업에 실패했습니다.");
    }
  }, [accounts]);
  
  const handleRestore = useCallback((file: File) => {
      setIsRestoring(true);
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const result = event.target?.result;
              if (typeof result === 'string') {
                  const restoredAccounts = JSON.parse(result);
                  if (Array.isArray(restoredAccounts) && restoredAccounts.every(acc => acc.id && acc.email && acc.nickname)) {
                      setAccounts(restoredAccounts);
                  } else {
                      throw new Error("Invalid file format");
                  }
              }
          } catch (error) {
              console.error("Restore failed:", error);
              alert("백업 파일이 유효하지 않습니다.");
          } finally {
              setIsRestoring(false);
          }
      };
      reader.onerror = () => {
          alert("파일을 읽는 데 실패했습니다.");
          setIsRestoring(false);
      };
      reader.readAsText(file);
  }, []);

  const handleProfileSyncApply = useCallback((pastedText: string) => {
      const profileMap = new Map<string, string>();
      pastedText.split('\n').forEach(line => {
          const parts = line.split(' -> ');
          if (parts.length === 2) {
              const profileName = parts[0].trim();
              const emails = parts[1].split(',').map(e => e.trim().toLowerCase());
              emails.forEach(email => {
                  if (email) profileMap.set(email, profileName);
              });
          }
      });

      if (profileMap.size > 0) {
          setAccounts(prevAccounts =>
              prevAccounts.map(acc => {
                  const profile = profileMap.get(acc.email.toLowerCase());
                  if (profile) return { ...acc, chromeProfile: profile };
                  return acc;
              })
          );
      }
  }, []);

  const existingEmails = useMemo(() => accounts.map(a => a.email.toLowerCase()), [accounts]);
  
  const isAnyModalOpen = isModalOpen || isTistoryModalOpen || isWordpressModalOpen || isBlogspotModalOpen || isNaverModalOpen || isBulkAddModalOpen || isProfileSyncModalOpen || confirmModal.isOpen || commandModal.isOpen;

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-800 font-sans transition-colors duration-300 ${isAnyModalOpen ? 'overflow-hidden' : ''}`}>
      <Header
        onAddAccount={handleOpenAddModal}
        onBulkAdd={() => setIsBulkAddModalOpen(true)}
        onProfileSync={() => setIsProfileSyncModalOpen(true)}
        sortOption={sortOption}
        onSortChange={setSortOption}
        onBackup={handleBackup}
        onRestore={handleRestore}
        isRestoring={isRestoring}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        theme={theme}
        onThemeChange={handleThemeChange}
      />
      <main className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
        {sortedAccounts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {sortedAccounts.map(account => (
                <AccountCard
                key={account.id}
                account={account}
                onEdit={() => handleOpenEditModal(account)}
                onDelete={() => handleDeleteAccount(account)}
                onBlogClick={handleBlogClick}
                />
            ))}
            </div>
        ) : (
            <div className="text-center py-20">
                <PlusCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">계정 없음</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">새 계정을 추가하여 시작하세요.</p>
                <div className="mt-6">
                    <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                        계정 추가
                    </button>
                </div>
            </div>
        )}
      </main>
      
      <AccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAccount}
        accountToEdit={editingAccount}
        onOpenTistory={handleOpenTistoryModal}
        onOpenWordpress={handleOpenWordpressModal}
        onOpenBlogspot={handleOpenBlogspotModal}
        onOpenNaver={handleOpenNaverModal}
        existingEmails={existingEmails}
      />
      
      <TistoryModal
        isOpen={isTistoryModalOpen}
        onClose={() => setIsTistoryModalOpen(false)}
        onSave={handleSaveTistory}
        accountToEdit={selectedAccount}
      />

      <WordpressModal
        isOpen={isWordpressModalOpen}
        onClose={() => setIsWordpressModalOpen(false)}
        onSave={handleSaveWordpress}
        accountToEdit={selectedAccount}
      />

      <BlogspotModal
        isOpen={isBlogspotModalOpen}
        onClose={() => setIsBlogspotModalOpen(false)}
        onSave={handleSaveBlogspot}
        accountToEdit={selectedAccount}
      />

      <NaverModal
        isOpen={isNaverModalOpen}
        onClose={() => setIsNaverModalOpen(false)}
        onSave={handleSaveNaver}
        accountToEdit={selectedAccount}
      />

      <BulkAddModal
        isOpen={isBulkAddModalOpen}
        onClose={() => setIsBulkAddModalOpen(false)}
        onSave={handleSaveBulkAdd}
      />
      
      <ProfileSyncModal
        isOpen={isProfileSyncModalOpen}
        onClose={() => setIsProfileSyncModalOpen(false)}
        onApply={handleProfileSyncApply}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({...prev, isOpen: false}))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        variant={confirmModal.variant}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
      >
        <p>{confirmModal.message}</p>
      </ConfirmModal>

      <CommandModal
        isOpen={commandModal.isOpen}
        onClose={() => setCommandModal(prev => ({...prev, isOpen: false}))}
        title={commandModal.title}
        command={commandModal.command}
      />
    </div>
  );
};

export default App;
