import { Router } from 'express'
import * as ctrl from '../controllers/variantesController'
const router = Router()
router.get('/producto/:productoId', ctrl.getByProducto)
router.post('/', ctrl.create)
router.put('/:id', ctrl.update)
router.delete('/:id', ctrl.remove)
export default router