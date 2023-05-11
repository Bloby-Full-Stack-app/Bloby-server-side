import { Event } from "../models/event.js";
import { User } from "../models/user.js";
import { validationResult } from 'express-validator';


export default {
    createEvent: async (req, res) => {
        const errors = validationResult(req);
        const userId = req.user.id;
        const { title, about, address } = req.body;

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        try {
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const newEvent = new Event({
                title: title,
                address: address,
                about: about,
                image: `${req.protocol}://${req.get("host")}${process.env.IMGURL}/${req.file.filename}`,
            });

            await newEvent.save();

            res.status(201).send({
                 data: {
                    event: newEvent,
                },
                message: 'Event created successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error creating event', error: error });
        }
    },

    getEvents: async (req, res) => {
        try {
            const events = await Event.find();
            res.status(200).send({
                data: events,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error fetching events' });
        }
    },

    updateEvent: async (req, res) => {
        const errors = validationResult(req);
        const userId = req.user.id;
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { title, address, date, about } = req.body;
        const { eventId } = req.params;

        try {
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const event = await Event.findById(eventId);

            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            event.title = title;
            event.address = address;
            event.image = `${req.protocol}://${req.get("host")}${process.env.IMGURL}/${req.file.name}`;
            event.date = date;
            event.about = about;

            await event.save();

            res.status(200).send({ message: 'Event edited successfully', event: event });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error editing event', error: error });
        }
    },

    getEvent: async (req, res) => {
        const { eventId } = req.params;
        try {
            const event = await Event.findById(eventId);
            if (!event) {
                return res.status(404).send({ message: 'Event not found' });
            }
            res.status(200).send({
                data: event,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error fetching event' });
        }
    },

    deleteEvent: async (req, res) => {
        const { eventId } = req.params;
        const userId = req.user.id;

        try {
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const event = await Event.findById(eventId);

            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }

            await event.remove();

            res.status(200).send({ message: 'Event deleted successfully' });
        }
        catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error deleting event', error: error });
        }
    },

    saveEvent: async (req, res) => {
        const { eventId } = req.params;
        const userId = req.user.id;
        let isSaved = false;

        try {
            const user = await User.findById(userId);

            const event = await Event.findById(eventId);

            if (!event) {
                return res.status(404).send({ message: 'Event not found' });
            }

            const savedEvent = user.savedEvents.find((savedEvent) => savedEvent.equals(event._id));

            if (savedEvent) {
                user.savedEvents.pull(event);
                isSaved = false;
                await user.save();
                res.status(200).send({
                    isSaved: isSaved,
                    message: 'Removed event from favorites successfully'
                });
            } else {
                user.savedEvents.push(event);
                isSaved = true;
                await user.save();
                res.status(200).send({
                    isSaved: isSaved,
                    message: 'Event added to favorites successfully'
                });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error adding/removing event from favorites' });
        }
    },

    fetchSavedEvents: async (req, res) => {
        const userId = req.user.id;

        try {
            const user = await User.findById(userId).populate('savedEvents');
            res.status(200).send({
                data: user.savedEvents,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error fetching saved events' });
        }
    },
}