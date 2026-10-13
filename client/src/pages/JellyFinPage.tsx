import { useState, useEffect } from "react";
import { fetchJellyfinStatus, fetchContinueWatching, fetchRecentlyAdded } from "../services/apiJellyFin";
import type { JellyfinStats, JellyfinItem } from "../services/apiJellyFin";
import  { StatsBar }  from "../components/Jellyfin/stats";
import jellyfinLogo from "../assets/jellyfin.png";
import jellyseerrLogo from "../assets/jellyseerr.png";
import { PageHeader } from "../components/ui/Ui";
import moviePlaceholder from "../assets/movie-placeholder.png"

export default function JellyfinDashboard() {
    const [ stats, setStats ] = useState<JellyfinStats | null>(null)
    const [ continueWatching, setContinueWatching ] = useState<JellyfinItem[]>([])
    const [ recentlyAdded, setRecentlyAdded ] = useState<JellyfinItem[]>([])
    const [ loading, setLoading ] = useState(true)

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        async function loadDashboard() {
            try {
                const [ statsData, resumeData, recentData ] = await Promise.all([
                    fetchJellyfinStatus(controller.signal),
                    fetchContinueWatching(controller.signal),
                    fetchRecentlyAdded(controller.signal)
                ]);

                if (controller.signal.aborted) return;
                setStats(statsData);
                setContinueWatching(resumeData.Items || []);
                setRecentlyAdded(recentData.Items || []);
            } catch (err) {
                if (!controller.signal.aborted) {
                    setError(err instanceof Error ? err.message : "Failed to fetch Jellyfin data");
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }
        loadDashboard();
        return () => controller.abort();
    }, []);

    const calculateProgress = (position?: number, runtime?: number) => {
        if (!position || !runtime || runtime <= 0) return 0
        return Math.min(100, Math.max(0, Math.round((position / runtime) * 100)))
    }

    // Open Jellyfin in new tab
    const handleLaunchTheater = () => {
        window.open('http://dashboard.local', '_blank', 'noopener,noreferrer');
    }

    // Open Jellyser in new tab
    const handleLaunchRequester = () => {
        window.open('http://dashboard.local', '_blank', 'noopener,noreferrer')
    }


    return (
    
    <div className="jellyfin-dashboard">
        { /* Header and main lauch Buttons for serrr and fin  */ }
        <PageHeader
                eyebrow="Media library"
                title="Movie & TV Library"
                description="Enjoy your personal media library"
                actions={null}
              />
        <div className="jellyfin-launchers">
            <div className="launcher">
                <div className="launcher-logo">
                    <img src={jellyfinLogo} alt="" />
                </div>
                <div className="launcher-content">
                    <h3>Jellyfin Launcher</h3>
                    <p>Explore the current library of movies and TV shows</p>
                    <button
                    type="button"
                    className="button primary"
                    onClick={handleLaunchTheater}
                    >
                        Launch Jellyfin
                    </button>
                </div>
                
            </div>
            <div className="launcher">
                <div className="launcher-logo">
                    <img src={jellyseerrLogo} alt="" />
                </div>
                <div className="launcher-content">
                    <h3>Jellyseerr Launcher</h3>
                    <p>Discover and request new movies and TV shows</p>
                    <button
                    type="button"
                    className="button primary"
                    onClick={handleLaunchRequester}
                    >
                        Launch Jellyseerr
                    </button>
                </div>
                
            </div>
        </div>
        
        { /* This is thy jellyfin overview section */ }
        <div className="jellyfin-data-container">

            {loading && <p role="status">Loading Jellyfin library…</p>}
            {error && <p role="alert">{error}. Check that the HomeHub server is running.</p>}
            {!loading && !error && continueWatching.length === 0 && recentlyAdded.length === 0 && (
                <p>No media to show yet.</p>
            )}

            { /* Stats Section */ }
            {stats && (
                <div className="jellyfin-stats">
                    <StatsBar title="Movie Count" stat={stats.MovieCount || 0}  />
                    <StatsBar title="TV Series" stat={stats.SeriesCount || 0}  />
                    <StatsBar title="Total Episodes" stat={stats.EpisodeCount || 0}  />
                </div>
            )}

            { /* Continue Watching Section */ }
            {continueWatching.length > 0 && (
                <div className="jellyfin-continue-watching">
                    <h3 className="media-section-title">Continue Watching</h3>
                    <div className="continue-watching">
                        {continueWatching.map(item => {
                            const progress = calculateProgress(item.UserData?.PlaybackPositionTicks, item.RunTimeTicks);
                            return (
                                <div className="continue-watching-card" key={item.Id}>
                                    {/* Add this when jellyfin is live
                                    
                                    <img
                                        src={`/api/jellyfin-stream/Items/${item.Id}/Images/Primary`}
                                        alt={item.Name}
                                        onError={(event) => {
                                            const image = event.currentTarget;
                                            if (image.src !== moviePlaceholder) {
                                                image.src = moviePlaceholder;
                                            }
                                        }}
                                    />*/}

                                    <img
                                        src={moviePlaceholder}
                                        alt={item.Name}
                                    />
                                    { /* progress tracking bar */ }
                                    <div>
                                        <progress value={progress} max={100} aria-label={`${item.Name} playback progress`} />
                                    </div>
                                    <div>
                                        {item.Name}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            
            { /* Recently Added Section */ }
            {recentlyAdded.length > 0 && (
                <div>
                    <h3 className="media-section-title">Recently Added</h3>
                    <div className="recently-added-container">
                        {recentlyAdded.map(item => {
                            return (
                                <div className="recently-added-card" key={item.Id}>
                                    {/* Add this when jellyfin is live
                                    
                                    <img
                                        src={`/api/jellyfin-stream/Items/${item.Id}/Images/Primary`}
                                        alt={item.Name}
                                        onError={(event) => {
                                            const image = event.currentTarget;
                                            if (image.src !== moviePlaceholder) {
                                                image.src = moviePlaceholder;
                                            }
                                        }}
                                    />*/}
                                    <img
                                        src={moviePlaceholder}
                                        alt={item.Name}
                                    />

                                    <div>
                                        {item.Name}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    </div>

    )

}
