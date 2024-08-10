import MySQLService from "../config/MySQLService";
import TypeLogs from "../log/TypeLogs";
import ValidatorsStockController from "../../validators/ValidatorsStockController";
import { EstoqueFinanceiroMes, EstoqueFinanceiroTotal } from "../model/StockModel";

class StockController extends ValidatorsStockController {

    private database: MySQLService;

    constructor(logger: TypeLogs) {
        super(logger);
        this.database = new MySQLService();
    }

    private getDataBase(): MySQLService {
        return this.database;
    }

    public async allItens(nameTable: string): Promise<EstoqueFinanceiroMes[] | EstoqueFinanceiroTotal[]> {
        let sqlAll: string;
        let result: EstoqueFinanceiroMes[] | EstoqueFinanceiroTotal[];

        try {
            this.database.beginTransaction();

            if (nameTable === "estoquefinanceiro_mes") {
                sqlAll = `SELECT * FROM estoquefinanceiro_mes ORDER BY id_mes DESC;`;
            } else {
                sqlAll = `SELECT * FROM estoquefinanceiro_total ORDER BY id_total DESC;`;
            }

            result = await this.getDataBase().query(sqlAll);

            return result;
        } catch (error) {
            this.getLogger().error((error as Error).message);
            await this.getDataBase().rollback();
            throw error;
        } finally {
            this.getDataBase().close();
        }
    }

    public async filterItems(value: string): Promise<void> {
        try {
            
        } catch (error) {
            this.getLogger().error((error as Error).message);
            await this.getDataBase().rollback();
            throw error;
        } finally {
            this.getDataBase().close();
        }
    }

    public async addItem(dataItens: object, nameTable: string): Promise<void> {
        try {

            const dataItensValidated = this.validateDataAdd(dataItens);


            
        } catch (error) {
            this.getLogger().error((error as Error).message);
            await this.getDataBase().rollback();
            throw error;
        } finally {
            this.getDataBase().close();
        }
    }

    public async update(dataItens: EstoqueFinanceiroMes | EstoqueFinanceiroTotal, nameTable: string): Promise<void> {
        let sqlUpdate: string;
        let id: number;

        const dataItensValidated = this.validateDataUpdate(dataItens);

        try {
            this.getDataBase().beginTransaction();

            await this.validateId(nameTable, dataItens.id, this.getDataBase());

            if (nameTable === "estoquefinanceiro_mes") {
                id = (dataItens as EstoqueFinanceiroMes).id; 
                sqlUpdate = `UPDATE estoquefinanceiro_mes SET ? WHERE id_mes = ?;`;
            } else {
                id = (dataItens as EstoqueFinanceiroTotal).id;
                sqlUpdate = `UPDATE estoquefinanceiro_total SET ? WHERE id_total = ?;`;
            }

            await this.getDataBase().query(sqlUpdate, [dataItensValidated, dataItens.id]);
            
            await this.getDataBase().commit();
        } catch (error) {
            this.getLogger().error((error as Error).message);
            await this.getDataBase().rollback();
            throw error;
        } finally {
            this.getDataBase().close();
        }
    }

    public async deleteItem(nameTable: string, id: number): Promise<void> {
        let sqlDelete: string;

        try {
            this.getDataBase().beginTransaction();

            await this.validateId(nameTable, id, this.getDataBase());

            if (nameTable === "estoquefinanceiro_mes") {
                sqlDelete = `DELETE FROM estoquefinanceiro_mes WHERE id_mes = ?;`;
            } else {
                sqlDelete = `DELETE FROM estoquefinanceiro_total WHERE id_total = ?;`;
            }

            await this.getDataBase().query(sqlDelete, [id]);

            await this.getDataBase().commit();
        } catch (error) {
            this.getLogger().error((error as Error).message);
            await this.getDataBase().rollback();
            throw error;
        } finally {
            this.getDataBase().close();
        }
    }

}

export default StockController;
