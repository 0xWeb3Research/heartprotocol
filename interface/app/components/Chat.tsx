'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

function Chat() {
    const router = useRouter();
    const { myAddress, otherUserAddress } = router.query || {};

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        if (!myAddress || !otherUserAddress) {
            // Redirect or show an error if addresses are missing
            // router.push('/app/connections');
        }
    }, [myAddress, otherUserAddress]);

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            const message = {
                sender: myAddress,
                receiver: otherUserAddress,
                content: newMessage,
                timestamp: new Date().toISOString(),
            };
            setMessages([...messages, message]);
            setNewMessage('');
        }
    };

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