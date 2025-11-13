import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Paper, Typography, TextField, Button, 
  IconButton, Divider, CircularProgress, Badge,
  List, ListItem, ListItemText, ListItemAvatar,
  Avatar, Tooltip, Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';
import { useAuth } from '../context/AuthContext';
import { 
  sendMessage, 
  getMessages, 
  markMessagesAsRead, 
  setupMessageListener 
} from '../services/chatService';
import { formatDistanceToNow } from 'date-fns';

const Chat = ({ orderId }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const fetchedMessages = await getMessages(orderId);
        setMessages(fetchedMessages);
        setLoading(false);
        
        // Mark messages as read
        if (currentUser) {
          await markMessagesAsRead(orderId, currentUser.uid);
        }
      } catch (err) {
        console.error('Error loading messages:', err);
        setError('Failed to load messages');
        setLoading(false);
      }
    };
    
    if (orderId && currentUser) {
      loadMessages();
    }
  }, [orderId, currentUser]);
  
  // Set up message listener
  useEffect(() => {
    let unsubscribe = null;
    
    if (orderId && currentUser) {
      unsubscribe = setupMessageListener(orderId, (updatedMessages) => {
        setMessages(updatedMessages);
        
        // Mark new messages as read
        markMessagesAsRead(orderId, currentUser.uid).catch(err => {
          console.error('Error marking messages as read:', err);
        });
      });
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [orderId, currentUser]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !file) || !currentUser || !orderId) {
      return;
    }
    
    try {
      setSending(true);
      setError('');
      
      await sendMessage(
        orderId,
        currentUser.uid,
        newMessage.trim(),
        file,
        {
          senderRole: isAdmin ? 'admin' : 'applicant',
          senderName: currentUser?.displayName || currentUser?.email || 'User'
        }
      );
      
      setNewMessage('');
      setFile(null);
      setSending(false);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      setSending(false);
    }
  };
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit');
        return;
      }
      
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Only PDF, Word documents, and images are allowed');
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };
  
  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };
  
  const getFileIcon = (fileType) => {
    if (fileType && fileType.startsWith('image/')) {
      return <InsertDriveFileIcon color="primary" />;
    }
    return <InsertDriveFileIcon />;
  };
  
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = typeof timestamp === 'string' 
        ? new Date(timestamp) 
        : timestamp.toDate();
      
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '';
    }
  };
  
  const isAdmin = currentUser && currentUser.role === 'admin';
  
  return (
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6">
          {isAdmin ? 'Client Support Chat' : 'Support Chat'}
        </Typography>
      </Box>
      
      <Divider />
      
      {error && (
        <Alert severity="error" sx={{ m: 1 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto', 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        minHeight: '300px',
        maxHeight: '500px'
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography color="text.secondary">
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%', p: 0 }}>
            {messages.map((message) => {
              const isCurrentUser = message.userId === currentUser?.uid;
              
              return (
                <ListItem
                  key={message.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
                    p: 1
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      maxWidth: '80%',
                      bgcolor: isCurrentUser ? 'primary.light' : 'grey.100',
                      color: isCurrentUser ? 'white' : 'inherit',
                      borderRadius: 2,
                      p: 1.5
                    }}
                  >
                    {message.content && (
                      <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                        {message.content}
                      </Typography>
                    )}
                    
                    {message.fileUrl && (
                      <Box sx={{ mt: message.content ? 1 : 0, display: 'flex', alignItems: 'center' }}>
                        {getFileIcon(message.fileType)}
                        <Typography variant="body2" sx={{ ml: 1, flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {message.fileName}
                        </Typography>
                        <Tooltip title="Download">
                          <IconButton 
                            size="small" 
                            component="a" 
                            href={message.fileUrl} 
                            target="_blank" 
                            download
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                    
                    <Typography variant="caption" sx={{ 
                      alignSelf: isCurrentUser ? 'flex-start' : 'flex-end',
                      opacity: 0.7,
                      mt: 0.5
                    }}>
                      {formatTimestamp(message.timestamp)}
                    </Typography>
                  </Box>
                </ListItem>
              );
            })}
            <div ref={messagesEndRef} />
          </List>
        )}
      </Box>
      
      <Divider />
      
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <form onSubmit={handleSendMessage}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Type a message..."
              variant="outlined"
              size="small"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sending}
              sx={{ mr: 1 }}
            />
            
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            
            <Tooltip title="Attach File">
              <IconButton 
                color={file ? 'primary' : 'default'} 
                onClick={handleFileButtonClick}
                disabled={sending}
              >
                <Badge color="secondary" variant="dot" invisible={!file}>
                  <AttachFileIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Button
              variant="contained"
              color="primary"
              endIcon={<SendIcon />}
              disabled={(!newMessage.trim() && !file) || sending}
              type="submit"
              sx={{ ml: 1 }}
            >
              {sending ? <CircularProgress size={24} /> : 'Send'}
            </Button>
          </Box>
          
          {file && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mt: 1,
              p: 1,
              borderRadius: 1,
              bgcolor: 'action.hover'
            }}>
              <InsertDriveFileIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {file.name}
              </Typography>
              <IconButton size="small" onClick={() => setFile(null)}>
                <Typography variant="caption" color="error">
                  Remove
                </Typography>
              </IconButton>
            </Box>
          )}
        </form>
      </Box>
    </Paper>
  );
};

export default Chat;