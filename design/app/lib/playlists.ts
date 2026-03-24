import { Playlist } from "./videos";

const PLAYLISTS_KEY = 'pinpoint_playlists';

export const getPlaylists = (): Playlist[] => {
  const stored = localStorage.getItem(PLAYLISTS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

export const savePlaylists = (playlists: Playlist[]): void => {
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
};

export const createPlaylist = (playlist: Omit<Playlist, 'id' | 'createdAt'>): Playlist => {
  const playlists = getPlaylists();
  const newPlaylist: Playlist = {
    ...playlist,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  playlists.push(newPlaylist);
  savePlaylists(playlists);
  return newPlaylist;
};

export const updatePlaylist = (id: string, updates: Partial<Playlist>): void => {
  const playlists = getPlaylists();
  const index = playlists.findIndex(p => p.id === id);
  if (index !== -1) {
    playlists[index] = { ...playlists[index], ...updates };
    savePlaylists(playlists);
  }
};

export const deletePlaylist = (id: string): void => {
  const playlists = getPlaylists();
  const filtered = playlists.filter(p => p.id !== id);
  savePlaylists(filtered);
};

export const addVideoToPlaylist = (playlistId: string, videoId: string): void => {
  const playlists = getPlaylists();
  const playlist = playlists.find(p => p.id === playlistId);
  if (playlist && !playlist.videoIds.includes(videoId)) {
    playlist.videoIds.push(videoId);
    savePlaylists(playlists);
  }
};

export const removeVideoFromPlaylist = (playlistId: string, videoId: string): void => {
  const playlists = getPlaylists();
  const playlist = playlists.find(p => p.id === playlistId);
  if (playlist) {
    playlist.videoIds = playlist.videoIds.filter(id => id !== videoId);
    savePlaylists(playlists);
  }
};
