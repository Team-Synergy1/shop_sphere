import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  }
});

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [messageSchema],
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create unique compound index to prevent duplicate chats between the same users
chatSchema.index({ participants: 1 }, { unique: true });

// Generate a room ID based on sorted participant IDs
chatSchema.methods.getRoomId = function() {
  return this.participants.sort().join('-');
};

// Add a message to the chat
chatSchema.methods.addMessage = async function(sender, content) {
  this.messages.push({ sender, content });
  this.lastActivity = Date.now();
  await this.save();
  return this.messages[this.messages.length - 1];
};

// Mark all messages as read for a specific user
chatSchema.methods.markAsRead = async function(userId) {
  const unreadMessages = this.messages.filter(
    message => !message.isRead && message.sender.toString() !== userId.toString()
  );
  
  for (const message of unreadMessages) {
    message.isRead = true;
  }
  
  await this.save();
  return this;
};

const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);

export default Chat;