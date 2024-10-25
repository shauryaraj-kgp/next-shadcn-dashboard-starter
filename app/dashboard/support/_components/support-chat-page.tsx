'use client';

import { BellRing, Send } from 'lucide-react';
import { FileUploader } from './file-uploader-chat';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ImageModal } from './image-modal';
import chatData from './chats.json';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Message {
  text?: string;
  time: string;
  isUser?: boolean;
  fileUrl?: string;
}

interface Chat {
  id: number;
  title: string;
  email: string;
  messages: Message[];
}

const chats: Chat[] = chatData;

interface SupportChatPageProps {
  className?: string;
}

export function SupportChatPage({ className }: SupportChatPageProps) {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{
    [key: number]: Message[];
  }>({});
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    const initialChatMessages = chats.reduce(
      (acc, chat) => {
        acc[chat.id] = chat.messages;
        return acc;
      },
      {} as { [key: number]: Message[] }
    );
    setChatMessages(initialChatMessages);
  }, []);

  const openImageModal = (imageUrl: string) => {
    setModalImageUrl(imageUrl);
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setModalImageUrl(null);
  };

  const sendMessage = (fileUrl?: string) => {
    if (newMessage.trim() || fileUrl) {
      const message: Message = {
        text: newMessage.trim(),
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        isUser: true,
        fileUrl
      };

      // Update the chatMessages state for the selected chat
      setChatMessages((prev) => ({
        ...prev,
        [selectedChat!.id]: [...(prev[selectedChat!.id] || []), message]
      }));

      setNewMessage('');
      setFiles([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        setNewMessage((prev) => prev + '\n');
      } else {
        e.preventDefault();
        sendMessage();
      }
    }
  };

  return (
    <div className={cn('m-[20px] flex h-[calc(100vh-110px)]', className)}>
      {/* Left Sidebar: Chat Feed */}
      <Card className="mr-[20px] w-[300px]">
        <CardHeader>
          <CardTitle>Support</CardTitle>
          <CardDescription>Select a chat to view</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                'flex cursor-pointer items-center space-x-4 rounded-md border p-4 transition-colors',
                selectedChat?.id === chat.id
                  ? 'bg-hover-gray'
                  : 'hover:bg-hover-gray'
              )}
              onClick={() => setSelectedChat(chat)}
            >
              <BellRing />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{chat.title}</p>
                <p className="text-sm text-muted-foreground">{chat.email}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Right Panel: Chat Window */}
      <Card className="flex flex-1 flex-col justify-between">
        <div>
          <CardHeader className="flex flex-row justify-between">
            <div className="flex flex-row">
              {selectedChat ? (
                <Avatar className="mr-3">
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="@shadcn"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              ) : (
                <p></p>
              )}
              <div>
                <CardTitle className="mb-0.5 pt-1">
                  {selectedChat ? `${selectedChat.title}` : 'Chat History'}
                </CardTitle>
                <CardDescription>
                  {selectedChat
                    ? `${selectedChat.email}`
                    : 'Select a Chat to start'}
                </CardDescription>
              </div>
            </div>
            {selectedChat ? (
              <div className="flex justify-center">
                <Button variant="outline" className="ml-2 mr-2">
                  Solved
                </Button>
                <Button className="ml-2 mr-2 text-white">Report</Button>
              </div>
            ) : (
              <p></p>
            )}
          </CardHeader>
          <CardContent
            ref={chatContainerRef}
            className="flex h-[calc(100vh-280px)] flex-col space-y-4 overflow-y-auto"
          >
            {selectedChat ? (
              chatMessages[selectedChat.id]?.map(
                (message: Message, index: number) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-center space-x-2',
                      message.isUser ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-xs rounded-lg p-2 text-sm',
                        message.isUser
                          ? 'bg-white text-black'
                          : 'bg-hover-gray text-white'
                      )}
                    >
                      {message.text && <p>{message.text}</p>}
                      {message.fileUrl && (
                        <img
                          src={message.fileUrl}
                          alt="Uploaded"
                          className="mt-1 h-auto max-w-[200px] cursor-pointer rounded-lg"
                          onClick={() => openImageModal(message.fileUrl ?? '')}
                        />
                      )}

                      <span
                        className={cn(
                          'mt-1 block text-xs text-gray-500',
                          message.isUser ? 'text-right' : 'text:left'
                        )}
                      >
                        {message.time}
                      </span>
                    </div>
                  </div>
                )
              )
            ) : (
              <p>Select a chat to view the conversation...</p>
            )}
          </CardContent>
        </div>

        {/* Fixed Footer for Input */}
        {selectedChat && (
          <CardFooter className="m-2 flex items-center space-x-2 p-2">
            <FileUploader
              value={files}
              onValueChange={setFiles}
              onUpload={async (uploadedFiles) => {
                const uploadedFileUrls = uploadedFiles.map((file) =>
                  URL.createObjectURL(file)
                );
                sendMessage(uploadedFileUrls[0]);
              }}
              multiple={true}
            />
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="h-full flex-grow rounded-full border p-2 pl-4"
            />
            <Button
              className="h-full rounded-full bg-hover-gray p-3"
              onClick={() => sendMessage()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </CardFooter>
        )}
      </Card>

      {isModalOpen && (
        <ImageModal
          isOpen={isModalOpen}
          imageUrl={modalImageUrl || ''}
          onClose={closeImageModal}
        />
      )}
    </div>
  );
}
