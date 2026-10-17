import { Router } from 'express'
import Transaction from '../models/Transaction.js'

const router = Router()

// GET /api/transactions: list everything, newest first
router.get('/', async (req, res) => {
  const transactions = await Transaction.find().sort({ date: -1, createdAt: -1 })
  res.json(transactions)
})

// POST /api/transactions: create one from the JSON body
router.post('/', async (req, res) => {
  try {
    const created = await Transaction.create(req.body)
    res.status(201).json(created)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE /api/transactions/:id: remove one
router.delete('/:id', async (req, res) => {
  const deleted = await Transaction.findByIdAndDelete(req.params.id)
  if (!deleted) return res.status(404).json({ error: 'Not found' })
  res.status(204).end()
})

export default router