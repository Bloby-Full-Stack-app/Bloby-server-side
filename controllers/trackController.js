import { Track } from "../models/track.js";
import { User } from "../models/user.js";
import { validationResult } from 'express-validator';
import ID3 from 'node-id3';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import ffmpeg from 'fluent-ffmpeg';

export default {
    addTrack: async (req, res) => {
        const errors = validationResult(req);
        const userId = req.user.id;
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { artist, name, image, album, genre, mp3, file } = req.body;

        try {
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const newTrack = new Track({
                artist: artist,
                name: name,
                Image: image,
                album: album,
                genre: genre,
                mp3: mp3,
                file: file
            });

            await newTrack.save();

            // if artist is the same as the username then add the track to the user's releases
            if (artist === user.username) {
                user.releases.push(newTrack);
                await user.save();
            }

            res.status(201).send({ message: 'Track created successfully', track: newTrack });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error creating track', error: error });
        }
    },

    uploadTrack: async (req, res) => {
        const errors = validationResult(req);
        const userId = req.user.id;
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const { path, filename } = req.file;
            const fileBuffer = fs.readFileSync(path);
            const fileBuffers = Buffer.from(fileBuffer, 'base64');

            // Check the file extension
            const isWebm = req.file.originalname.endsWith('.webm');
            const convertedFilename = isWebm ? `${filename}.mp3` : filename;

            if (isWebm) {
                // Convert the file from webm to mp3
                await new Promise((resolve, reject) => {
                    ffmpeg(path)
                        .toFormat('mp3')
                        .output(`${path}.mp3`)
                        .on('end', resolve)
                        .on('error', reject)
                        .run();
                });
            }

            // Read the converted or original file data
            const fileData = fs.readFileSync(isWebm ? `${path}.mp3` : path);

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
                });
            }

            res.status(201).send({
                message: 'Track uploaded successfully',
                data: {
                    file: req.file.path,
                    artist: tags['artist'] || user.username,
                    name: tags['title'] || 'Unknown',
                    length: tags['length'] || 'Unknown',
                    Image: tags['image'] ? `${req.protocol}://${req.get("host")}${process.env.IMGURL}/${imageName}.png` : 'http://localhost:3000/assets/img/covers/cover.svg',
                    album: tags['album'] || 'Unknown',
                    genre: tags['genre'] || 'Unknown',
                    mp3: `${req.protocol}://${req.get("host")}${process.env.MP3URL}/${convertedFilename}`,
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

    fetchCurrentUserReleases: async (req, res) => {
        const userId = req.user.id;
        try {


            const user = await User.findById(userId).populate('releases');
            if (!user) {
                return res.status(404).send({ message: 'User not found' });
            }
            res.status(200).send({
                data: user.releases,
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
        let isLiked = false;

        try {
            const user = await User.findById(userId);

            const track = await Track.findById(trackId);

            if (!track) {
                return res.status(404).send({ message: 'Track not found' });
            }

            const likedTrack = user.likedTracks.find((likedTrack) => likedTrack.equals(track._id));

            if (likedTrack) {
                user.likedTracks.pull(track);
                // set a bool variable called isLiked to false
                isLiked = false;
                await user.save();
                res.status(200).send({
                    isLiked: isLiked,
                    message: 'Track unliked successfully'
                });
            } else {
                user.likedTracks.push(track);
                isLiked = true;
                await user.save();
                res.status(200).send({
                    isLiked: isLiked,
                    message: 'Track liked successfully'
                });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error liking/unliking track' });
        }
    },

    fetchLikedTracks: async (req, res) => {
        const userId = req.user.id;

        try {
            const user = await User.findById(userId).populate('likedTracks');
            res.status(200).send({
                data: user.likedTracks,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error fetching liked tracks' });
        }
    },

    mergeTracks: async (req, res) => {
        const userId = req.user.id;

        try {
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).send({ message: 'User not found' });
            }

            

            //if (req.files.length > 1) {
                //inputFile1 = req.files[0].path;
                //inputFile2 = req.files[1].path;
            //}

            //console.log(req.files);

            const outputFileName = uuid() + '.mp3';
            const outputFile = `public/mp3/${outputFileName}`;

            const inputFile1 = req.body.firstfile;
            const inputFile2 = req.body.secondfile;
            const fadeinDuration = req.body.fadeinDuration || 0;
            const pitchDuration = req.body.pitch || 1;
            const speedAmount = req.body.speed || 1;
            const volumeAmount = req.body.volume || 0.5;

            console.log(req.body)

            const filters = [
                // Merge audio inputs
                {
                    filter: 'amix',
                    options: { inputs: 2, duration: 'longest' },
                    outputs: 'amix_output',
                },
            ];

            // Add fade-in filter if duration is non-zero

            filters.push({
                filter: 'afade',
                options: {
                    type: 'in',
                    start_time: 0,
                    duration: fadeinDuration[0],
                },
                inputs: 'amix_output',
                outputs: 'fade_output'

            });
            filters.push(
                {
                    filter: 'atempo',
                    options: { tempo: speedAmount[0] },
                    inputs: 'fade_output',
                    outputs: 'fade_output2'

                });
            filters.push(
                {
                    filter: 'rubberband',
                    options: {
                        pitch: pitchDuration[0], // Change pitch by 1.5 semitones
                        channels: 2,
                    },
                    inputs: 'fade_output2',
                    outputs: 'volume_output'
                });
            filters.push(
                {
                    filter: 'volume',
                    options: { volume: volumeAmount[0] },
                    inputs: 'volume_output',
                });


            /*filters.push({
                filter: 'afade',
                options: {
                    type: 'out',
                    start_time: 'end',
                    duration: fadeoutDuration[0],
                },
                inputs: 'amix_output_fadein',
            });*/
            console.log(inputFile1);
            console.log(inputFile2);

            ffmpeg()
                .input(inputFile1)
                .input(inputFile2)
                .complexFilter(filters)
                .on('error', (err) => console.log('An error occurred: ' + err.message + filters))
                .saveToFile(outputFile)
                .on('end', () => {
                    const fileBuffer = fs.readFileSync(outputFile);
                    const fileBuffers = Buffer.from(fileBuffer, 'base64');

                    const tags = ID3.read(fileBuffers);

                    res.status(200).send({
                        message: 'Tracks merged successfully',
                        data: {
                            artist: tags['artist'] || user.username || 'Unknown',
                            name: tags['title'] || 'Unknown',
                            length: tags['length'] || 'Unknown',
                            album: tags['album'] || 'Unknown',
                            Image: 'http://localhost:3000/assets/img/covers/cover.svg',
                            genre: tags['genre'] || 'Unknown',
                            mp3: `${req.protocol}://${req.get("host")}${process.env.MP3URL}/${outputFileName}`,
                            file: `/Users/chawki/Documents/GitHub/blobly/Bloby-server-side/public/mp3/${outputFileName}`
                        }
                    });
                });

        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error mergin tracks' });
        }
    },

}