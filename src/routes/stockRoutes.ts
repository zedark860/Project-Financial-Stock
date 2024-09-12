import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import TypeLogs from "../log/TypeLogs";
import StockController from '../controller/StockController';
import { comandsTables as tables } from '../model/StockTables'; // Importando as tabelas configuradas

const router = express.Router();
const stockController = new StockController(new TypeLogs());
let message: string;

function isValidTable(nameTable: string): nameTable is keyof typeof tables {
    return nameTable in tables;
}

router.get('/all/:nameTable', async (req: Request, res: Response) => {
    const { nameTable } = req.params;
    let userIP = req.ip === "::1" ? "127.0.0.1" : req.ip;
    message = "All items retrieved";

    try {
        if (!isValidTable(nameTable)) {
            throw new Error(`Invalid table name: ${nameTable}`);
        }

        const result = await stockController.allItens(nameTable);

        stockController.getLogger().info(message, userIP);

        res.status(200).json({ messageStatus: message, all: result });
    } catch (error) {
        stockController.getLogger().error((error as Error).message, userIP);
        res.status(500).json({ error: (error as Error).message });
    }
});

router.post('/add/:nameTable', async (req: Request, res: Response) => {
    const { nameTable } = req.params;
    let userIP = req.ip === "::1" ? "127.0.0.1" : req.ip;
    message = "Add successful";

    try {
        if (!isValidTable(nameTable)) {
            throw new Error(`Invalid table name: ${nameTable}`);
        }

        await stockController.addItem(req.body, nameTable);

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
        if (!isValidTable(nameTable)) {
            throw new Error(`Invalid table name: ${nameTable}`);
        }

        await stockController.updateItem(req.body, nameTable, parseInt(idProduct, 10));

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
        if (!isValidTable(nameTable)) {
            throw new Error(`Invalid table name: ${nameTable}`);
        }

        await stockController.deleteItem(nameTable, parseInt(idProduct, 10));

        stockController.getLogger().warn(message, userIP);

        res.status(200).send({ messageStatus: message });
    } catch (error) {
        stockController.getLogger().error((error as Error).message, userIP);
        res.status(500).json({ error: (error as Error).message });
    }
});

router.put('/update-quantity-total/:nameTable/:idProduct/:typeMoviment' , async (req: Request, res: Response) => {
    const { nameTable, idProduct, typeMoviment } = req.params;
    let userIP = req.ip === "::1" ? "127.0.0.1" : req.ip;
    message = "Total balance update successful";

    try {
        if (!isValidTable(nameTable)) {
            throw new Error(`Invalid table name: ${nameTable}`);
        }

        await stockController.updateQuantityTotal(parseInt(req.body["quantity"], 10), nameTable, parseInt(idProduct, 10), typeMoviment);

        stockController.getLogger().warn(message, userIP);

        res.status(201).json({ messageStatus: message });
    } catch (error) {
        stockController.getLogger().error((error as Error).message, userIP);
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
