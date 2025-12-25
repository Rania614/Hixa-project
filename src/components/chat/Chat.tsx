import { useState } from 'react';
import { Dashboard } from './Dashboard';
import { ProjectRoomView } from './ProjectRoomView';
import { ChatRoomView } from './ChatRoomView';
import { ProjectRoom, ChatRoom } from '@/services/messagesApi';

type View = 'dashboard' | 'project-room' | 'chat-room';

/**
 * Main Chat Component
 * 
 * Manages navigation between:
 * 1. Dashboard - List of all ProjectRooms
 * 2. ProjectRoomView - List of ChatRooms for a ProjectRoom
 * 3. ChatRoomView - Messages for a ChatRoom
 */
export const Chat = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedProjectRoom, setSelectedProjectRoom] = useState<ProjectRoom | null>(null);
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null);

  const handleSelectProjectRoom = (projectRoom: ProjectRoom) => {
    setSelectedProjectRoom(projectRoom);
    setCurrentView('project-room');
  };

  const handleSelectChatRoom = (chatRoom: ChatRoom) => {
    setSelectedChatRoom(chatRoom);
    setCurrentView('chat-room');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedProjectRoom(null);
    setSelectedChatRoom(null);
  };

  const handleBackToProjectRoom = () => {
    setCurrentView('project-room');
    setSelectedChatRoom(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {currentView === 'dashboard' && (
        <Dashboard onSelectProjectRoom={handleSelectProjectRoom} />
      )}

      {currentView === 'project-room' && selectedProjectRoom && (
        <ProjectRoomView
          projectRoom={selectedProjectRoom}
          onBack={handleBackToDashboard}
          onSelectChatRoom={handleSelectChatRoom}
        />
      )}

      {currentView === 'chat-room' && selectedChatRoom && (
        <div className="h-[calc(100vh-8rem)]">
          <ChatRoomView
            chatRoom={selectedChatRoom}
            onBack={handleBackToProjectRoom}
          />
        </div>
      )}
    </div>
  );
};

