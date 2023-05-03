import { Track } from "../models/track.js";
import { User } from "../models/user.js";
import { validationResult } from 'express-validator';
import ID3 from 'node-id3';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { spawn } from 'child_process';

export default {
    addTrack: async (req, res) => {
        const errors = validationResult(req);
        //const userId = req.user.id;
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { artist, name, image, album, genre, mp3 } = req.body;

        try {
            //const user = await User.findById(userId);
            const newTrack = new Track({
                artist: artist,
                name: name,
                Image: image,
                album: album,
                genre: genre,
                mp3: mp3,
            });

            await newTrack.save();

            //user.releases.push(newTrack);
            //user.save();

            res.status(201).send({ message: 'Track created successfully', track: newTrack });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error creating track', error: error });
        }
    },

    uploadTrack: async (req, res) => {
        const errors = validationResult(req);
        //const userId = req.user.id;
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const fileBuffer = fs.readFileSync(req.file.path);
            const fileBuffers = Buffer.from(fileBuffer, 'base64');
            // Parse the ID3 tags

            const tags = ID3.read(fileBuffers);
            const imageName = uuid();
            if (tags['image']) {
                const imagePath = `public/images/${imageName}.png`;
                fs.writeFile(imagePath, tags['image']['imageBuffer'], (err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    console.log('Image saved successfully');
                });
            }

            res.status(201).send({
                message: 'Track uploaded successfully',
                data: {
                    artist: tags['artist'] || 'Unknown',
                    name: tags['title'] || 'Unknown',
                    length: tags['length'] || 'Unknown',
                    Image: `${req.protocol}://${req.get("host")}${process.env.IMGURL}/${imageName}.png` || 'Unknown',
                    album: tags['album'] || 'Unknown',
                    genre: tags['genre'] || 'Unknown',
                    mp3: `${req.protocol}://${req.get("host")}${process.env.MP3URL}/${req.file.filename}`,
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error uploading track', error: error });
        }

    },

    fetchTracks: async (req, res) => {
        try {
            const tracks = await Track.find();
            res.status(200).send({
                data: tracks,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error fetching tracks' });
        }
    },

    getCurrentUserTracks: async (req, res) => {
        try {
            const tracks = await Track.find({ user: req.user.id });
            res.status(200).send({
                data: tracks,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error fetching tracks' });
        }
    },

    getTrack: async (req, res) => {
        const { trackId } = req.params;
        try {
            const track = await Track.findById(trackId);
            if (!track) {
                return res.status(404).send({ message: 'Track not found' });
            }
            res.status(200).send({
                data: track,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error fetching track' });
        }
    },

    likeTrack: async (req, res) => {
        const { trackId } = req.params;
        const userId = req.user.id;

        try {
            const user = await User.findById(userId);

            const track = await Track.findById(trackId);

            if (!track) {
                return res.status(404).send({ message: 'Track not found' });
            }

            const likedTrack = user.likedTracks.find((likedTrack) => likedTrack.equals(track._id));

            if (likedTrack) {
                user.likedTracks.pull(track);
                await user.save();
                res.status(200).send({ message: 'Track unliked successfully' });
            } else {
                user.likedTracks.push(track);
                await user.save();
                res.status(200).send({ message: 'Track liked successfully' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error liking/unliking track' });
        }
    },

    mergeTracks: async (req, res) => {
        const userId = req.user.id;

        try {
            const user = await User.findById(userId);
            const inputFile1 = req.files[0].path;
            const inputFile2 = req.files[1].path;
            const outputFileName = uuid() + '.mp3';
            const outputFile = `public/mp3/${outputFileName}`;

            const args = [
                '-i', inputFile1,
                '-i', inputFile2,
                '-filter_complex', 'amix=inputs=2:duration=longest',
                outputFile,
            ];

            const ffmpeg = spawn('ffmpeg', args);

            ffmpeg.on('exit', (code) => {
                const fileBuffer = fs.readFileSync(outputFile);
                const fileBuffers = Buffer.from(fileBuffer, 'base64');

                const tags = ID3.read(fileBuffers);

                console.log(`FFmpeg process exited with code ${code}`);
                res.status(200).send({
                    message: 'Tracks merged successfully',
                    data: {
                        artist: tags['artist'] || user.username || 'Unknown',
                        name: tags['title'] || 'Unknown',
                        length: tags['length'] || 'Unknown',
                        album: tags['album'] || 'Unknown',
                        genre: tags['genre'] || 'Unknown',
                        mp3: `${req.protocol}://${req.get("host")}${process.env.MP3URL}/${outputFileName}`,
                    }
                });
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error mergin tracks' });
        }
    },

}