import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send('This is the GET route');
});

router.post('/', (req: Request, res: Response) => {
  res.send('This is the test1 POST route');
});

export default router;
