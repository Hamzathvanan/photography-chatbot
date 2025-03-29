import React, {useState} from "react";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    TextField,
    Typography
} from "@mui/material";
import axios from "axios";
import {CameraAlt, Person, Refresh, Send} from "@mui/icons-material";
import {useTheme} from "@mui/material/styles";
import {format} from 'date-fns';

const ChatPage = () => {
    const [textInput, setTextInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const theme = useTheme();

    const handleSubmit = async () => {
        if (!textInput.trim()) return;

        setLoading(true);
        setError("");

        try {
            // Add user message first
            setMessages(prev => [
                ...prev,
                {
                    text: textInput,
                    isBot: false,
                    timestamp: new Date()
                }
            ]);

            const res = await axios.post("http://localhost:5000/chatbot", {
                text: textInput,
            });

            // Add bot response
            setMessages(prev => [
                ...prev,
                {
                    text: res.data.suggestions,
                    isBot: true,
                    timestamp: new Date()
                }
            ]);

            setTextInput("");
        } catch (err) {
            setError("Error fetching suggestions. Please try again.");
            console.error(err);
        }
        setLoading(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <Box sx={{minHeight: "100vh", background: "linear-gradient(45deg, #1a1a1a 0%, #2a2a2a 100%)", py: 8}}>
            <Container>
                <Box display="flex" flexDirection="column" alignItems="center" sx={{mb: 8}}>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 700,
                            background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            mb: 2,
                        }}
                    >
                        Photography Expert Chat
                    </Typography>

                    {/* Chat History */}
                    <Card sx={{
                        width: '100%',
                        maxWidth: '800px',
                        background: "rgba(255, 255, 255, 0.05)",
                        borderRadius: 4,
                        mb: 4,
                        backdropFilter: "blur(12px)",
                        height: '60vh',
                        overflowY: 'auto',
                        position: 'relative'
                    }}>
                        <List sx={{p: 2}}>
                            {messages.length === 0 ? (
                                <Box sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    p: 4
                                }}>
                                    <CameraAlt sx={{
                                        fontSize: 64,
                                        color: 'rgba(255,255,255,0.1)',
                                        mb: 2
                                    }}/>
                                    <Typography variant="h6" sx={{
                                        color: 'rgba(255,255,255,0.3)',
                                        fontWeight: 500
                                    }}>
                                        Start by asking photography questions...
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                        color: 'rgba(255,255,255,0.2)',
                                        mt: 1
                                    }}>
                                        e.g., "Best camera settings for night photography?"
                                    </Typography>
                                </Box>
                            ) : (
                                messages.map((message, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem alignItems="flex-start">
                                            <ListItemAvatar>
                                                <Avatar sx={{
                                                    bgcolor: message.isBot ? theme.palette.primary.main : '#4ECDC4',
                                                    color: 'white'
                                                }}>
                                                    {message.isBot ? <CameraAlt/> : <Person/>}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="body1" sx={{
                                                        color: '#fff',
                                                        whiteSpace: 'pre-line',
                                                        backgroundColor: message.isBot ? 'rgba(78, 205, 196, 0.1)' : 'rgba(255, 107, 107, 0.1)',
                                                        p: 2,
                                                        borderRadius: 2
                                                    }}>
                                                        {message.text}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Typography variant="caption" sx={{
                                                        color: '#aaa',
                                                        mt: 0.5,
                                                        display: 'block'
                                                    }}>
                                                        {format(message.timestamp, 'HH:mm')}
                                                    </Typography>
                                                }
                                            />
                                        </ListItem>
                                        {index < messages.length - 1 && <Divider variant="inset" component="li"/>}
                                    </React.Fragment>
                                ))
                            )}
                        </List>
                    </Card>

                    {/* Input Area */}
                    <Box sx={{width: '100%', maxWidth: '800px'}}>
                        <Card sx={{
                            background: "rgba(255, 255, 255, 0.05)",
                            borderRadius: 4,
                            backdropFilter: "blur(12px)"
                        }}>
                            <CardContent>
                                <TextField
                                    multiline
                                    rows={3}
                                    variant="outlined"
                                    placeholder="Ask photography questions... (e.g., 'Best settings for portrait photography?')"
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    sx={{
                                        width: "100%",
                                        marginBottom: 2,
                                        '& .MuiInputBase-input': {
                                            color: '#fff !important',
                                        },
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {borderColor: 'rgba(255,255,255,0.2)'},
                                            '&:hover fieldset': {borderColor: theme.palette.primary.main}
                                        }
                                    }}
                                />

                                <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() => setMessages([])}
                                        sx={{
                                            color: 'white',
                                            borderColor: 'rgba(255,255,255,0.3)',
                                            "&:hover": {borderColor: theme.palette.secondary.main}
                                        }}
                                        startIcon={<Refresh/>}
                                    >
                                        Clear History
                                    </Button>

                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleSubmit}
                                        disabled={loading || !textInput.trim()}
                                        sx={{
                                            background: "linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 100%)",
                                            color: "white",
                                            "&:hover": {
                                                background: "linear-gradient(45deg, #4ECDC4 0%, #FF6B6B 100%)",
                                            },
                                        }}
                                        endIcon={<Send/>}
                                    >
                                        Ask Expert
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>

                    {/* Loading and Error States */}
                    {loading && (
                        <Box sx={{mt: 2, display: 'flex', alignItems: 'center', gap: 2}}>
                            <CircularProgress size={24} sx={{color: "white"}}/>
                            <Typography variant="body2" sx={{color: '#fff'}}>
                                Analyzing your question...
                            </Typography>
                        </Box>
                    )}

                    {error && (
                        <Typography color="error" sx={{mt: 2, color: '#ff5252'}}>
                            {error}
                        </Typography>
                    )}
                </Box>
            </Container>
        </Box>
    );
};

export default ChatPage;