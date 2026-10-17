import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    account: { type: String, default: null },
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: String, required: true }, // 'YYYY-MM-DD', same format the React app uses
  },
  { timestamps: true },
)

// MongoDB calls the id `_id`. Your React code uses `id`, so rename it in the JSON we send out.
transactionSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
    return ret
  },
})

export default mongoose.model('Transaction', transactionSchema)




