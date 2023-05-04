import  mongoose  from "mongoose";
const { Schema, model } = mongoose;

const trackSchema = new mongoose.Schema({
    artist: {
      type: String,
      required: false
    },
    name: {
      type: String,
      required: true
    },
    length: {
      type: Number,
      required: false
    },
    Image: {
      type: String,
      required: false,
      default: 'http://localhost:3000/assets/img/covers/cover.svg'
    },
    album: {
      type: String,
      required: false
    },
    genre: {
      type: String,
      required: true
    },
    postedAt: {
      type: Date,
      default: Date.now
    },
    mp3: {
      type: String,
      required: true
    }
});

const Track = mongoose.model("Track", trackSchema);
export { Track };