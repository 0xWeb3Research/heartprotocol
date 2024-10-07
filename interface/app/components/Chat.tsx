import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { db } from '../../utils/firebase';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, EntryFunctionArgument, Network } from "@aptos-labs/ts-sdk";
import { collection, addDoc, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Loading from './Loading';

const aptosConfig = new AptosConfig({ network: Network.TESTNET });
const client = new Aptos(aptosConfig);

const moduleAddress = process.env.NEXT_PUBLIC_MODULE_ADDRESS;
const moduleName = "core";

function Chat() {
    const { account } = useWallet();
    const searchParams = useSearchParams();
    const myAddress = searchParams.get('myAddress');
    const otherUserAddress = searchParams.get('otherUserAddress');
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [myProfile, setMyProfile] = useState(null);
    const [otherUserProfile, setOtherUserProfile] = useState(null);

    const getProfile = async (userAddress: string | any) => {
        try {
            const result = await client.view({
                payload: {
                    function: `${moduleAddress}::${moduleName}::get_profile`,
                    typeArguments: [],
                    functionArguments: [userAddress],
                },
            });

            console.log("getProfile result", result);
            return result;
        } catch (error) {
            console.error("Error fetching profile:", error);
            return null;
        }
    };

    const checkMatchInContract = async (x, y) => {
        const result = await client.view({
            payload: {
                function: `${moduleAddress}::${moduleName}::are_addresses_matched`,
                typeArguments: [],
                functionArguments: [x, y],
            },
        });

        return result; // Assuming result is a boolean indicating match status
    }

    useEffect(() => {

        if (!myAddress || !otherUserAddress) {
            router.push('/app/connections');
            return;
        }

        if (myAddress === otherUserAddress) {
            router.push('/app/connections');
            return;
        }

        if (account) {
            if (account.address !== myAddress) {
                router.push('/app/connections');
                return;
            }
        }

        checkMatchInContract(myAddress, otherUserAddress).then((result: any) => {
            const  isMatched = result as boolean;

            if (!isMatched) {
                router.push('/app/connections');
                return;
            }

            console.log("Match found");

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
        });
    }, [myAddress, otherUserAddress, account?.address]);

    useEffect(() => {
        const loadProfiles = async () => {
            if (myAddress) {
                const profile = await getProfile(myAddress);
                setMyProfile(profile);
            }
            if (otherUserAddress) {
                const profile = await getProfile(otherUserAddress);
                setOtherUserProfile(profile);
            }
        };

        loadProfiles();
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
        return <Loading />;
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-6">
            <h1 className="text-xl font-bold mb-6">
                You're chatting with {otherUserProfile ? otherUserProfile[0] : 'Loading...'}
            </h1>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="h-96 overflow-y-auto mb-4">
                    {messages.map((message, index) => (
                        <div key={index} className={`mb-2 p-2 rounded ${message.sender === myAddress ? 'bg-blue-100' : 'bg-gray-100'}`}>
                            <div className="flex items-center">
                                <img
                                    src={message.sender === myAddress ? myProfile?.[4] : otherUserProfile?.[4]}
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full mr-2 object-cover"
                                />
                                <div>
                                    <p className="text-sm text-gray-600">
                                        {message.sender === myAddress ? 'You' : otherUserProfile ? otherUserProfile[0] : 'Other User'}:
                                    </p>
                                    <p className="text-md">{message.content}</p>
                                    <p className="text-xs text-gray-400">{new Date(message.timestamp).toLocaleTimeString()}</p>
                                </div>
                            </div>
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