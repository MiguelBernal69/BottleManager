import { Router } from 'express'
import * as ctrl from '../controllers/pedidosController'
const router = Router()
router.get('/', ctrl.getAll)
router.get('/:id', ctrl.getById)
router.post('/', ctrl.create)
router.patch('/:id/estado', ctrl.updateEstado)
router.delete('/:id', ctrl.remove)
router.put('/:id', ctrl.update)
router.patch('/:id/pago', ctrl.updatePago)
export default router