import express from "express";
import axios from 'axios';

const router = express.Router()

const USE_MOCK = true;

// Create jellyfin client
const jellyFinClient = axios.create({
    baseURL: process.env.JELLYFIN_URL || 'http://localhost:8096',
    headers: {
        'Authorization': `MediaBrowser Token="${process.env.JELLYFIN_API_KEY}"`,
        'Content-Type': 'application/json',
    }
});

// Get server libray stats
router.get('/stats', async (req, res) => {
    if (USE_MOCK) {
        return res.json({
            MovieCount: 1420,
            SeriesCount: 84,
            EpisodeCount: 5210
        });
    }

    try {
        const response = await jellyFinClient.get('/Items/Counts');
        res.json(response.data)
    } catch (error) {
        res.status(500).json({error: 'Faled connecting to jellyfin core'})
    }
});

// Get media not finshed 
router.get('/continue-watching', async (req, res) => {
    if (USE_MOCK) {
        return res.json({
            Items: [
                {
                    Id: "Mock-1",
                    Name: "Terminator",
                    Type: "Movie",
                    RunTimeTicks: 8800000000,
                    UserData: {  PlaybackPositionTicks: 32000000000 }
                },
                {
                    Id: "Mock-2",
                    Name: "Jason Bourne",
                    Type: "Movie",
                    RunTimeTicks: 8800000000,
                    UserData: {  PlaybackPositionTicks: 52000000000 }
                }
            ]
        });
    }

    try {
        const response = await jellyFinClient.get('/Users/Admin/Items/Resume?Limit=12')
        res.json(response.data)
    } catch (error) {
        res.status(500).json({error: 'Faled connecting to jellyfin core'})
    }
});

// Get recenty added media
router.get('/recently-added', async (req, res) => {
    if (USE_MOCK) {
        return res.json({
            Items: [
                { Id: "recent-1", Name: "Oppenheimer", type: "Movie",  },
                { Id: "recent-2", Name: "Gilmore Girls - S01E09", type: "Episode",  },
                { Id: "recent-3", Name: "Spiderman", type: "Movie",  },
                { Id: "recent-4", Name: "Batman: The Dark Knite", type: "Movie",  },
            ]
        });
    }

    try {
        const response = await jellyFinClient.get('/Users/Admin/LatestMedia?Limit=12')
        res.json(response.data)
    } catch (error) {
        res.status(500).json({ error: 'Failed to connecting to jellyfin core' })
    }
});

export default router;

