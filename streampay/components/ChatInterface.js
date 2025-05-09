'use client';

import { useState, useEffect, useRef } from 'react';
import { db, auth } from '@/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const ChatInterface = ({ projectId, otherPartyId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      console.log('Current user:', user);
      setCurrentUser(user);
    });

    return () => unsub();
  }, []);

  // Fetch project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) {
        console.log('No projectId provided to ChatInterface');
        return;
      }
      
      try {
        console.log('Fetching project details for ID:', projectId);
        const projectRef = collection(db, 'projects');
        const q = query(projectRef, where('projectId', '==', projectId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const projectData = querySnapshot.docs[0].data();
          console.log('Project details:', projectData);
          setProjectDetails(projectData);
        } else {
          console.error('No project found with ID:', projectId);
        }
      } catch (error) {
        console.error('Error fetching project details:', error);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  // Fetch messages
  useEffect(() => {
    if (!projectId) {
      console.log('No projectId available for message fetching');
      return;
    }

    console.log('Setting up message listener for project:', projectId);

    // First, let's check if the messages collection exists and has any messages
    const checkMessages = async () => {
      try {
        const messagesRef = collection(db, 'messages');
        const q = query(messagesRef, where('projectId', '==', projectId));
        const querySnapshot = await getDocs(q);
        console.log('Initial messages check - found:', querySnapshot.size, 'messages');
        querySnapshot.forEach(doc => {
          console.log('Message:', doc.id, doc.data());
        });
      } catch (error) {
        console.error('Error checking messages:', error);
      }
    };

    checkMessages();

    // Set up real-time listener
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('projectId', '==', projectId),
      orderBy('timestamp', 'asc')
    );

    console.log('Message query created with projectId:', projectId);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Snapshot received, size:', snapshot.size);
      const messageList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Processed messages:', messageList);
      setMessages(messageList);
    }, (error) => {
      console.error('Error in message listener:', error);
    });

    return () => {
      console.log('Cleaning up message listener');
      unsubscribe();
    };
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !projectDetails) {
      console.log('Cannot send message:', { 
        hasMessage: !!newMessage.trim(), 
        hasUser: !!currentUser, 
        hasProject: !!projectDetails,
        projectId: projectId
      });
      return;
    }

    try {
      console.log('Sending message for project:', projectId);
      const messageData = {
        text: newMessage,
        senderId: currentUser.uid,
        projectId: projectId,
        timestamp: serverTimestamp(),
        senderName: currentUser.dcName || currentUser.supplyProviderName || 'Anonymous',
        senderRole: currentUser.uid === projectDetails.dcId ? 'DC' : 'Supply Provider'
      };

      console.log('Message data:', messageData);
      const docRef = await addDoc(collection(db, 'messages'), messageData);
      console.log('Message sent with ID:', docRef.id);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!projectDetails) {
    return (
      <div className="flex flex-col h-[600px] bg-gray-800 rounded-xl shadow-lg border border-gray-700 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-300">Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-gray-800 rounded-xl shadow-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-gray-200">Project Chat</h2>
        <p className="text-sm text-gray-400 mt-1">
          {projectDetails.projectName}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-4">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.senderId === currentUser?.uid
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-200'
                }`}
              >
                <div className="text-xs text-gray-300 mb-1">
                  {message.senderName} ({message.senderRole})
                </div>
                <div>{message.text}</div>
                <div className="text-xs text-gray-300 mt-1">
                  {message.timestamp?.toDate().toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
        <div className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface; 