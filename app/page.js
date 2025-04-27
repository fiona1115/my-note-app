'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/services/firebase';
import { collection, addDoc, orderBy, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';

export default function Home() {
    // 定義筆記清單狀態
    const [notes, setNotes] = useState([]);
    // 定義載入狀態
    const [isLoading, setIsLoading] = useState(true);
    // 定義表單狀態
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        date: '',
        content: ''
    });
    // 定義用戶狀態
    const [user, setUser] = useState(null);
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        noteId: null,
        noteTitle: ''
    });

    // 監聽認證狀態
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    // 設置即時監聽筆記
    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        
        // 建立查詢 - 使用用戶特定的集合路徑
        const userNotesRef = collection(db, `user-list/${user.uid}/note-list`);
        const notesQuery = query(userNotesRef, orderBy('createdAt', 'desc'));
        
        // 設置監聽器
        const unsubscribe = onSnapshot(notesQuery, 
            (snapshot) => {
                // 處理資料更新
                const notesList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setNotes(notesList);
                setIsLoading(false);
            },
            (error) => {
                console.error('Error listening to notes:', error);
                alert('監聽筆記更新時發生錯誤');
                setIsLoading(false);
            }
        );

        // 清理函數：組件卸載時取消監聽
        return () => unsubscribe();
    }, [user]);

    // 處理表單輸入變化
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 處理表單提交
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('請先登入');
            return;
        }

        try {
            const newNote = {
                ...formData,
                createdAt: new Date().toISOString(),
                completed: false // 新增預設完成狀態
            };

            // 將筆記儲存到用戶特定的 Firestore 集合
            const userNotesRef = collection(db, `user-list/${user.uid}/note-list`);
            await addDoc(userNotesRef, newNote);
            
            // 重置表單
            setFormData({
                title: '',
                category: '',
                date: '',
                content: ''
            });

        } catch (error) {
            console.error('Error adding note:', error);
            alert('儲存筆記時發生錯誤，請稍後再試。');
        }
    };

    // 處理筆記完成狀態更新
    const handleNoteCompletion = async (noteId, currentStatus) => {
        if (!user) return;

        try {
            const noteRef = doc(db, `user-list/${user.uid}/note-list`, noteId);
            await updateDoc(noteRef, {
                completed: !currentStatus
            });
        } catch (error) {
            console.error('Error updating note completion:', error);
            alert('更新筆記狀態時發生錯誤');
        }
    };

    // 處理筆記刪除
    const handleDeleteNote = async () => {
        if (!user || !deleteModal.noteId) return;

        try {
            const noteRef = doc(db, `user-list/${user.uid}/note-list`, deleteModal.noteId);
            await deleteDoc(noteRef);
            setDeleteModal({ isOpen: false, noteId: null, noteTitle: '' });
        } catch (error) {
            console.error('Error deleting note:', error);
            alert('刪除筆記時發生錯誤');
        }
    };

    // 未登入時的歡迎頁面
    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="max-w-2xl text-center space-y-8">
                    <h1 className="text-4xl font-bold text-gray-900">
                        你的數位筆記本
                    </h1>
                    <p className="text-xl text-gray-600">
                        隨時隨地記錄你的想法、靈感和重要事項。<br />
                        簡單、安全、隨時可用。
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Link href="/sign-in">
                            <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300">
                                登入
                            </button>
                        </Link>
                        <Link href="/register">
                            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-300">
                                註冊
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // 已登入時的筆記頁面
    return (
        <div className="container mx-auto p-4 sm:p-6">
            {/* 刪除確認 Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">確認刪除</h3>
                        <p className="text-gray-600 mb-6">
                            確定要刪除筆記「{deleteModal.noteTitle}」嗎？此操作無法復原。
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setDeleteModal({ isOpen: false, noteId: null, noteTitle: '' })}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleDeleteNote}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                刪除
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* 第一張卡片 - 建立筆記表單 */}
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:col-span-1 row-span-2">
                    <h2 className="text-xl font-bold mb-4">建立新筆記</h2>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {/* 標題輸入 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                標題
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="請輸入標題"
                                required
                            />
                        </div>

                        {/* 分類選擇 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                分類
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            >
                                <option value="">請選擇分類</option>
                                <option value="important">重要</option>
                                <option value="urgent">緊急</option>
                                <option value="normal">普通</option>
                            </select>
                        </div>

                        {/* 日期選擇 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                日期
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>

                        {/* 詳細內容 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                詳細內容
                            </label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 h-32"
                                placeholder="請輸入詳細內容"
                                required
                            ></textarea>
                        </div>

                        {/* 送出按鈕 */}
                        <button
                            type="submit"
                            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition duration-300"
                        >
                            建立筆記
                        </button>
                    </form>
                </div>

                {/* 載入中狀態 */}
                {isLoading ? (
                    <div className="lg:col-span-3 flex justify-center items-center">
                        <div className="text-gray-500">載入筆記中...</div>
                    </div>
                ) : notes.length === 0 ? (
                    <div className="lg:col-span-3 flex justify-center items-center">
                        <div className="text-gray-500">目前還沒有筆記</div>
                    </div>
                ) : (
                    /* 筆記清單容器 */
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* 筆記清單 */}
                        {notes.map(note => (
                            <div key={note.id} className={`bg-white rounded-lg shadow-lg p-4 sm:p-6 h-[300px] flex flex-col border-2 ${
                                note.completed ? 'border-gray-300' : 'border-purple-300 hover:border-purple-600'
                            } transition-colors duration-300`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2 flex-1">
                                        <input
                                            type="checkbox"
                                            checked={note.completed || false}
                                            onChange={() => handleNoteCompletion(note.id, note.completed || false)}
                                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                        />
                                        <h3 className={`text-lg font-semibold truncate ${
                                            note.completed ? 'line-through text-gray-400' : ''
                                        }`}>
                                            {note.title}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded text-sm flex-shrink-0 ${
                                            note.category === 'important' ? 'bg-red-100 text-red-800' :
                                            note.category === 'urgent' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {note.category === 'important' ? '重要' :
                                             note.category === 'urgent' ? '緊急' : '普通'}
                                        </span>
                                        <button
                                            onClick={() => setDeleteModal({ isOpen: true, noteId: note.id, noteTitle: note.title })}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500 mb-2">
                                    {note.date}
                                </div>
                                <p className={`text-gray-600 flex-1 overflow-y-auto mb-2 ${
                                    note.completed ? 'text-gray-400' : ''
                                }`}>
                                    {note.content}
                                </p>
                                <div className="text-xs text-gray-400 mt-auto pt-2 border-t">
                                    建立於 {new Date(note.createdAt).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
