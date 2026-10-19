import mongoose from 'mongoose'

const envelopeSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, unique: true },
    group: { type: String, required: true },
    subtitle: { type: String, default: '' },
    limit: { type: Number, required: true, min: 0 },
    rollover: { type: Boolean, default: false },
  },
  { timestamps: true },
)

envelopeSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
    return ret
  },
})

export default mongoose.model('Envelope', envelopeSchema)