const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    text: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    date: Date,
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }
});

commentSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
})

module.exports = mongoose.model("Comment", commentSchema);