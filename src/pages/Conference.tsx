
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEvents } from "@/contexts/EventContext";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Video, VideoOff, Mic, MicOff, Users, MessageCircle, Share2 } from "lucide-react";

const Conference = () => {
  const { id } = useParams();
  const { getEventById } = useEvents();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [participants, setParticipants] = useState<{id: string, name: string}[]>([]);
  const [messages, setMessages] = useState<{sender: string, content: string, timestamp: Date}[]>([]);
  const [messageInput, setMessageInput] = useState("");
  
  const event = getEventById(id || "");
  
  useEffect(() => {
    if (!event) {
      toast({
        title: "Event not found",
        description: "The event you're looking for doesn't exist.",
        variant: "destructive"
      });
      navigate("/events");
      return;
    }
    
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please login to join this conference.",
        variant: "destructive"
      });
      navigate(`/events/${id}`);
      return;
    }
    
    // In a real app, we would connect to a video/audio service here
    // For now, we'll simulate joining with mock data
    
    // Add current user to participants
    setParticipants(prev => [
      ...prev, 
      { id: currentUser.id, name: currentUser.name }
    ]);
    
    // Simulate other participants joining (for demo purposes)
    const mockParticipants = [
      { id: "mock1", name: "Jane Smith" },
      { id: "mock2", name: "John Doe" }
    ];
    
    const timer = setTimeout(() => {
      setParticipants(prev => [...prev, ...mockParticipants]);
      toast({
        title: "Participants joined",
        description: "Other participants have joined the conference."
      });
    }, 2000);
    
    return () => {
      clearTimeout(timer);
      // In a real app, we would disconnect from the video/audio service here
    };
  }, [currentUser, event, id, navigate, toast]);
  
  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    toast({
      title: isVideoEnabled ? "Video disabled" : "Video enabled",
    });
  };
  
  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    toast({
      title: isAudioEnabled ? "Microphone muted" : "Microphone unmuted",
    });
  };
  
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
  
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    const newMessage = {
      sender: currentUser?.name || "Anonymous",
      content: messageInput,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessageInput("");
  };
  
  const shareConference = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Conference link copied to clipboard"
    });
  };
  
  if (!event || !currentUser) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container py-4 max-w-7xl">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-1">{event.title}</h1>
          <p className="text-muted-foreground">Hosted by {event.organizer.name}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main conference area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Video grid */}
            <div className="bg-black rounded-lg aspect-video relative overflow-hidden">
              {/* Main video area */}
              <div className="absolute inset-0 flex items-center justify-center">
                {isVideoEnabled ? (
                  <div className="text-white">
                    <p className="text-center">Video feed active</p>
                    <p className="text-center text-sm text-muted-foreground">(Simulated for demo)</p>
                  </div>
                ) : (
                  <div className="text-white flex flex-col items-center">
                    <VideoOff size={48} />
                    <p>Video disabled</p>
                  </div>
                )}
              </div>
              
              {/* Participant thumbnails */}
              <div className="absolute right-2 top-2 flex flex-col space-y-2">
                {participants.slice(1, 4).map(participant => (
                  <div key={participant.id} className="w-32 h-24 bg-gray-800 rounded overflow-hidden">
                    <div className="flex items-center justify-center h-full text-white text-xs">
                      {participant.name}
                    </div>
                  </div>
                ))}
                
                {participants.length > 4 && (
                  <div className="w-32 h-24 bg-gray-800 rounded overflow-hidden">
                    <div className="flex items-center justify-center h-full text-white text-xs">
                      +{participants.length - 4} more
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-center space-x-4">
              <Button 
                variant={isAudioEnabled ? "default" : "destructive"} 
                size="icon" 
                onClick={toggleAudio}
              >
                {isAudioEnabled ? <Mic /> : <MicOff />}
              </Button>
              
              <Button 
                variant={isVideoEnabled ? "default" : "destructive"} 
                size="icon" 
                onClick={toggleVideo}
              >
                {isVideoEnabled ? <Video /> : <VideoOff />}
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleChat}
              >
                <MessageCircle />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={shareConference}
              >
                <Share2 />
              </Button>
              
              <Button 
                variant="destructive" 
                onClick={() => navigate(`/events/${id}`)}
              >
                Leave Conference
              </Button>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Participants list */}
            <Card className="p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium flex items-center">
                  <Users className="mr-2 h-4 w-4" /> Participants ({participants.length})
                </h3>
              </div>
              <div className="space-y-2">
                {participants.map(participant => (
                  <div key={participant.id} className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      {participant.name.charAt(0)}
                    </div>
                    <span className="ml-2">{participant.name}</span>
                  </div>
                ))}
              </div>
            </Card>
            
            {/* Chat */}
            <Card className={`p-4 transition-all ${isChatOpen ? 'block' : 'hidden lg:block'}`}>
              <h3 className="font-medium mb-2">Chat</h3>
              
              <div className="h-80 overflow-y-auto mb-2 space-y-2">
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center">No messages yet</p>
                ) : (
                  messages.map((message, index) => (
                    <div key={index} className="bg-muted p-2 rounded-lg">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">{message.sender}</span>
                        <span className="text-muted-foreground">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  ))
                )}
              </div>
              
              <form onSubmit={sendMessage} className="flex">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 rounded-l-md border border-input bg-background px-3 py-2 text-sm"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
                <Button type="submit" className="rounded-l-none">Send</Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Conference;
