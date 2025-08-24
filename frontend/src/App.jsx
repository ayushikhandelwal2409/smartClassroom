import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, query, setLogLevel } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

// --- Helper Icons (as SVG components) ---
const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

// --- Main App Component ---
export default function App() {
    // --- State Management ---
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [storage, setStorage] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    
    const [showModal, setShowModal] = useState(false);
    const [foundItems, setFoundItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // --- Firebase Initialization ---
    useEffect(() => {
        try {
            const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            
            if (Object.keys(firebaseConfig).length > 0) {
                const app = initializeApp(firebaseConfig);
                const firestore = getFirestore(app);
                const authInstance = getAuth(app);
                const storageInstance = getStorage(app);
                setDb(firestore);
                setAuth(authInstance);
                setStorage(storageInstance);
                setLogLevel('debug');

                onAuthStateChanged(authInstance, async (user) => {
                    if (user) {
                        setUserId(user.uid);
                    } else {
                        await signInAnonymously(authInstance);
                    }
                    setIsAuthReady(true);
                });
            } else {
                console.error("Firebase config not found.");
                setIsAuthReady(true); 
            }
        } catch (error) {
            console.error("Error initializing Firebase:", error);
            setIsAuthReady(true); 
        }
    }, []);

    // --- Real-time Data Fetching from Firestore ---
    useEffect(() => {
        if (isAuthReady && db) {
            setIsLoading(true);
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const itemsCollectionRef = collection(db, `artifacts/${appId}/public/data/foundItems`);
            const q = query(itemsCollectionRef);

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const items = [];
                querySnapshot.forEach((doc) => {
                    items.push({ id: doc.id, ...doc.data() });
                });
                // Sort by timestamp, newest first
                items.sort((a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis());
                setFoundItems(items);
                setFilteredItems(items);
                setIsLoading(false);
            }, (error) => {
                console.error("Error fetching found items:", error);
                setIsLoading(false);
            });

            return () => unsubscribe();
        }
    }, [isAuthReady, db]);

    // --- Search/Filtering Logic ---
    useEffect(() => {
        if (searchTerm === '') {
            setFilteredItems(foundItems);
        } else {
            const lowercasedTerm = searchTerm.toLowerCase();
            const results = foundItems.filter(item =>
                item.title.toLowerCase().includes(lowercasedTerm) ||
                item.aiDescription.toLowerCase().includes(lowercasedTerm)
            );
            setFilteredItems(results);
        }
    }, [searchTerm, foundItems]);

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <Header onReport={() => setShowModal(true)} />
                <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

                {isLoading ? (
                    <div className="text-center py-10">
                        <div className="loader inline-block w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-2 text-gray-600">Loading items...</p>
                    </div>
                ) : (
                    <ItemsGrid items={filteredItems} />
                )}
            </div>
            {showModal && (
                <ReportItemModal 
                    onClose={() => setShowModal(false)} 
                    db={db}
                    storage={storage}
                    userId={userId}
                />
            )}
        </div>
    );
}

// --- Sub-components ---

const Header = ({ onReport }) => (
    <header className="bg-white rounded-xl shadow-md p-6 mb-6 flex justify-between items-center">
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Intelligent Lost & Found</h1>
            <p className="text-gray-500 mt-1">Report found items and search for your lost belongings.</p>
        </div>
        <button
            onClick={onReport}
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-sm flex items-center"
        >
            <span className="hidden sm:inline">Report Found Item</span>
            <span className="sm:hidden">+ Report</span>
        </button>
    </header>
);

const SearchBar = ({ searchTerm, setSearchTerm }) => (
    <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon />
        </div>
        <input
            type="text"
            placeholder="Search for a lost item (e.g., 'blue water bottle with sticker')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
        />
    </div>
);

const ItemsGrid = ({ items }) => {
    if (items.length === 0) {
        return <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-700">No Items Found</h3>
            <p className="text-gray-500 mt-2">Try a different search term or check back later.</p>
        </div>
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                    <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-48 object-cover" 
                        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/e2e8f0/4a5568?text=Image+Error'; }} 
                    />
                    <div className="p-4">
                        <h3 className="font-bold text-lg text-gray-800 truncate">{item.title}</h3>
                        <p className="text-sm text-gray-600 mt-2 h-20 overflow-y-auto">
                            <strong>AI Description:</strong> {item.aiDescription}
                        </p>
                        <p className="text-xs text-gray-400 mt-3">
                            Reported by: ...{item.reportedBy?.slice(-6)}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const ReportItemModal = ({ onClose, db, storage, userId }) => {
    const [title, setTitle] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imageBase64, setImageBase64] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageBase64(reader.result.split(',')[1]);
            };
            reader.readAsDataURL(file);
        }
    };

    const callGeminiForDescription = async (base64Data) => {
        const apiKey = ""; // Add your API key here
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        
        const payload = {
            contents: [{
                role: "user",
                parts: [
                    { text: "Describe this object in detail for a lost and found system. Be specific about colors, materials, any text, or unique markings. This description will be used for searching." },
                    { inlineData: { mimeType: "image/jpeg", data: base64Data } }
                ]
            }]
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        
        const result = await response.json();
        if (result.candidates && result.candidates.length > 0) {
            return result.candidates[0].content.parts[0].text;
        }
        throw new Error("Could not generate description from image.");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !imageFile) {
            setError('Please provide a title and an image.');
            return;
        }
        setIsSubmitting(true);
        setError('');

        try {
            // 1. Get AI Description from Gemini
            const aiDescription = await callGeminiForDescription(imageBase64);

            // 2. Upload image to Firebase Storage
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const storageRef = ref(storage, `foundItems/${appId}/${Date.now()}-${imageFile.name}`);
            await uploadString(storageRef, `data:image/jpeg;base64,${imageBase64}`, 'data_url');
            const imageUrl = await getDownloadURL(storageRef);

            // 3. Save item data to Firestore
            const itemsCollectionRef = collection(db, `artifacts/${appId}/public/data/foundItems`);
            await addDoc(itemsCollectionRef, {
                title,
                imageUrl,
                aiDescription,
                reportedBy: userId,
                timestamp: new Date(),
            });

            onClose(); // Close modal on success
        } catch (err) {
            console.error("Submission failed:", err);
            setError(`Submission failed: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-800">Report a Found Item</h2>
                        <p className="text-sm text-gray-500 mt-1">Upload a picture and our AI will do the rest!</p>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Item Title</label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="e.g., Black Jansport Backpack"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Item Image</label>
                            <div
                                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer"
                                onClick={() => fileInputRef.current.click()}
                            >
                                <div className="space-y-1 text-center">
                                    {imageBase64 ? (
                                        <img src={`data:image/jpeg;base64,${imageBase64}`} alt="Preview" className="mx-auto h-24 w-auto rounded-md" />
                                    ) : (
                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                    <div className="flex text-sm text-gray-600">
                                        <p className="pl-1">{imageFile ? imageFile.name : 'Click to upload a file'}</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                className="hidden"
                                accept="image/png, image/jpeg"
                                required
                            />
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-blue-300"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Item'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
