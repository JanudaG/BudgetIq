import { Router } from 'express'
import mongoose from 'mongoose'
import Envelope from '../models/Envelope.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

// GET: Current user's envelopes.
router.get('/', async (req, res) => {
  try {
    const envelopes = await Envelope.find({
      userId: req.userId,
    }).sort({ createdAt: 1 })

    res.json(envelopes)
  } catch {
    res.status(500).json({ error: 'Failed to load envelopes.' })
  }
})

// POST: Create an envelope for the logged-in user.
router.post('/', async (req, res) => {
  try {
    const { category, group, subtitle, limit, rollover } = req.body

    const created = await Envelope.create({
      category,
      group,
      subtitle,
      limit,
      rollover,
      userId: req.userId,
    })

    res.status(201).json(created)
  } catch (err) {
    res.status(err.code === 11000 ? 409 : 400)
      .json({ error: err.message })
  }
})

// PATCH: Update only the user's envelope.
router.patch('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid envelope ID.' })
  }

  try {
    const allowed = ['category', 'group', 'subtitle', 'limit', 'rollover']
    const changes = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowed.includes(key))
    )

    const updated = await Envelope.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: changes },
      { returnDocument: 'after', runValidators: true }
    )

    if (!updated) {
      return res.status(404).json({ error: 'Envelope not found.' })
    }

    res.json(updated)
  } catch (err) {
    res.status(err.code === 11000 ? 409 : 400)
      .json({ error: err.message })
  }
})

// DELETE: Only remove the user's own envelope.
router.delete('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid envelope ID.' })
  }

  try {
    const deleted = await Envelope.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    })

    if (!deleted) {
      return res.status(404).json({ error: 'Envelope not found.' })
    }

    res.status(204).end()
  } catch {
    res.status(500).json({ error: 'Failed to delete envelope.' })
  }
})

export default router