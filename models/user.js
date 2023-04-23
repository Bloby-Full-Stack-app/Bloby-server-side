import  mongoose  from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema ({
    username: {
        type: String,
        required: true
      },
      role: {
        type: String,
        required: false,
      },
      releases: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Track',
        required: false
      }],
      email: {
        type: String,
        required: true,
        unique: true
      },
      password: {
        type: String,
        required: true
      },
      savedPlaylists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Playlist',
        required: false
      }],
      likedTracks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Track',
        required: false
      }]
})

const User = mongoose.model("User", userSchema);
export { User };