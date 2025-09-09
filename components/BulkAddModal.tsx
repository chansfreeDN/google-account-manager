import React, { useState, useEffect, useCallback } from 'react';

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
export const BulkAddModal: React.FC<BulkAddModalProps> = ({ isOpen, onClose, onSave }) => {
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
