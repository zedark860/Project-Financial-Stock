import MySQLService from "../config/MySQLService";
import TypeLogs from "../log/TypeLogs";
import ValidatorsStockController from "../validators/ValidatorsStockController";
import { EstoqueFinanceiroMes, EstoqueFinanceiroTotal } from "../model/StockData";
import { Tables, comandsTables } from "../model/StockTables";

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
        let sqlAll: string;
        let result: EstoqueFinanceiroMes[] | EstoqueFinanceiroTotal[];
        const database: MySQLService = this.getDataBase();

        try {
            // Inicia uma transação no banco de dados
            await database.beginTransaction(database.getClient());

            const table = this.getTables()[nameTable];

            // Verifica se a tabela existe
            if (!table) {
                throw new Error("Table not found");
            }

            sqlAll = table.sqlAll; // Obtém o SQL para recuperar todos os itens da tabela

            result = await this.getDataBase().query(sqlAll, database.getClient()); // Executa a consulta SQL e armazena o resultado

            return result; // Retorna o resultado da consulta
        } catch (error) {
            this.getLogger().error((error as Error).message); // Registra o erro no log
            await database.rollback(database.getClient()); // Reverte a transação em caso de erro
            throw error; // Lança o erro para que possa ser tratado pela chamada da função
        } finally {
            await database.commit(database.getClient()); // Confirma a transação
            await database.close(database.getClient()); // Fecha a conexão
        }
    }

    // Recupera o ID total para uma consulta com base no produto
    public async getTotalIdForQuery(nameTable: keyof Tables, product: string): Promise<number> {
        const sqlAux = this.getTables()[nameTable].sqlAuxId!;
        const database: MySQLService = this.getDataBase();

        try {
            const result = await this.getDataBase().query(sqlAux, database.getClient(), [product]); // Executa a consulta para recuperar o ID
            if (result.length > 0) {
                return result[0].id; // Retorna o ID encontrado
            } else {
                throw new Error('Product not found'); // Lança um erro se o produto não for encontrado
            }
        } catch (error) {
            this.getLogger().error((error as Error).message); // Registra o erro no log
            throw error; // Lança o erro para que possa ser tratado pela chamada da função
        } finally {
            await database.commit(database.getClient()); // Confirma a transação
            await database.close(database.getClient()); // Fecha a conexão
        }
    }

    // Adiciona um novo item à tabela especificada
    public async addItem(dataItens: EstoqueFinanceiroMes | EstoqueFinanceiroTotal, nameTable: keyof Tables): Promise<void> {
        let sqlInsert: string;
        const database: MySQLService = this.getDataBase();

        // Valida os dados do item e define a data de modificação
        const dataItensValidated = this.validateDataAdd(dataItens) as EstoqueFinanceiroMes | EstoqueFinanceiroTotal;
        dataItensValidated.data_modificacao = this.generateLastModification();

        try {
            await database.beginTransaction(database.getClient()); // Inicia uma transação no banco de dados

            // Verifica se a tabela é 'estoquefinanceiro_mes' e processa a inserção
            if (this.getTables()[nameTable] === this.getTables().estoquefinanceiro_mes) {
                const idForeignKey = await this.getTotalIdForQuery(nameTable, (dataItensValidated as EstoqueFinanceiroMes).produto);

                sqlInsert = this.getTables()[nameTable].sqlInsert;

                const dataMes = dataItensValidated as EstoqueFinanceiroMes;
                await this.getDataBase().query(sqlInsert, database.getClient(), [
                    idForeignKey, dataMes.data_modificacao, 
                    dataMes.produto, dataMes.movimento,
                    dataMes.quantidade, dataMes.destino_origem, 
                    dataMes.responsavel, dataMes.observacao
                ]);
            } else {
                sqlInsert = this.getTables()[nameTable].sqlInsert;

                const dataTotal = dataItensValidated as EstoqueFinanceiroTotal;
                await this.getDataBase().query(sqlInsert, database.getClient(), [
                    dataTotal.data_modificacao, dataTotal.produto,
                    dataTotal.unidade, dataTotal.vencimento, 
                    dataTotal.entrada, dataTotal.saida, 
                    dataTotal.saldo, dataTotal.setor
                ]);
            }
        } catch (error) {
            this.getLogger().error((error as Error).message); // Registra o erro no log
            await database.rollback(database.getClient()); // Reverte a transação em caso de erro
            throw error; // Lança o erro para que possa ser tratado pela chamada da função
        } finally {
            await database.commit(database.getClient()); // Confirma a transação
            await database.close(database.getClient()); // Fecha a conexão
        }
    }

    // Atualiza um item existente na tabela especificada
    public async updateItem(dataItens: EstoqueFinanceiroMes | EstoqueFinanceiroTotal, nameTable: keyof Tables, id: number): Promise<void> {
        let sqlUpdate: string;
        const database: MySQLService = this.getDataBase();

        // Valida os dados do item e define a data de modificação
        const dataItensValidated = this.validateDataAdd(dataItens) as EstoqueFinanceiroMes | EstoqueFinanceiroTotal;
        dataItensValidated.data_modificacao = this.generateLastModification();
    
        try {
            await database.beginTransaction(database.getClient()); // Inicia uma transação no banco de dados

            await this.validateId(nameTable, id, database); // Valida o ID para garantir que o item exista
    
            if (this.getTables()[nameTable] === this.getTables().estoquefinanceiro_mes) {
                sqlUpdate = this.getTables()[nameTable].sqlUpdate;
    
                const dataMes = dataItensValidated as EstoqueFinanceiroMes;
                await database.query(sqlUpdate, database.getClient(), [dataMes, id]);
            } else {
                sqlUpdate = this.getTables()[nameTable].sqlUpdate;
    
                const dataTotal = dataItensValidated as EstoqueFinanceiroTotal;
                await database.query(sqlUpdate, database.getClient(), [dataTotal, id]);
            }
        } catch (error) {
            this.getLogger().error((error as Error).message); // Registra o erro no log
            await database.rollback(database.getClient()); // Reverte a transação em caso de erro
            throw error; // Lança o erro para que possa ser tratado pela chamada da função
        } finally {
            await database.commit(database.getClient()); // Confirma a transação
            await database.close(database.getClient()); // Fecha a conexão
        }
    }

    public async updateQuantityTotal(quantity: number, nameTable: keyof Tables, id: number, typeMoviment: string): Promise<void> {
        let sqlUpdateTotalBalance: string;
        const database: MySQLService = this.getDataBase();

        if (isNaN(quantity)) {
            throw new Error(`Invalid quantity: ${quantity}`);
        }

        try {
            await database.beginTransaction(database.getClient()); // Inicia uma transação no banco de dados

            await this.validateId("estoquefinanceiro_total", id, database); // Valida o ID para garantir que o item exista

            if (this.getTables()[nameTable] === this.getTables().estoquefinanceiro_mes) {
                if (typeMoviment === "ENTRADA") {
                    sqlUpdateTotalBalance = this.getTables()[nameTable].sqlUpdateTotalBalanceEntrada!;
                } else if (typeMoviment === "SAIDA") {
                    sqlUpdateTotalBalance = this.getTables()[nameTable].sqlUpdateTotalBalanceSaida!;
                } else {
                    throw new Error(`Invalid typeMoviment: ${typeMoviment}`);
                }

                await database.query(sqlUpdateTotalBalance, database.getClient(), 
                            [quantity, quantity, this.generateLastModification(), id]);
            }
        } catch (error) {
            this.getLogger().error((error as Error).message); // Registra o erro no log
            await database.rollback(database.getClient()); // Reverte a transação em caso de erro
            throw error; // Lança o erro para que possa ser tratado pela chamada da função
        } finally {
            await database.commit(database.getClient()); // Confirma a transação
            await database.close(database.getClient()); // Fecha a conexão
        }
    }

    // Deleta um item da tabela especificada
    public async deleteItem(nameTable: keyof Tables, id: number): Promise<void> {
        let sqlDelete: string;
        const database: MySQLService = this.getDataBase();

        try {
            await database.beginTransaction(database.getClient()); // Inicia uma transação no banco de dados

            // Valida o ID para garantir que o item exista
            await this.validateId(nameTable, id, database);

            const table = this.getTables()[nameTable];

            // Verifica se a tabela existe
            if (!table) {
                throw new Error("Table not found");
            }

            sqlDelete = table.sqlDelete; // Obtém o SQL para deletar o item

            await database.query(sqlDelete, database.getClient(), [id]); // Executa a consulta de deleção
        } catch (error) {
            this.getLogger().error((error as Error).message); // Registra o erro no log
            await database.rollback(database.getClient()); // Reverte a transação em caso de erro
            throw error; // Lança o erro para que possa ser tratado pela chamada da função
        } finally {
            await database.commit(database.getClient()); // Confirma a transação
            await database.close(database.getClient()); // Fecha a conexão
        }
    }

}

export default StockController;
