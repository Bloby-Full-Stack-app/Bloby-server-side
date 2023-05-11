import  mongoose  from "mongoose";
const { Schema, model } = mongoose;

const eventSchema = new Schema({
    title: {
      type: String,
      required: false
    },
    address: {
      type: String,
      required: true
    },
    about: {
        type: String,
        required: true
      },
    image: {
      type: String,
      required: false,
    },
    date: {
      type: Date,
      required: false
    },
}, {
    timestamps: true
});
const Event = mongoose.model("Event", eventSchema);
export { Event };