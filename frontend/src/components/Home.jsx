import { useState } from 'react';
import { Container, Typography, TextField, Button, Paper, InputAdornment, Snackbar, Alert, Stack } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Home = () => {
    const [url, setUrl] = useState('');
    const [customCode, setCustomCode] = useState('');
    const [validity, setValidity] = useState('');
    const [shortUrl, setShortUrl] = useState('');
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const serverUrl = import.meta.env.VITE_SERVER_URL
    const handleShorten = async () => {
        if (!url) {
            setError('Original URL is required');
            return;
        }
        try {
            const response = await fetch(`${serverUrl}shorturls`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url,
                    code: customCode || undefined,
                    validity: validity ? parseInt(validity) : undefined,
                }),
            });
            const data = await response.json();
            if (data.success) {
                setShortUrl(data.shortUrl);
                setOpen(true);
            } else {
                setError(data.error);
            }
        } catch (err) {
            console.log("error ", err)
            setError('Network error. Please try again later.');
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h4" gutterBottom align="center">
                    🔗 URL Shortener
                </Typography>

                <Stack spacing={2} mt={3}>
                    <TextField
                        label="Enter Original URL"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LinkIcon />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        label="Custom Shortcode (optional)"
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label="Validity (in minutes, optional)"
                        type="number"
                        value={validity}
                        onChange={(e) => setValidity(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <AccessTimeIcon />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleShorten}
                        sx={{ mt: 2 }}
                    >
                        Shorten URL
                    </Button>

                    {shortUrl && (
                        <Paper
                            elevation={2}
                            sx={{
                                p: 2,
                                mt: 2,
                                textAlign: 'center',
                                backgroundColor: '#f5f5f5',
                            }}
                        >
                            <Typography variant="subtitle1">Shortened URL:</Typography>
                            <Typography
                                variant="h6"
                                sx={{ wordBreak: 'break-all', color: 'primary.main' }}
                            >
                                <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                                    {shortUrl}
                                </a>
                            </Typography>
                        </Paper>
                    )}

                    {error && (
                        <Alert severity="error" onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}
                </Stack>
            </Paper>

            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={() => setOpen(false)}
            >
                <Alert
                    onClose={() => setOpen(false)}
                    severity="success"
                    sx={{ width: '100%' }}
                >
                    URL successfully shortened!
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Home;
