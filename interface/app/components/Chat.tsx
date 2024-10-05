import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { db } from '../../utils/firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy } from 'firebase/firestore';

function Chat() {
    const searchParams = useSearchParams();
    const myAddress = searchParams.get('myAddress');
    const otherUserAddress = searchParams.get('otherUserAddress');

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        if (!myAddress || !otherUserAddress) {
            // Redirect if addresses are missing
            // You need to import the useRouter hook at the top of your file to use this
            // import { useRouter } from 'next/navigation';
            // const router = useRouter();
            // router.push('/app/connections');
            return;
        }

        // Query to fetch messages involving the current user
        const q = query(
            collection(db, 'chats'),
            where('participants', 'array-contains', myAddress),
            orderBy('timestamp')
        );

        // Listen for real-time updates
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messagesData = snapshot.docs.map(doc => doc.data());
            console.log('Fetched messages:', messagesData); // Debug log
            setMessages(messagesData);
        });

        // Cleanup listener on component unmount
        return () => unsubscribe();
    }, [myAddress, otherUserAddress]);

    const handleSendMessage = async () => {
        if (newMessage.trim()) {
            const message = {
                sender: myAddress,
                receiver: otherUserAddress,
                content: newMessage,
                timestamp: new Date().toISOString(),
                participants: [myAddress, otherUserAddress]
            };

            try {
                await addDoc(collection(db, 'chats'), message);
                console.log('Message sent:', message); // Debug log
                setMessages(prevMessages => [...prevMessages, message]); // Update state immediately
                setNewMessage('');
            } catch (error) {
                console.error('Error sending message: ', error);
            }
        }
    };

    if (!myAddress || !otherUserAddress) {
        return <div>Loading...</div>;
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-6">
            <h1 className="text-xl font-bold mb-6">Chat between {myAddress} and {otherUserAddress}</h1>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="h-96 overflow-y-auto mb-4">
                    {messages.map((message, index) => (
                        <div key={index} className={`mb-2 p-2 rounded ${message.sender === myAddress ? 'bg-blue-100' : 'bg-gray-100'}`}>
                            <p className="text-sm text-gray-600">{message.sender === myAddress ? 'You' : 'Other User'}:</p>
                            <p className="text-md">{message.content}</p>
                            <p className="text-xs text-gray-400">{new Date(message.timestamp).toLocaleTimeString()}</p>
                        </div>
                    ))}
                </div>
                <div className="flex">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-grow p-2 border rounded-l-lg"
                        placeholder="Type your message..."
                    />
                    <button
                        onClick={handleSendMessage}
                        className="bg-blue-500 text-white p-2 rounded-r-lg"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Chat;