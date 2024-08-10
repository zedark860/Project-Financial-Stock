import MySQLService from "../config/MySQLService";
import TypeLogs from "../log/TypeLogs";
import ValidatorsStockController from "../validators/ValidatorsStockController";
import { EstoqueFinanceiroMes, EstoqueFinanceiroTotal } from "../model/StockData";
import { Tables, comandsTables } from "../model/StockTables";

class StockController extends ValidatorsStockController {

    private database: MySQLService;
    private tables: Tables;

    constructor(logger: TypeLogs) {
        super(logger);
        this.database = new MySQLService();
        this.tables = comandsTables;
    }

    private getTables(): Tables {
        return this.tables;
    }

    private getDataBase(): MySQLService {
        return this.database;
    }

    public async allItens(nameTable: keyof Tables): Promise<EstoqueFinanceiroMes[] | EstoqueFinanceiroTotal[]> {
        let sqlAll: string;
        let result: EstoqueFinanceiroMes[] | EstoqueFinanceiroTotal[];

        try {
            this.getDataBase().beginTransaction();

            const table = this.getTables()[nameTable];

            if (!table) {
                throw new Error("Table not found");
            }

            sqlAll = table.sqlAll;

            result = await this.getDataBase().query(sqlAll);

            return result;
        } catch (error) {
            this.getLogger().error((error as Error).message);
            await this.getDataBase().rollback();
            throw error;
        }
    }

    public async filterItems(value: string): Promise<void> {
        try {
            
        } catch (error) {
            this.getLogger().error((error as Error).message);
            await this.getDataBase().rollback();
            throw error;
        }
    }

    public async getTotalIdForQuery(nameTable: keyof Tables, product: string): Promise<number> {
        const sqlAux = this.getTables()[nameTable].sqlAuxId;

        try {
            const result = await this.getDataBase().query(sqlAux, [product]);
            if (result.length > 0) {
                return result[0].id_total;
            } else {
                throw new Error('Product not found');
            }
        } catch (error) {
            this.getLogger().error((error as Error).message);
            throw error;
        }
    }

    public async addItem(dataItens: EstoqueFinanceiroMes | EstoqueFinanceiroTotal, nameTable: keyof Tables): Promise<void> {
        let sqlInsert: string;

        const dataItensValidated: object = this.validateDataAdd(dataItens);

        try {
            await this.database.beginTransaction();

            if (this.getTables()[nameTable] === this.getTables().estoquefinanceiro_mes) {
                const idForeignKey = await this.getTotalIdForQuery(nameTable, dataItensValidated.produto);
                sqlInsert = this.getTables().estoquefinanceiro_mes.sqlInsert; // Get the correct SQL for insert
                await this.getDataBase().query(sqlInsert, [idForeignKey, dataItensValidated.datamodificacao, dataItensValidated.produto, dataItensValidated.quantidade, dataItensValidated.destino, dataItensValidated.responsavel, dataItensValidated.observacoes]);
            } else {
                sqlInsert = this.getTables()[nameTable].sqlInsert; // Get the correct SQL for insert
                await this.getDataBase().query(sqlInsert, [dataItensValidated.datamodificacao, dataItensValidated.unidade, dataItensValidated.vencimento, dataItensValidated.entrada, dataItensValidated.saida, dataItensValidated.saldo, dataItensValidated.setor]);
            }
            
            await this.getDataBase().commit();

        } catch (error) {
            this.getLogger().error((error as Error).message);
            await this.getDataBase().rollback();
            throw error;
        }
    }

    public async update(dataItens: EstoqueFinanceiroMes | EstoqueFinanceiroTotal, nameTable: keyof Tables): Promise<void> {
        let sqlUpdate: string;

        const dataItensValidated = this.validateDataUpdate(dataItens);

        try {
            this.getDataBase().beginTransaction();

            await this.validateId(nameTable, dataItens.id, this.getDataBase());

            const table = this.getTables()[nameTable];

            if (!table) {
                throw new Error("Table not found");
            }

            sqlUpdate = table.sqlUpdate;

            await this.getDataBase().query(sqlUpdate, [dataItensValidated, dataItens.id]);
            
            await this.getDataBase().commit();
        } catch (error) {
            this.getLogger().error((error as Error).message);
            await this.getDataBase().rollback();
            throw error;
        }
    }

    public async deleteItem(nameTable: keyof Tables, id: number): Promise<void> {
        let sqlDelete: string;

        try {
            this.getDataBase().beginTransaction();

            await this.validateId(nameTable, id, this.getDataBase());

            const table = this.getTables()[nameTable];

            if (!table) {
                throw new Error("Table not found");
            }

            sqlDelete = table.sqlDelete;

            await this.getDataBase().query(sqlDelete, [id]);

            await this.getDataBase().commit();
        } catch (error) {
            this.getLogger().error((error as Error).message);
            await this.getDataBase().rollback();
            throw error;
        }
    }

}

export default StockController;
