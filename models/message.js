import  mongoose  from "mongoose";
const { Schema, model } = mongoose;

const MessageSchema = new Schema(
  {
    message: {
      text: { type: String, required: true },
    },
    users: Array,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Messages = mongoose.model("Messages", MessageSchema);
export { Messages };
