import React, { useState, useEffect } from 'react';
import { CheckIcon, CopyIcon } from './Icons.tsx';

interface ProfileSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (pastedText: string) => void;
}
export const ProfileSyncModal: React.FC<ProfileSyncModalProps> = ({ isOpen, onClose, onApply }) => {
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
