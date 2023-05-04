import express from "express";
import userController from "../controllers/userController.js";
import playlistController from "../controllers/playlistController.js";
import trackController from "../controllers/trackController.js";
import { multipleMulter, singleMulter } from "../middlewares/multer-config.js";

const router = express.Router();

router.post("/login", userController.Login);
router.post("/register", userController.Register);
router.post('/createPlaylist', userController.getCurrentUser, playlistController.createPlaylist);
router.post('/addTrackToPlaylist/:trackId', userController.getCurrentUser, playlistController.addTrackToPlaylist);
router.post('/removeTrackFromPlaylist/:trackId', userController.getCurrentUser, playlistController.removeTrackFromPlaylist);
router.post('/addTrack', singleMulter, userController.getCurrentUser, trackController.addTrack);
router.post('/uploadTrack', singleMulter, trackController.uploadTrack);
router.get('/fetchTracks', trackController.fetchTracks);
router.post('/likeTrack/:trackId', userController.getCurrentUser, trackController.likeTrack);
router.get('/getCurrentUserReleases', userController.getCurrentUser, trackController.fetchCurrentUserReleases);
router.get('/getTrack/:trackId', trackController.getTrack);
router.get('/getPlaylists', userController.getCurrentUser, playlistController.getCurrentUserPlaylists);
router.get('/getPlaylist/:playlistId', playlistController.getPlaylistById);
router.post('/commentPlaylist/:playlistId', userController.getCurrentUser, playlistController.commentPlaylist);
router.post('/mergeTracks', multipleMulter, userController.getCurrentUser, trackController.mergeTracks);
router.get('/fetchLikedTracks', userController.getCurrentUser, trackController.fetchLikedTracks);
export default router;
