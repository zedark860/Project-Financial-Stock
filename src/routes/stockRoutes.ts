import express, { Request, Response } from 'express';
import TypeLogs from "../log/TypeLogs";
import StockController from '../controller/StockController';

const router = express.Router();
const stockController = new StockController(new TypeLogs());
let message: string;

router.get('/all/:nameTable', async (req: Request, res: Response) => {
    const { nameTable } = req.params;
    let userIP = req.ip === "::1" ? "127.0.0.1" : req.ip;
    message = "All itens retrieved";

    try {
        const result = await stockController.allItens(nameTable);

        stockController.getLogger().info(message, userIP);

        res.status(200).json({ messageStatus: message, all: result });
    } catch (error) {
        stockController.getLogger().error((error as Error).message, userIP);
        res.status(500).json({ error: (error as Error).message });
    }
});


router.post('/add/:nameTable', (req: Request, res: Response) => {
    const { nameTable } = req.params;
    let userIP = req.ip === "::1" ? "127.0.0.1" : req.ip;
    message = "Add successful";

    try {
        const data = stockController;


        stockController.getLogger().info(message, userIP);

        res.status(201).json({ messageStatus: message });
    } catch (error) {
        stockController.getLogger().error((error as Error).message, userIP);
        res.status(500).json({ error: (error as Error).message });
    }
});


router.put('/update/:nameTable/:idProduct', async (req: Request, res: Response) => {
    const { nameTable, idProduct } = req.params;
    let userIP = req.ip === "::1" ? "127.0.0.1" : req.ip;
    message = "Update successful";

    try {
        const data = stockController.validateTableData(nameTable, idProduct, req.body);

        await stockController.update(data, nameTable);

        stockController.getLogger().warn(message, userIP);

        res.status(201).json({ messageStatus: message });
    } catch (error) {
        stockController.getLogger().error((error as Error).message, userIP);
        res.status(500).json({ error: (error as Error).message });
    }
});


router.delete('/delete/:nameTable/:idProduct', async (req: Request, res: Response) => {
    const { nameTable, idProduct } = req.params;
    let userIP = req.ip === "::1" ? "127.0.0.1" : req.ip;
    message = "Delete successful";

    try {
        await stockController.deleteItem(nameTable, parseInt(idProduct, 10));
        
        stockController.getLogger().warn(message, userIP);
        
        res.status(200).send({ messageStatus: message });
    } catch (error) {
        stockController.getLogger().error((error as Error).message, userIP);
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;