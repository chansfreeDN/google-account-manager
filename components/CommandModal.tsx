import React, { useState, useEffect, useCallback } from 'react';

interface CommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  command: string;
}
export const CommandModal: React.FC<CommandModalProps> = ({ isOpen, onClose, title, command }) => {
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
