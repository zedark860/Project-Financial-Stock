import MySQLService from "../src/config/MySQLService";
import TypeLogs from "../src/log/TypeLogs";
import { EstoqueFinanceiroMes, EstoqueFinanceiroTotal } from "../src/model/StockModel";

class ValidatorsStockController {

    protected logger: TypeLogs;

    constructor(logger: TypeLogs) {
        this.logger = logger;
    }

    public getLogger(): TypeLogs {
        return this.logger;
    }

    public validateDataAdd(data: object): object {
        try {
            for (const [key, value] of Object.entries(data)) {
                if (value === null || value === undefined || value === "") {
                    (data as any)[key] = null;
                }
            }
    
            return data;
        } catch (error) {
            this.logger.error((error as Error).message);
            throw error;
        }
    }

    public validateDataUpdate(data: object): object | void {
        try {
            for (const [key, value] of Object.entries(data)) {
                if (key === "vencimento_total") {
                    return data;
                }
                if (value === null || value === undefined || value === "") {
                    throw new Error("Invalid data" + key);
                } 
                
            }
        } catch (error) {
            this.logger.error((error as Error).message);
            throw error;
        }
    }

    public async validateId(nameTable: string, id: number, database: MySQLService): Promise<void> {
        let checkSql: string;

        if (nameTable === "estoquefinanceiro_mes") {
            checkSql = `SELECT 1 FROM estoquefinanceiro_mes WHERE id_mes = ?`;
        } else {
            checkSql = `SELECT 1 FROM estoquefinanceiro_total WHERE id_total = ?`;
        }

        const result = await database.query(checkSql, [id]);

        if (!result[0]) {
            throw new Error(`ID ${id} not found in ${nameTable}`);
        }
    }

    public validateTableData(nameTable: string, idProduct: string, body: any): EstoqueFinanceiroMes | EstoqueFinanceiroTotal {
        try {
            let data: EstoqueFinanceiroMes | EstoqueFinanceiroTotal;
            const currentDate = new Date().toISOString().split('T')[0];
        
            if (nameTable === 'estoquefinanceiro_mes') {
                const { id_total, produto, movimentos_mes, quantidade_mes, destino_origem_mes, responsavel_mes, observacoes_mes } = body;
        
                data = {
                    id: parseInt(idProduct, 10),
                    id_total,
                    datamodificacao: currentDate,
                    produto,
                    movimentos_mes,
                    quantidade_mes,
                    destino_origem_mes,
                    responsavel_mes,
                    observacoes_mes
                } as EstoqueFinanceiroMes;
        
            } else {
                const { produto, unidade_total, vencimento_total, entrada_total, saida_total, saldo_total, setor_total } = body;
        
                data = {
                    id: parseInt(idProduct, 10),
                    datamodificacao: currentDate,
                    produto,
                    unidade_total,
                    vencimento_total,
                    entrada_total,
                    saida_total,
                    saldo_total,
                    setor_total
                } as EstoqueFinanceiroTotal;
                
            }

            return data;
        } catch (error) {
            this.logger.error((error as Error).message);
            throw error;
        }

    }

}

export default ValidatorsStockController;