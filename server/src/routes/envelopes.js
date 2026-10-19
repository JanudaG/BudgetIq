import { Router } from 'express'
import Envelope from '../models/Envelope.js'

const router = Router()

router.get('/', async (req, res) => {
  res.json(await Envelope.find().sort({ createdAt: 1 }))
})

router.post('/', async (req, res) => {
  try {
    res.status(201).json(await Envelope.create(req.body))
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// PATCH changes only the fields you send, e.g. { "limit": 800 } or { "rollover": true }
router.patch('/:id', async (req, res) => {
  try {
    const updated = await Envelope.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    })
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  const deleted = await Envelope.findByIdAndDelete(req.params.id)
  if (!deleted) return res.status(404).json({ error: 'Not found' })
  res.status(204).end()
})

export default router