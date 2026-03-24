import { Router } from 'express'
import * as ctrl from '../controllers/historialController'

const router = Router()
router.get('/', ctrl.getAll)
router.post('/:id/entregar', ctrl.entregar)
export default router