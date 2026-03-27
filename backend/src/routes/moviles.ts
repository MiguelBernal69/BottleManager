import { Router } from 'express'
import * as ctrl from '../controllers/movilesController'

const router = Router()
router.get('/', ctrl.getAll)
router.get('/activos', ctrl.getActivos)
router.get('/:id/historial', ctrl.getHistorial)
router.post('/', ctrl.create)
router.put('/:id', ctrl.update)
router.delete('/:id', ctrl.remove)
export default router