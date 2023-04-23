import { Playlist } from "../models/playlist.js";
import { User } from "../models/user.js";
import { Track } from "../models/track.js";


export default {
    createPlaylist: async (req, res) => {
        try {
          const { name } = req.body;
    
          const playlist = new Playlist({
            name,
            createdBy: req.user.id,
          });
    
          await playlist.save();
    
          const user = await User.findById(req.user.id);
          user.savedPlaylists.push(playlist._id);
          await user.save();
    
          res.status(201).json({ playlist });
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: 'Failed to create playlist' });
        }
      },

      addTrackToPlaylist : async (req, res) => {
        const { playlistName, trackId } = req.body;
        const userId = req.user.id;

        try {
          // Find the user
          const user = await User.findById(userId);

          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
      
          // Check if the playlist already exists
          let playlist = await Playlist.findOne({ name: playlistName });
      
          // If the playlist does not exist, create a new one
          if (!playlist) {
            playlist = new Playlist({ name: playlistName, createdBy: user });
            await playlist.save();
            user.savedPlaylists.push(playlist);
            await user.save();
          }
      
          // Find the track to add to the playlist
          const track = await Track.findById(trackId);
      
          // Add the track to the playlist
          playlist.tracks.push(track);
          await playlist.save();
      
          res.status(200).json({ message: 'Track added to playlist successfully' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Error adding track to playlist' });
        }
      },
}