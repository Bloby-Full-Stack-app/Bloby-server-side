import { User } from "../models/user.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Token } from '../models/token.js';

export default {
    Login: async (req, res) => {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).populate('likedTracks').populate('releases');
        if (!user) {
            return res.status(400).send({
                statusCode : 400, 
                message: 'This account doesnt exist',
                user : undefined 
            });
        }
        if (!await bcrypt.compare(password, user.password)) {
            return res.status(400).json ({
                statusCode : 400, 
                message: 'Invalid credentials',
            });
          }
        /*if (!user.isVerified) {
            return res.status(401).send({ statusCode : 401,  message: 'User is not verified' });
        }*/

        const token = await Token.create({
            email,
            token: jwt.sign({ email }, 'secret'),
            expires: Date.now() + 3600000,
        });
      
        // set authorization header token
        //res.set('Authorization', token.token);

        return res.status(200).send({
            statusCode : 200,
            message : "Successfully logged in",
            access_token: token.token,
            expires_in: 3600,
            user : user,
        }); 
    },

    getCurrentUser: async (req, res, next) => {

        const { authorization } = req.headers;
        if (!authorization) {
            return res.status(401).send({ statusCode : 401, message: 'Unauthorized' });
        }
        const token = await Token.findOne({ token: authorization });
        if (!token) {
            return res.status(401).send({ statusCode : 401, message: 'Unauthorized' });
        }

        const user = await User.findOne ({ email: token.email });
        if (!user) {
            return res.status(401).send({ statusCode : 401, message: 'Unauthorized' });
        } else {
            req.user = user;
            next();
        }
        
    },

    Register : async (req, res) => {
        const { username, email, password, confirmPassword, role } = req.body;
        const user = await User.findOne({ $or: [{ email }, { username }] });
        
        const re = /\S+@\S+\.\S+/;
        if (!re.test(email)) {
            return res.status(400).send({
                statusCode : 400,
                message : "Email is not valid",
            });
        }

        if (user) {
            return res.status(400).send({
                statusCode : 400,
                message : "This email is already registered",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).send({
                statusCode : 400,
                message : "Passwords do not match",
            });
        }

        if (password.length < 6) {
            return res.status(400).send({
                statusCode : 400,
                message : "Password should be at least 6 characters",
            });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role
        });
        return res.status(200).send({
            statusCode : 200,
            message : "Successfully registered",
            user : newUser,
        });
    },

    getUsers: async (req, res) => {
        // get all users without current user
        const users = await User.find({ _id: { $ne: req.user.id } });
        res.status(200).send({ users });
    },

    getUserById: async (req, res) => {
        const { userId } = req.params;
        try {
            const artist = await User.findById(userId).populate('likedTracks').populate('releases');
            if (!artist) {
                return res.status(404).send({ message: 'User not found' });
            }
            res.status(200).send({
                data: artist,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error fetching artist' });
        }
    },
}