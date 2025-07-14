import { useState } from "react";
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    Snackbar,
    List,
    ListItem,
    ListItemText,
    Divider,
    Box,
    Stack,
} from "@mui/material";

const Stats = () => {
    const [inputUrl, setInputUrl] = useState("");
    const [stats, setStats] = useState(null);
    const [error, setError] = useState("");
    const [open, setOpen] = useState(false);
    const serverUrl = import.meta.env.VITE_SERVER_URL

    const extractCode = (url) => {
        try {
            const urlObj = new URL(url);
            const pathSegments = urlObj.pathname.split("/").filter(segment => segment.length > 0);
            return pathSegments[pathSegments.length - 1];
        } catch {
            return null;
        }
    };

    const handleFetchStats = async () => {
        const code = extractCode(inputUrl);
        if (!code) {
            setError("Please enter a valid short URL");
            return;
        }

        try {
            const res = await fetch(`${serverUrl}shorturls/${code}`);
            const data = await res.json();

            if (data.success) {
                setStats(data.stats);
                setOpen(true);
                await log("frontend", "info", "api", `Fetched stats for shortcode ${code}`);
            } else {
                setError(data.error || "Could not fetch stats");
                await log("frontend", "warn", "api", `Stats fetch failed: ${data.error}`);
            }
        } catch (err) {
            setError("Server error while fetching stats.");
            await log("frontend", "error", "api", "Stats fetch request failed");
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    📊 URL Stats
                </Typography>

                <Stack spacing={2}>
                    <TextField
                        label="Enter your short URL"
                        fullWidth
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                    />

                    <Button variant="contained" size="large" onClick={handleFetchStats}>
                        Fetch Stats
                    </Button>
                </Stack>

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError("")}>
                        {error}
                    </Alert>
                )}

                {stats && (
                    <Box mt={4}>
                        <Typography variant="h6" gutterBottom>
                            🔗 Shortened URL:{" "}
                            <a href={stats.shortLink} target="_blank" rel="noreferrer">
                                {stats.shortLink}
                            </a>
                        </Typography>
                        <Typography variant="body1">📥 Original: {stats.originalUrl}</Typography>
                        <Typography variant="body1">📅 Created: {new Date(stats.createdAt).toLocaleString()}</Typography>
                        <Typography variant="body1">⏳ Expiry: {new Date(stats.expiry).toLocaleString()}</Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            🚀 Total Clicks: <strong>{stats.totalClicks}</strong>
                        </Typography>

                        <Divider sx={{ mb: 2 }} />

                        <Typography variant="h6">Click History:</Typography>
                        <List>
                            {stats.clickDetails.map((click, idx) => (
                                <div key={idx}>
                                    <ListItem>
                                        <ListItemText
                                            primary={`📍 ${click.geo.country}, ${click.geo.city} - ${click.referrer}`}
                                            secondary={`🕒 ${new Date(click.timestamp).toLocaleString()}`}
                                        />
                                    </ListItem>
                                    <Divider />
                                </div>
                            ))}
                        </List>
                    </Box>
                )}
            </Paper>

            <Snackbar
                open={open}
                autoHideDuration={5000}
                onClose={() => setOpen(false)}
            >
                <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: "100%" }}>
                    Stats successfully fetched!
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Stats;
