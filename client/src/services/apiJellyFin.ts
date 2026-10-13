const API_BASE = '/api/jellyfin';

export interface JellyfinStats {
    MovieCount: number;
    SeriesCount: number;
    EpisodeCount: number;
}

export interface JellyfinItem {
    Id: string;
    Name: string;
    RunTimeTicks?: number;
    UserData?: { PlaybackPositionTicks?: number };
}

interface JellyfinItemsResponse {
    Items: JellyfinItem[];
}

// <T> is a place holder for exepected result type
// Signal? is on optional way to cancel the request if we leave the page.
async function fetchJellyfin<T>(path: string, signal?: AbortSignal): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, { signal });
    if (!response.ok) {
        throw new Error(`Jellyfin request failed (${response.status})`);
    }
    return response.json();
}

export const fetchJellyfinStatus = (signal?: AbortSignal) =>
    fetchJellyfin<JellyfinStats>('/stats', signal);

export const fetchContinueWatching = (signal?: AbortSignal) =>
    fetchJellyfin<JellyfinItemsResponse>('/continue-watching', signal);

export const fetchRecentlyAdded = (signal?: AbortSignal) =>
    fetchJellyfin<JellyfinItemsResponse>('/recently-added', signal);
