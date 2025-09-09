
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

const e = React.createElement;

// --- Icons ---
const PlusIcon = (props) => e('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props }, e('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 4.5v15m7.5-7.5h-15" }));
const PlusCircleIcon = (props) => e('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props }, e('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" }));
const PencilIcon = (props) => e('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props }, e('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" }));
const TrashIcon = (props) => e('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props }, e('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" }));
const GoogleIcon = (props) => e('svg', { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 48 48", ...props }, e('path', { fill: "#4285F4", d: "M24 9.8c3.8 0 6.9 1.6 9.1 3.7l6.8-6.8C35.9 2.6 30.4 0 24 0 14.8 0 7.1 5.3 4 12.9l8.3 6.4C14.3 13.1 18.8 9.8 24 9.8z" }), e('path', { fill: "#34A853", d: "M46.2 25.1c0-1.7-.1-3.3-.4-4.9H24v9.3h12.4c-.5 3-2.1 5.6-4.6 7.4l7.6 5.9c4.4-4.1 7-10 7-17.7z" }), e('path', { fill: "#FBBC05", d: "M12.3 19.3c-1.1 3.3-1.1 7 0 10.3l-8.3 6.4C1.3 30.6 0 25.4 0 20s1.3-10.6 4-15.1l8.3 6.4z" }), e('path', { fill: "#EA4335", d: "M24 48c6.4 0 11.9-2.1 15.9-5.7l-7.6-5.9c-2.1 1.4-4.9 2.3-7.9 2.3-5.2 0-9.7-3.3-11.7-8.1l-8.3 6.4C7.1 42.7 14.8 48 24 48z" }), e('path', { fill: "none", d: "M0 0h48v48H0z" }));
const BulkAddIcon = (props) => e('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props }, e('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 12 2.25a2.251 2.251 0 0 1 1.447 3.757M5.25 6.375a2.25 2.25 0 0 1 2.25-2.25h8.25a2.25 2.25 0 0 1 2.25 2.25v9.75A2.25 2.25 0 0 1 18 18.75H7.5A2.25 2.25 0 0 1 5.25 16.5V6.375Z" }));
const ArrowsUpDownIcon = (props) => e('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props }, e('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" }));
const BackupIcon = (props) => e('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props }, e('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" }));
const RestoreIcon = (props) => e('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props }, e('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" }));
const SearchIcon = (props) => e('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props }, e('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" }));
const SunIcon = (props) => e('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props }, e('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" }));
const MoonIcon = (props) => e('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props }, e('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" }));
const SpinnerIcon = (props) => e('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", ...props, className: `animate-spin ${props.className}` }, e('circle', { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), e('path', { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" }));
const SparklesIcon = (props) => e('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props }, e('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" }));
const InfoIcon = (props) => e('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props }, e('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" }));
const LinkIcon = (props) => e('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props }, e('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" }));
const LetterCircleIcon = ({ letter, ...props }) => e('svg', { viewBox: "0 0 24 24", strokeWidth: "1.5", stroke: "currentColor", fill: "none", ...props }, e('circle', { cx: "12", cy: "12", r: "10" }), e('text', { x: "12", y: "17", textAnchor: "middle", fontSize: "13", fontWeight: "bold", fill: "currentColor", stroke: "none" }, letter));
const TistoryIcon = (props) => e(LetterCircleIcon, { letter: "T", ...props });
const NaverIcon = (props) => e(LetterCircleIcon, { letter: "N", ...props });
const BlogspotIcon = (props) => e(LetterCircleIcon, { letter: "B", ...props });
const WordpressIcon = (props) => e(LetterCircleIcon, { letter: "W", ...props });
const UserGroupIcon = (props) => e('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props}, e('path', {strokeLinecap:"round", strokeLinejoin:"round", d:"M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.289 2.72a3 3 0 0 1-4.682-2.72 9.094 9.094 0 0 1 3.741-.479m7.289 2.72a8.97 8.97 0 0 1-7.289 0M12 12.75a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm-7.5 4.5a4.5 4.5 0 0 1-1.13-8.625a4.5 4.5 0 0 1 8.625-1.13a4.5 4.5 0 0 1 1.13 8.625"}));

// --- Components ---

const Header = ({ onAddAccount, onBulkAdd, onProfileSync, sortOption, onSortChange, onBackup, onRestore, isRestoring, searchQuery, onSearchChange, theme, onThemeChange }) => {
    const restoreInputRef = useRef(null);
    const handleRestoreClick = () => restoreInputRef.current?.click();
    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file) onRestore(file);
        event.target.value = ''; // Reset input
    };

    const actionButtonClasses = "inline-flex items-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors";
    
    return e('header', { className: "bg-white dark:bg-gray-700 shadow-md sticky top-0 z-40" },
        e('div', { className: "max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8" },
            e('div', { className: "flex flex-wrap items-center justify-between gap-4 py-4" },
                e('div', { className: "flex items-center gap-4 flex-shrink-0" },
                    e(GoogleIcon, { className: "h-8 w-8" }),
                    e('h1', { className: "text-2xl font-bold text-gray-900 dark:text-white" }, "Google Account Manager"),
                    e('button', { onClick: onThemeChange, className: "p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500", "aria-label": "Toggle theme" },
                        theme === 'light' ? e(MoonIcon, { className: "h-6 w-6" }) : e(SunIcon, { className: "h-6 w-6" })
                    )
                ),
                e('div', { className: "flex flex-wrap items-center justify-end gap-2 w-full md:w-auto" },
                    e('div', { className: "relative w-full sm:w-auto md:max-w-xs" },
                        e('div', { className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3" }, e(SearchIcon, { className: "h-5 w-5 text-gray-400" })),
                        e('input', { type: "search", placeholder: "이메일 또는 닉네임으로 검색...", value: searchQuery, onChange: (e) => onSearchChange(e.target.value), className: "block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 bg-white dark:bg-gray-800 sm:text-sm sm:leading-6" })
                    ),
                    e('select', { value: sortOption, onChange: (e) => onSortChange(e.target.value), className: "h-full rounded-md border-0 bg-transparent py-2 pl-2 pr-7 text-gray-500 dark:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 bg-white dark:bg-gray-800" },
                        e('option', { value: 'email-asc' }, '이메일 오름차순'),
                        e('option', { value: 'email-desc' }, '이메일 내림차순'),
                        e('option', { value: 'tistory-enabled' }, '티스토리 연동'),
                        e('option', { value: 'naver-enabled' }, '네이버 연동'),
                        e('option', { value: 'blogspot-enabled' }, '블로그스팟 연동'),
                        e('option', { value: 'wordpress-enabled' }, '워드프레스 연동')
                    ),
                    e('button', { onClick: onBulkAdd, className: actionButtonClasses }, e(BulkAddIcon, { className: "-ml-0.5 mr-1.5 h-5 w-5" }), "일괄 추가"),
                    e('button', { onClick: onProfileSync, className: actionButtonClasses }, e(UserGroupIcon, { className: "-ml-0.5 mr-1.5 h-5 w-5" }), "프로필 동기화"),
                    
                    e('input', { type: "file", accept: ".json", onChange: handleFileChange, ref: restoreInputRef, className: "hidden" }),
                    e('button', { onClick: onBackup, className: actionButtonClasses, title: "Backup Data" }, e(BackupIcon, { className: "h-5 w-5" })),
                    e('button', { onClick: handleRestoreClick, className: actionButtonClasses, disabled: isRestoring, title: "Restore Data" }, isRestoring ? e(SpinnerIcon, { className: "h-5 w-5" }) : e(RestoreIcon, { className: "h-5 w-5" })),

                    e('button', { onClick: onAddAccount, className: "inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors" }, e(PlusIcon, { className: "-ml-0.5 mr-1.5 h-5 w-5" }), "계정 추가")
                )
            )
        )
    );
};

const AccountCard = ({ account, onEdit, onDelete, onBlogClick }) => {
    const blogServices = [
        { key: 'tistory', url: account.tistoryUrl || account.tistoryBlogUrl, name: 'Tistory', Icon: TistoryIcon, hoverColor: 'hover:text-orange-500 dark:hover:text-orange-400' },
        { key: 'naver', url: account.naverUrl || account.naverBlogUrl, name: 'Naver', Icon: NaverIcon, hoverColor: 'hover:text-green-500 dark:hover:text-green-400' },
        { key: 'blogspot', url: account.blogspotUrl, name: 'Blogspot', Icon: BlogspotIcon, hoverColor: 'hover:text-yellow-500 dark:hover:text-yellow-400' },
        { key: 'wordpress', url: account.wordpressUrl, name: 'Wordpress', Icon: WordpressIcon, hoverColor: 'hover:text-blue-500 dark:hover:text-blue-400' },
    ];
    const enabledBlogs = blogServices.filter(b => b.url);
    const firstLetter = account.email?.[0]?.toUpperCase() || '?';

    return e('div', { className: "bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl flex flex-col" },
        e('div', { className: "p-5 flex-grow" },
            e('div', { className: "flex items-start justify-between" },
                e('div', { className: "flex items-center gap-4" },
                    e('div', { className: `w-12 h-12 rounded-full ${account.color || 'bg-gray-500'} flex items-center justify-center text-white font-bold text-xl` }, firstLetter),
                    e('div', { className: "flex-1" },
                        e('p', { className: "text-lg font-bold text-gray-900 dark:text-white truncate", title: account.nickname }, account.nickname),
                        e('p', { className: "text-sm text-gray-500 dark:text-gray-400 truncate", title: account.email }, account.email)
                    )
                ),
                e('div', { className: "flex items-center" },
                    e('button', { onClick: onEdit, className: "p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400", "aria-label": "Edit account" }, e(PencilIcon, { className: "h-5 w-5" })),
                    e('button', { onClick: onDelete, className: "p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400", "aria-label": "Delete account" }, e(TrashIcon, { className: "h-5 w-5" }))
                )
            ),
            account.chromeProfile && e('div', { className: "mt-4 text-xs inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full px-2 py-1" },
                e(GoogleIcon, {className: "h-3 w-3"}),
                e('span', { title: `Chrome Profile: ${account.chromeProfile}` }, account.chromeProfile)
            )
        ),
        enabledBlogs.length > 0 && e('div', { className: "border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 p-4" },
            e('div', { className: "flex items-center justify-around" },
                enabledBlogs.map(({ key, url, name, Icon, hoverColor }) => 
                    e('button', { key: key, onClick: () => onBlogClick(url, name), title: name, className: `text-gray-500 dark:text-gray-400 ${hoverColor} transition-colors`, "aria-label": `Open ${name} blog` }, e(Icon, { className: "h-8 w-8" }))
                )
            )
        )
    );
};

const ModalWrapper = ({ isOpen, onClose, children }) => {
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;
    const handleOverlayClick = (e) => { if (e.target === e.currentTarget) onClose(); };

    return e('div', { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4", onClick: handleOverlayClick, role: "dialog", "aria-modal": "true" }, children);
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, children, variant = 'default', confirmText, cancelText }) => {
    if (!isOpen) return null;

    const confirmButtonBaseClasses = "px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";
    const destructiveClasses = "bg-red-600 hover:bg-red-700 focus:ring-red-500";
    const defaultClasses = "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500";
    const confirmClasses = variant === 'destructive' ? destructiveClasses : defaultClasses;

    return e(ModalWrapper, { isOpen, onClose },
        e('div', { className: "bg-white dark:bg-gray-700 rounded-lg shadow-xl w-full max-w-md" },
            e('div', { className: "p-6" },
                e('h2', { id: "confirm-modal-title", className: "text-xl font-bold text-gray-900 dark:text-white mb-4" }, title),
                e('div', { className: "text-gray-700 dark:text-gray-300" }, children)
            ),
            e('div', { className: "bg-gray-50 dark:bg-gray-600 px-6 py-3 flex justify-end space-x-3" },
                e('button', { type: "button", onClick: onClose, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-500 dark:text-gray-200 border border-gray-300 dark:border-gray-400 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors" }, cancelText || 'Cancel'),
                e('button', { type: "button", onClick: onConfirm, className: `${confirmButtonBaseClasses} ${confirmClasses}` }, confirmText || 'Confirm')
            )
        )
    );
};

const CommandModal = ({ isOpen, onClose, title, command }) => {
    const [buttonText, setButtonText] = useState('명령어 복사');
    const [altButtonText, setAltButtonText] = useState('명령어 복사');
    const commandForX86 = command.replace("Program Files", "Program Files (x86)");
    const hasAlternative = commandForX86 !== command;

    useEffect(() => {
        if (isOpen) { setButtonText('명령어 복사'); setAltButtonText('명령어 복사'); }
    }, [isOpen]);

    const handleCopy = useCallback((textToCopy, setText) => {
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

    return e(ModalWrapper, { isOpen, onClose },
        e('div', { className: "bg-white dark:bg-gray-700 rounded-lg shadow-xl w-full max-w-2xl" },
            e('div', { className: "p-6" },
                e('h2', { id: "command-modal-title", className: "text-xl font-bold text-gray-900 dark:text-white mb-4" }, title),
                e('div', { className: "space-y-4" },
                    e('div', null,
                        e('label', { className: "text-sm font-semibold text-gray-800 dark:text-gray-200" }, "1. 기본 명령어 (64비트 Windows)"),
                        e('p', { className: "text-xs text-gray-600 dark:text-gray-400 mb-2" }, "아래 명령어를 복사한 후, ", e('kbd', { className: "px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500" }, "Win"), " + ", e('kbd', { className: "px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500" }, "R"), " 키를 눌러 실행창에 붙여넣고 실행하세요."),
                        e('div', { className: "relative" },
                            e('input', { type: "text", readOnly: true, value: command, className: "w-full pl-3 pr-24 py-2 font-mono text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" }),
                            e('button', { onClick: () => handleCopy(command, setButtonText), className: "absolute inset-y-0 right-0 m-1 px-3 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors" }, buttonText)
                        )
                    ),
                    e('div', { className: "pt-4 border-t border-gray-200 dark:border-gray-600" },
                        e('h3', { className: "text-md font-semibold text-gray-800 dark:text-gray-200" }, "2. 오류 발생 시 해결 방법"),
                        hasAlternative && e('div', { className: "mt-4" },
                            e('label', { className: "text-sm font-semibold text-gray-800 dark:text-gray-200" }, "방법 A: 32비트용 명령어 시도"),
                            e('div', { className: "relative mt-2" },
                                e('input', { type: "text", readOnly: true, value: commandForX86, className: "w-full pl-3 pr-24 py-2 font-mono text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" }),
                                e('button', { onClick: () => handleCopy(commandForX86, setAltButtonText), className: "absolute inset-y-0 right-0 m-1 px-3 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors" }, altButtonText)
                            )
                        ),
                        e('div', { className: "mt-4" },
                            e('p', { className: "text-sm font-semibold text-gray-800 dark:text-gray-200" }, "방법 B: 직접 경로 찾기"),
                            e('ol', { className: "list-decimal list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1 pl-2" },
                                e('li', null, "바탕화면의 Chrome 바로가기 아이콘 우클릭 후 '속성' 선택"),
                                e('li', null, "'바로 가기' 탭의 '대상(Target)' 필드 텍스트 전체 복사"),
                                e('li', null, "위 명령어의 실행 파일 경로 부분을 복사한 내용으로 교체")
                            )
                        )
                    )
                )
            ),
            e('div', { className: "bg-gray-50 dark:bg-gray-600 px-6 py-3 flex justify-end" },
                e('button', { type: "button", onClick: onClose, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-500 dark:text-gray-200 border border-gray-300 dark:border-gray-400 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors" }, "닫기")
            )
        )
    );
};

const GenericBlogModal = ({ isOpen, onClose, onSave, accountToEdit, blogType }) => {
    const typeLower = blogType.toLowerCase();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [blogUrl, setBlogUrl] = useState('');
    const [error, setError] = useState('');
  
    const usernameField = typeLower === 'naver' ? 'naverId' : (typeLower === 'tistory' ? 'tistoryId' : `${typeLower}Username`);
    const passwordField = `${typeLower}Password`;
    const urlField = typeLower === 'naver' ? 'naverBlogUrl' : (typeLower === 'tistory' ? 'tistoryBlogUrl' : `${typeLower}Url`);

    useEffect(() => {
        if (accountToEdit) {
            setUsername(accountToEdit[usernameField] || '');
            setPassword(accountToEdit[passwordField] || '');
            setBlogUrl((accountToEdit[urlField] || '').replace(/^https?:\/\//, ''));
        } else {
            setUsername(''); setPassword(''); setBlogUrl('');
        }
        setError('');
    }, [accountToEdit, isOpen, usernameField, passwordField, urlField]);
  
    const handleSubmit = useCallback((event) => {
        event.preventDefault();
        const trimmedUsername = username.trim();
        const trimmedUrlPart = blogUrl.trim();
        if (!trimmedUsername) { setError(`${blogType} 아이디를 입력해주세요.`); return; }
        if (blogType !== 'Naver' && !trimmedUrlPart) { setError(`유효한 ${blogType} 블로그 주소를 입력해주세요.`); return; }
        
        const finalUrl = blogType === 'Naver' ? `https://blog.naver.com/${trimmedUsername}` : `https://${trimmedUrlPart}`;
        
        onSave({
            [usernameField]: trimmedUsername,
            [passwordField]: password,
            [urlField]: finalUrl,
        });
    }, [username, password, blogUrl, onSave, blogType, usernameField, passwordField, urlField]);
  
    if (!isOpen) return null;
  
    return e(ModalWrapper, { isOpen, onClose },
      e('div', { className: "bg-white dark:bg-gray-700 rounded-lg shadow-xl w-full max-w-md" },
        e('form', { onSubmit: handleSubmit },
          e('div', { className: "p-6" },
            e('h2', { className: "text-2xl font-bold text-gray-900 dark:text-white mb-4" }, `${blogType} 블로그 정보`),
            e('p', { className: "text-sm text-gray-600 dark:text-gray-400 mb-4" }, "계정: ", e('span', { className: "font-medium" }, accountToEdit?.email)),
            error && e('p', { className: "mb-4 text-sm text-red-600 dark:text-red-400" }, error),
            e('div', { className: "space-y-4" },
              e('div', null,
                e('label', { htmlFor: `${typeLower}Id`, className: "block text-sm font-medium text-gray-700 dark:text-gray-300" }, `${blogType} 아이디`),
                e('input', { type: "text", id: `${typeLower}Id`, value: username, onChange: (e) => setUsername(e.target.value), className: "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white", required: true })
              ),
              e('div', null,
                e('label', { htmlFor: `${typeLower}Password`, className: "block text-sm font-medium text-gray-700 dark:text-gray-300" }, "비밀번호"),
                e('input', { type: "password", id: `${typeLower}Password`, value: password, onChange: (e) => setPassword(e.target.value), className: "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white" })
              ),
              blogType !== 'Naver' && e('div', null,
                e('label', { htmlFor: `${typeLower}BlogUrl`, className: "block text-sm font-medium text-gray-700 dark:text-gray-300" }, `${blogType} 블로그 주소`),
                e('div', { className: "mt-1 flex rounded-md shadow-sm" },
                  e('span', { className: "inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm dark:bg-gray-500 dark:border-gray-400 dark:text-gray-400" }, "https://"),
                  e('input', { type: "text", id: `${typeLower}BlogUrl`, value: blogUrl, onChange: (e) => setBlogUrl(e.target.value.replace(/^https?:\/\//, '')), className: "block w-full flex-1 rounded-none rounded-r-md px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white", required: true })
                )
              )
            )
          ),
          e('div', { className: "bg-gray-50 dark:bg-gray-600 px-6 py-3 flex justify-end space-x-3" },
            e('button', { type: "button", onClick: onClose, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-500 dark:text-gray-200 border border-gray-300 dark:border-gray-400 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors" }, "취소"),
            e('button', { type: "submit", className: "px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors" }, "저장")
          )
        )
      )
    );
};
const TistoryModal = (props) => e(GenericBlogModal, { ...props, blogType: "Tistory" });
const WordpressModal = (props) => e(GenericBlogModal, { ...props, blogType: "Wordpress" });
const BlogspotModal = (props) => e(GenericBlogModal, { ...props, blogType: "Blogspot" });
const NaverModal = (props) => e(GenericBlogModal, { ...props, blogType: "Naver" });

const AccountModal = ({ isOpen, onClose, onSave, accountToEdit, onOpenTistory, onOpenWordpress, onOpenBlogspot, onOpenNaver, existingEmails }) => {
    const [email, setEmail] = useState('');
    const [nickname, setNickname] = useState('');
    const [chromeProfile, setChromeProfile] = useState('');
    const [error, setError] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSuggesting, setIsSuggesting] = useState(false);

    useEffect(() => {
        if (accountToEdit) {
            setEmail(accountToEdit.email);
            setNickname(accountToEdit.nickname);
            setChromeProfile(accountToEdit.chromeProfile || '');
        } else {
            setEmail(''); setNickname(''); setChromeProfile('');
        }
        setError(''); setSuggestions([]); setIsSuggesting(false);
    }, [accountToEdit, isOpen]);

    const handleSuggestNickname = useCallback(async () => {
        if (!email || !/^\S+@\S+\.\S+$/.test(email) || isSuggesting) {
            if (!email || !/^\S+@\S+\.\S+$/.test(email)) setError('유효한 이메일을 입력해야 추천받을 수 있습니다.');
            return;
        }
        setError(''); setIsSuggesting(true); setSuggestions([]);
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

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        const trimmedEmail = email.trim();
        const trimmedNickname = nickname.trim();
        const trimmedChromeProfile = chromeProfile.trim();
        if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) { setError('유효한 이메일 주소를 입력해주세요.'); return; }
        if (!trimmedNickname) { setError('닉네임을 입력해주세요.'); return; }
        if (!accountToEdit && existingEmails.includes(trimmedEmail.toLowerCase())) { setError('이미 등록된 이메일 주소입니다.'); return; }
        onSave({ email: trimmedEmail, nickname: trimmedNickname, chromeProfile: trimmedChromeProfile }, accountToEdit?.id);
    }, [email, nickname, chromeProfile, onSave, accountToEdit, existingEmails]);

    if (!isOpen) return null;
    const handleOpenBlogModal = (opener) => { if (accountToEdit) opener(accountToEdit); };

    return e(ModalWrapper, { isOpen, onClose },
        e('div', { className: "bg-white dark:bg-gray-700 rounded-lg shadow-xl w-full max-w-md" },
            e('form', { onSubmit: handleSubmit },
                e('div', { className: "p-6" },
                    e('h2', { className: "text-2xl font-bold text-gray-900 dark:text-white mb-4" }, accountToEdit ? '계정 수정' : '새 계정 추가'),
                    error && e('p', { className: "mb-4 text-sm text-red-600 dark:text-red-400" }, error),
                    e('div', { className: "space-y-4" },
                        e('div', null,
                            e('label', { htmlFor: "email", className: "block text-sm font-medium text-gray-700 dark:text-gray-300" }, "이메일"),
                            e('input', { type: "email", id: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white disabled:bg-gray-200 dark:disabled:bg-gray-800", placeholder: "example@google.com", required: true, disabled: !!accountToEdit })
                        ),
                        e('div', null,
                            e('div', { className: "flex justify-between items-center" },
                                e('label', { htmlFor: "nickname", className: "block text-sm font-medium text-gray-700 dark:text-gray-300" }, "닉네임"),
                                e('button', { type: "button", onClick: handleSuggestNickname, disabled: isSuggesting || !email, className: "inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed transition-colors" }, isSuggesting ? e(SpinnerIcon, { className: "h-4 w-4 mr-1" }) : e(SparklesIcon, { className: "h-4 w-4 mr-1" }), "닉네임 추천")
                            ),
                            e('input', { type: "text", id: "nickname", value: nickname, onChange: (e) => setNickname(e.target.value), className: "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white", placeholder: "업무용 계정", required: true }),
                            suggestions.length > 0 && e('div', { className: "mt-2 flex flex-wrap gap-2" },
                                suggestions.map((suggestion, index) => e('button', { key: index, type: "button", onClick: () => setNickname(suggestion), className: "px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors" }, suggestion))
                            )
                        ),
                        e('div', null,
                            e('div', { className: "flex items-center" },
                                e('label', { htmlFor: "chromeProfile", className: "block text-sm font-medium text-gray-700 dark:text-gray-300" }, "Chrome 프로필"),
                                e('div', { className: "relative ml-2 group" }, e(InfoIcon, { className: "h-4 w-4 text-gray-400 dark:text-gray-500" }), e('div', { className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" }, "Chrome 주소창에 'chrome://version' 입력 후, '프로필 경로'의 마지막 디렉토리 이름 (예: Default, Profile 1)을 입력하세요."))
                            ),
                            e('input', { type: "text", id: "chromeProfile", value: chromeProfile, onChange: (e) => setChromeProfile(e.target.value), className: "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white", placeholder: "Profile 1" })
                        ),
                        accountToEdit && e('div', { className: "pt-2" },
                            e('label', { className: "block text-sm font-medium text-gray-700 dark:text-gray-300" }, "블로그 정보 수정"),
                            e('div', { className: "mt-2 flex items-center space-x-4" },
                                e('button', { type: "button", onClick: () => handleOpenBlogModal(onOpenTistory), className: "text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 transition-colors", "aria-label": "Edit Tistory Info" }, e(TistoryIcon, { className: "h-8 w-8" })),
                                e('button', { type: "button", onClick: () => handleOpenBlogModal(onOpenNaver), className: "text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400 transition-colors", "aria-label": "Edit Naver Info" }, e(NaverIcon, { className: "h-8 w-8" })),
                                e('button', { type: "button", onClick: () => handleOpenBlogModal(onOpenBlogspot), className: "text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors", "aria-label": "Edit Blogspot Info" }, e(BlogspotIcon, { className: "h-8 w-8" })),
                                e('button', { type: "button", onClick: () => handleOpenBlogModal(onOpenWordpress), className: "text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors", "aria-label": "Edit Wordpress Info" }, e(WordpressIcon, { className: "h-8 w-8" }))
                            )
                        )
                    )
                ),
                e('div', { className: "bg-gray-50 dark:bg-gray-600 px-6 py-3 flex justify-end space-x-3" },
                    e('button', { type: "button", onClick: onClose, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-500 dark:text-gray-200 border border-gray-300 dark:border-gray-400 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors" }, "취소"),
                    e('button', { type: "submit", className: "px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors" }, "저장")
                )
            )
        )
    );
};

const BulkAddModal = ({ isOpen, onClose, onSave }) => {
    const [tsvData, setTsvData] = useState('');
    const handleSubmit = () => {
        const lines = tsvData.trim().split('\n');
        const headers = (lines.shift() || '').split('\t').map(h => h.trim().toLowerCase());
        const data = lines.map(line => {
            const values = line.split('\t');
            const row = {};
            headers.forEach((header, index) => {
                const key = header.includes('tistory') ? 'tistoryBlogUrl' :
                            header.includes('naver') ? 'naverBlogUrl' :
                            header.includes('blogspot') ? 'blogspotUrl' :
                            header.includes('wordpress') ? 'wordpressUrl' : header;
                if (key) row[key] = values[index];
            });
            return row;
        });
        onSave(data);
    };

    if (!isOpen) return null;

    return e(ModalWrapper, { isOpen, onClose },
        e('div', { className: "bg-white dark:bg-gray-700 rounded-lg shadow-xl w-full max-w-2xl" },
            e('div', { className: "p-6" },
                e('h2', { className: "text-2xl font-bold text-gray-900 dark:text-white mb-2" }, "계정 일괄 추가"),
                e('p', { className: "text-sm text-gray-600 dark:text-gray-400 mb-4" }, "스프레드시트(Excel, Google Sheets)에서 데이터를 복사하여 아래에 붙여넣으세요. 첫 줄은 헤더(email, tistory, naver 등)여야 합니다."),
                e('textarea', {
                    value: tsvData,
                    onChange: e => setTsvData(e.target.value),
                    placeholder: "email\ttistory\nuser1@example.com\thttps://user1.tistory.com\nuser2@example.com\thttps://user2.tistory.com",
                    className: "w-full h-64 p-3 font-mono text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                })
            ),
            e('div', { className: "bg-gray-50 dark:bg-gray-600 px-6 py-3 flex justify-end space-x-3" },
                e('button', { type: "button", onClick: onClose, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-500 dark:text-gray-200 border border-gray-300 dark:border-gray-400 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" }, "취소"),
                e('button', { type: "button", onClick: handleSubmit, className: "px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" }, "추가하기")
            )
        )
    );
};

const ProfileSyncModal = ({ isOpen, onClose, onApply }) => {
    const [pastedText, setPastedText] = useState('');
    const handleSubmit = () => onApply(pastedText);

    if (!isOpen) return null;

    return e(ModalWrapper, { isOpen, onClose },
        e('div', { className: "bg-white dark:bg-gray-700 rounded-lg shadow-xl w-full max-w-2xl" },
            e('div', { className: "p-6" },
                e('h2', { className: "text-2xl font-bold text-gray-900 dark:text-white mb-2" }, "Chrome 프로필 동기화"),
                e('p', { className: "text-sm text-gray-600 dark:text-gray-400 mb-4" }, "아래 형식에 맞춰 프로필과 이메일 목록을 붙여넣으세요. 각 줄은 '프로필이름 -> 이메일1, 이메일2, ...' 형식이어야 합니다."),
                e('textarea', {
                    value: pastedText,
                    onChange: e => setPastedText(e.target.value),
                    placeholder: "Profile 1 -> user1@example.com, user2@example.com\nDefault -> admin@example.com",
                    className: "w-full h-64 p-3 font-mono text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                })
            ),
            e('div', { className: "bg-gray-50 dark:bg-gray-600 px-6 py-3 flex justify-end space-x-3" },
                e('button', { type: "button", onClick: onClose, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-500 dark:text-gray-200 border border-gray-300 dark:border-gray-400 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-400" }, "취소"),
                e('button', { type: "button", onClick: handleSubmit, className: "px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700" }, "적용하기")
            )
        )
    );
};


const App = () => {
  const [accounts, setAccounts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  
  const [isTistoryModalOpen, setIsTistoryModalOpen] = useState(false);
  const [isWordpressModalOpen, setIsWordpressModalOpen] = useState(false);
  const [isBlogspotModalOpen, setIsBlogspotModalOpen] = useState(false);
  const [isNaverModalOpen, setIsNaverModalOpen] = useState(false);
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [isProfileSyncModalOpen, setIsProfileSyncModalOpen] = useState(false);
  
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [sortOption, setSortOption] = useState('email-asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const storedTheme = window.localStorage.getItem('theme');
        if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme;
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, variant: 'default', confirmText: 'Confirm', cancelText: 'Cancel' });
  const [commandModal, setCommandModal] = useState({ isOpen: false, title: '', command: '' });

  useEffect(() => {
    try {
      const storedAccounts = localStorage.getItem('google-accounts');
      if (storedAccounts) setAccounts(JSON.parse(storedAccounts));
    } catch (error) { console.error("Failed to load accounts from localStorage", error); setAccounts([]); }
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
  
  const updateAccountDetails = useCallback((accountId, updates) => {
    setAccounts(prev => prev.map(acc => acc.id === accountId ? { ...acc, ...updates } : acc));
    if (editingAccount && editingAccount.id === accountId) setEditingAccount(prev => ({ ...prev, ...updates }));
  }, [editingAccount]);

  const filteredAccounts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return accounts;
    return accounts.filter(acc => acc.email.toLowerCase().includes(query) || acc.nickname.toLowerCase().includes(query));
  }, [accounts, searchQuery]);

  const sortedAccounts = useMemo(() => {
    const accountsCopy = [...filteredAccounts];
    const sortByBlog = (blogUrlProp) => accountsCopy.sort((a, b) => {
        const aHasBlog = a[blogUrlProp] && a[blogUrlProp].trim() !== '';
        const bHasBlog = b[blogUrlProp] && b[blogUrlProp].trim() !== '';
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
  
  const colors = ['bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'];

  const handleOpenAddModal = useCallback(() => { setEditingAccount(null); setIsModalOpen(true); }, []);
  const handleOpenEditModal = useCallback((account) => { setEditingAccount(account); setIsModalOpen(true); }, []);

  const handleDeleteAccount = useCallback((accountToDelete) => {
    setConfirmModal({
        isOpen: true, title: '계정 삭제', message: `'${accountToDelete.nickname}' (${accountToDelete.email}) 계정을 정말로 삭제하시겠습니까?`,
        onConfirm: () => {
            setAccounts(prev => prev.filter(acc => acc.id !== accountToDelete.id));
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
        },
        variant: 'destructive', confirmText: '삭제', cancelText: '취소'
    });
  }, []);
  
  const handleSaveAccount = useCallback((accountData, id) => {
    if (id) {
      updateAccountDetails(id, accountData);
    } else {
      const newAccount = { ...accountData, id: Date.now().toString(), color: colors[accounts.length % colors.length] };
      setAccounts(prev => [...prev, newAccount]);
    }
    setIsModalOpen(false);
  }, [accounts.length, colors, updateAccountDetails]);

  const createBlogSaveHandler = (modalSetter) => useCallback((data) => {
    if (selectedAccount) {
        updateAccountDetails(selectedAccount.id, data);
        modalSetter(false);
    }
  }, [selectedAccount, updateAccountDetails]);

  const handleSaveTistory = createBlogSaveHandler(setIsTistoryModalOpen);
  const handleSaveWordpress = createBlogSaveHandler(setIsWordpressModalOpen);
  const handleSaveBlogspot = createBlogSaveHandler(setIsBlogspotModalOpen);
  const handleSaveNaver = createBlogSaveHandler(setIsNaverModalOpen);
  
  const handleSaveBulkAdd = useCallback((data) => {
      const existingEmails = new Set(accounts.map(acc => acc.email.toLowerCase()));
      const uniqueNewAccounts = data
        .filter(row => row.email && !existingEmails.has(row.email.toLowerCase()))
        .map((row, index) => ({
              ...row,
              nickname: row.nickname || row.email.split('@')[0],
              id: `${Date.now()}-${index}`,
              color: colors[(accounts.length + index) % colors.length],
        }));
      setAccounts(prev => [...prev, ...uniqueNewAccounts]);
      setIsBulkAddModalOpen(false);
  }, [accounts, colors]);

  const openBlogModal = useCallback((setter, account) => { setSelectedAccount(account); setter(true); }, []);
  const handleOpenTistoryModal = useCallback((account) => openBlogModal(setIsTistoryModalOpen, account), [openBlogModal]);
  const handleOpenWordpressModal = useCallback((account) => openBlogModal(setIsWordpressModalOpen, account), [openBlogModal]);
  const handleOpenBlogspotModal = useCallback((account) => openBlogModal(setIsBlogspotModalOpen, account), [openBlogModal]);
  const handleOpenNaverModal = useCallback((account) => openBlogModal(setIsNaverModalOpen, account), [openBlogModal]);

  const handleBlogClick = useCallback((url, blogName) => {
    const account = accounts.find(acc => Object.values(acc).includes(url));
    if (account?.chromeProfile) {
        const command = `"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --profile-directory="${account.chromeProfile}" "${url}"`;
        setCommandModal({ isOpen: true, title: `${account.nickname}님의 ${blogName} 블로그 열기`, command: command });
    } else {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, [accounts]);
  
  const handleBackup = useCallback(() => {
    try {
        const dataStr = JSON.stringify(accounts, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const linkElement = document.createElement('a');
        linkElement.href = url;
        linkElement.download = `account_manager_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
        URL.revokeObjectURL(url);
    } catch (error) { alert("백업에 실패했습니다."); }
  }, [accounts]);
  
  const handleRestore = useCallback((file) => {
      setIsRestoring(true);
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const restoredAccounts = JSON.parse(event.target.result);
              if (Array.isArray(restoredAccounts)) {
                  setAccounts(restoredAccounts);
              } else { throw new Error("Invalid file format"); }
          } catch (error) { alert("백업 파일이 유효하지 않습니다."); } 
          finally { setIsRestoring(false); }
      };
      reader.onerror = () => { alert("파일을 읽는 데 실패했습니다."); setIsRestoring(false); };
      reader.readAsText(file);
  }, []);

  const handleProfileSyncApply = useCallback((pastedText) => {
      const profileMap = new Map();
      pastedText.split('\n').forEach(line => {
          const parts = line.split('->');
          if (parts.length === 2) {
              const profileName = parts[0].trim();
              parts[1].split(',').forEach(email => { if (email.trim()) profileMap.set(email.trim().toLowerCase(), profileName); });
          }
      });
      if (profileMap.size > 0) {
          setAccounts(prev => prev.map(acc => ({ ...acc, chromeProfile: profileMap.get(acc.email.toLowerCase()) || acc.chromeProfile })));
          setIsProfileSyncModalOpen(false);
      }
  }, []);

  const existingEmails = useMemo(() => accounts.map(a => a.email.toLowerCase()), [accounts]);
  
  return e(React.Fragment, null,
    e(Header, {
      onAddAccount: handleOpenAddModal,
      onBulkAdd: () => setIsBulkAddModalOpen(true),
      onProfileSync: () => setIsProfileSyncModalOpen(true),
      sortOption, onSortChange: setSortOption,
      onBackup: handleBackup, onRestore: handleRestore, isRestoring,
      searchQuery, onSearchChange: setSearchQuery,
      theme, onThemeChange: handleThemeChange,
    }),
    e('main', { className: "max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8" },
      sortedAccounts.length > 0
        ? e('div', { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" },
          sortedAccounts.map(account => e(AccountCard, {
            key: account.id, account,
            onEdit: () => handleOpenEditModal(account),
            onDelete: () => handleDeleteAccount(account),
            onBlogClick: handleBlogClick,
          }))
        )
        : e('div', { className: "text-center py-20" },
          e(PlusCircleIcon, { className: "mx-auto h-12 w-12 text-gray-400" }),
          e('h3', { className: "mt-2 text-sm font-semibold text-gray-900 dark:text-white" }, "계정 없음"),
          e('p', { className: "mt-1 text-sm text-gray-500 dark:text-gray-400" }, "새 계정을 추가하여 시작하세요."),
          e('div', { className: "mt-6" },
            e('button', { type: "button", onClick: handleOpenAddModal, className: "inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" },
              e(PlusIcon, { className: "-ml-0.5 mr-1.5 h-5 w-5" }), "계정 추가")
          )
        )
    ),
    e(AccountModal, { isOpen: isModalOpen, onClose: () => setIsModalOpen(false), onSave: handleSaveAccount, accountToEdit: editingAccount, onOpenTistory: handleOpenTistoryModal, onOpenWordpress: handleOpenWordpressModal, onOpenBlogspot: handleOpenBlogspotModal, onOpenNaver: handleOpenNaverModal, existingEmails }),
    e(TistoryModal, { isOpen: isTistoryModalOpen, onClose: () => setIsTistoryModalOpen(false), onSave: handleSaveTistory, accountToEdit: selectedAccount }),
    e(WordpressModal, { isOpen: isWordpressModalOpen, onClose: () => setIsWordpressModalOpen(false), onSave: handleSaveWordpress, accountToEdit: selectedAccount }),
    e(BlogspotModal, { isOpen: isBlogspotModalOpen, onClose: () => setIsBlogspotModalOpen(false), onSave: handleSaveBlogspot, accountToEdit: selectedAccount }),
    e(NaverModal, { isOpen: isNaverModalOpen, onClose: () => setIsNaverModalOpen(false), onSave: handleSaveNaver, accountToEdit: selectedAccount }),
    e(BulkAddModal, { isOpen: isBulkAddModalOpen, onClose: () => setIsBulkAddModalOpen(false), onSave: handleSaveBulkAdd }),
    e(ProfileSyncModal, { isOpen: isProfileSyncModalOpen, onClose: () => setIsProfileSyncModalOpen(false), onApply: handleProfileSyncApply }),
    e(ConfirmModal, { ...confirmModal, onClose: () => setConfirmModal(p => ({ ...p, isOpen: false })), children: e('p', null, confirmModal.message) }),
    e(CommandModal, { ...commandModal, onClose: () => setCommandModal(p => ({ ...p, isOpen: false })) })
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(e(React.StrictMode, null, e(App)));
} else {
  console.error('Failed to find the root element');
}
