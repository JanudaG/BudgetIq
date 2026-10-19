import 'dotenv/config'
import mongoose from 'mongoose'
import Transaction from './models/Transaction.js'
import Envelope from './models/Envelope.js'
import { initialTransactions, initialEnvelopes } from '../../client/src/constants/mockData.js'

await mongoose.connect(process.env.MONGO_URI)

await Transaction.deleteMany({})
await Envelope.deleteMany({})

// Remove the fake ids from the sample data. MongoDB makes its own.
await Transaction.insertMany(initialTransactions.map(({ id, ...rest }) => rest))
await Envelope.insertMany(initialEnvelopes.map(({ id, ...rest }) => rest))

console.log(`Seeded ${initialTransactions.length} transactions and ${initialEnvelopes.length} envelopes`)
await mongoose.disconnect()