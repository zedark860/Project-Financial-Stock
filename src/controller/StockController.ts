import MySQLService from "../config/MySQLService";
import TypeLogs from "../log/TypeLogs";
import ValidatorsStockController from "../validators/ValidatorsStockController";
import { EstoqueFinanceiroMes, EstoqueFinanceiroTotal } from "../model/StockData";
import { Tables, comandsTables } from "../model/StockTables";
import { Pool } from "mysql";

// Controlador de operações de estoque, estende a classe ValidatorsStockController
class StockController extends ValidatorsStockController {

    // Propriedades privadas para o serviço de banco de dados e tabelas
    private tables: Tables;

    // Construtor da classe que inicializa o serviço de banco de dados e as tabelas
    constructor(logger: TypeLogs) {
        super(logger); // Chama o construtor da classe base para inicializar o logger
        this.tables = comandsTables; // Configura as tabelas de comando
    }

    // Retorna a instância de Tables
    private getTables(): Tables {
        return this.tables;
    }

    // Retorna a instância de MySQLService
    private getDataBase(): MySQLService {
        return new MySQLService();
    }

    // Gera a data atual no formato ISO (YYYY-MM-DD)
    private generateLastModification(): string {
        return new Date().toISOString().split('T')[0];
    }

    // Recupera todos os itens de uma tabela específica
    public async allItens(nameTable: keyof Tables): Promise<EstoqueFinanceiroMes[] | EstoqueFinanceiroTotal[]> {
        const database: MySQLService = this.getDataBase();
        const client: Pool = database.getClient();

        try {
            await database.beginTransaction(client);
            const table = this.getTables()[nameTable];
            if (!table) {
                throw new Error("Table not found");
            }

            const sqlAll: string = table.sqlAll; // Obtém o SQL para recuperar todos os itens da tabela
            const result: EstoqueFinanceiroMes[] | EstoqueFinanceiroTotal[] = await this.getDataBase().query(sqlAll, client);
            return result; // Retorna o resultado da consulta
        } catch (error) {
            this.getLogger().error((error as Error).message); // Registra o erro no log
            await database.rollback(client); // Reverte a transação em caso de erro
            throw error; // Lança o erro para que possa ser tratado pela chamada da função
        } finally {
            if (database && client) {
                await database.commit(client);
                await database.close(client);
            }
        }
    }

    // Recupera o ID total para uma consulta com base no produto
    public async getTotalIdForQuery(nameTable: keyof Tables, product: string, database: MySQLService): Promise<number> {
        const sqlAux = this.getTables()[nameTable].sqlAuxId!;
        const client = database.getClient();

        const result = await this.getDataBase().query(sqlAux, client, [product]); // Executa a consulta para recuperar o ID
        if (result.length > 0) {
            return result[0].id; // Retorna o ID encontrado
        }
        throw new Error('Product not found'); // Lança um erro se o produto não for encontrado
    }

    // Adiciona um novo item à tabela especificada
    public async addItem(dataItens: EstoqueFinanceiroMes | EstoqueFinanceiroTotal, nameTable: keyof Tables): Promise<void> {
        const sqlInsert: string = this.getTables()[nameTable].sqlInsert;
        const database: MySQLService = this.getDataBase();
        const client: Pool = database.getClient();

        // Valida os dados do item e define a data de modificação
        const dataItensValidated = this.validateDataAdd(dataItens) as EstoqueFinanceiroMes | EstoqueFinanceiroTotal;
        dataItensValidated.data_modificacao = this.generateLastModification();

        try {
            await database.beginTransaction(client);

            switch (nameTable) {
                case 'estoquefinanceiro_mes':
                    const idForeignKey = await this.getTotalIdForQuery(
                        nameTable, (dataItensValidated as EstoqueFinanceiroMes).produto, database
                    );
                    const dataMes = dataItensValidated as EstoqueFinanceiroMes;
                    await this.getDataBase().query(sqlInsert, client, [
                        idForeignKey, dataMes.data_modificacao, dataMes.produto, dataMes.movimento,
                        dataMes.quantidade, dataMes.destino_origem, dataMes.responsavel, dataMes.observacao
                    ]);
                    await this.updateQuantityTotal(
                        dataMes.quantidade, nameTable, 
                        idForeignKey, dataMes.movimento, database);
                    break;
                case 'estoquefinanceiro_total':
                    const dataTotal = dataItensValidated as EstoqueFinanceiroTotal;
                    await this.getDataBase().query(sqlInsert, client, [
                        dataTotal.data_modificacao, dataTotal.produto, dataTotal.unidade, dataTotal.vencimento, 
                        dataTotal.entrada, dataTotal.saida, dataTotal.saldo, dataTotal.setor
                    ]);
                    break;
                default:
                    throw new Error(`Invalid table: ${nameTable}`);
            }
        } catch (error) {
            this.getLogger().error((error as Error).message); // Registra o erro no log
            await database.rollback(client); // Reverte a transação em caso de erro
            throw error; // Lança o erro para que possa ser tratado pela chamada da função
        } finally {
            if (database && client) {
                await database.commit(client);
                await database.close(client);
            }
        }
    }

    // Atualiza um item existente na tabela especificada
    public async updateItem(dataItens: EstoqueFinanceiroMes | EstoqueFinanceiroTotal, nameTable: keyof Tables, id: number): Promise<void> {
        const sqlUpdate: string = this.getTables()[nameTable].sqlUpdate;
        const database: MySQLService = this.getDataBase();
        const client: Pool = database.getClient();

        // Valida os dados do item e define a data de modificação
        const dataItensValidated = this.validateDataAdd(dataItens) as EstoqueFinanceiroMes | EstoqueFinanceiroTotal;
        dataItensValidated.data_modificacao = this.generateLastModification();
    
        try {
            await database.beginTransaction(client); // Inicia uma transação no banco de dados
            await this.validateId(nameTable, id, database); // Valida o ID para garantir que o item exista
    
            switch (nameTable) {
                case 'estoquefinanceiro_mes':
                    const idForeignKey = await this.getTotalIdForQuery(nameTable, 
                        (dataItensValidated as EstoqueFinanceiroMes).produto, database
                    );
                    const dataMes = dataItensValidated as EstoqueFinanceiroMes;
                    await database.query(sqlUpdate, client, [dataMes, id]);
                    await this.updateQuantityTotal(
                        dataMes.quantidade, nameTable, 
                        idForeignKey, dataMes.movimento, database);
                    break;
                case 'estoquefinanceiro_total':
                    const dataTotal = dataItensValidated as EstoqueFinanceiroTotal;
                    await database.query(sqlUpdate, client, [dataTotal, id]);
                    break;
                default:
                    throw new Error(`Invalid table: ${nameTable}`);
            }
        } catch (error) {
            this.getLogger().error((error as Error).message); // Registra o erro no log
            await database.rollback(client); // Reverte a transação em caso de erro
            throw error; // Lança o erro para que possa ser tratado pela chamada da função
        } finally {
            if (database && client) {
                await database.commit(client);
                await database.close(client);
            }
        }
    }

    // Atualiza a quantidade de um item na tabela 'estoquefinanceiro_total'
    public async updateQuantityTotal(quantity: number, nameTable: keyof Tables, id: number, typeMoviment: string, database: MySQLService): Promise<void> {
        const client: Pool = database.getClient();

        if (isNaN(quantity)) {
            throw new Error(`Invalid quantity: ${quantity}`);
        }

        const validMovements: Record<string, string | undefined> = {
            ENTRADA: this.getTables()[nameTable]?.sqlUpdateTotalBalanceEntrada,
            SAIDA: this.getTables()[nameTable]?.sqlUpdateTotalBalanceSaida
        }

        const sqlUpdateTotalBalance = validMovements[typeMoviment];
        if (!sqlUpdateTotalBalance) {
            throw new Error(`Invalid typeMoviment: ${typeMoviment}`);
        }

        await database.beginTransaction(client); // Inicia uma transação no banco de dados
        await this.validateId("estoquefinanceiro_total", id, database); // Valida o ID para garantir que o item exista
        await database.query(sqlUpdateTotalBalance, client, 
                    [quantity, quantity, this.generateLastModification(), id]);
    }

    // Deleta um item da tabela especificada
    public async deleteItem(nameTable: keyof Tables, id: number): Promise<void> {
        const database: MySQLService = this.getDataBase();
        const client: Pool = database.getClient();

        try {
            await database.beginTransaction(client); // Inicia uma transação no banco de dados
            await this.validateId(nameTable, id, database);

            const table = this.getTables()[nameTable];
            if (!table) {
                throw new Error("Table not found");
            }

            const sqlDelete: string = table.sqlDelete; // Obtém o SQL para deletar o item
            await database.query(sqlDelete, client, [id]); // Executa a consulta de deleção
        } catch (error) {
            this.getLogger().error((error as Error).message); // Registra o erro no log
            await database.rollback(client); // Reverte a transação em caso de erro
            throw error; // Lança o erro para que possa ser tratado pela chamada da função
        } finally {
            if (database && client) {
                await database.commit(client);
                await database.close(client);
            }
        }
    }

}

export default StockController;
