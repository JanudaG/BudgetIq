import 'dotenv/config'
import mongoose from 'mongoose'
import User from './models/User.js'
import Transaction from './models/Transaction.js'
import Envelope from './models/Envelope.js'
import {
  initialTransactions,
  initialEnvelopes,
} from '../../client/src/constants/mockData.js'

try {
  await mongoose.connect(process.env.MONGO_URI)

  const email = process.env.SEED_USER_EMAIL

  if (!email) {
    throw new Error('SEED_USER_EMAIL is required.')
  }

  const user = await User.findOne({
    email: email.toLowerCase(),
  })

  if (!user) {
    throw new Error('Seed user not found. Register first.')
  }

  const transactionCount = await Transaction.countDocuments({
    userId: user._id,
  })

  const envelopeCount = await Envelope.countDocuments({
    userId: user._id,
  })

  if (transactionCount === 0) {
    await Transaction.insertMany(
      initialTransactions.map(({ id, ...rest }) => ({
        ...rest,
        userId: user._id,
      }))
    )
    console.log('Demo transactions inserted.')
  } else {
    console.log('Transactions already exist. Skipping.')
  }

  if (envelopeCount === 0) {
    await Envelope.insertMany(
      initialEnvelopes.map(({ id, ...rest }) => ({
        ...rest,
        userId: user._id,
      }))
    )
    console.log('Demo envelopes inserted.')
  } else {
    console.log('Envelopes already exist. Skipping.')
  }

  console.log('Seeding completed.')
} catch (err) {
  console.error('Seeding failed:', err.message)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}