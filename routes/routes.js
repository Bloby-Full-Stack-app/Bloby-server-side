import express from "express";
import userController from "../controllers/userController.js";
import playlistController from "../controllers/playlistController.js";
import trackController from "../controllers/trackController.js";
import multer from "../middlewares/multer-config.js";

const router = express.Router();

router.post("/login", userController.Login);
router.post("/register", userController.Register);
router.post('/createPlaylist', userController.getCurrentUser, playlistController.createPlaylist);
router.post('/addTrackToPlaylist/:trackId', userController.getCurrentUser, playlistController.addTrackToPlaylist);
router.post('/addTrack', multer, trackController.addTrack);
router.post('/uploadTrack', multer, trackController.uploadTrack);
router.get('/fetchTracks', trackController.fetchTracks);
router.post('/likeTrack/:trackId', userController.getCurrentUser, trackController.likeTrack);
router.get('/getTracks', userController.getCurrentUser, trackController.getCurrentUserTracks);
router.get('/getTrack/:trackId', trackController.getTrack);
router.get('/getPlaylists', userController.getCurrentUser, playlistController.getCurrentUserPlaylists);
router.get('/getPlaylist/:playlistId', playlistController.getPlaylistById);

export default router;
