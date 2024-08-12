import MySQLService from "../config/MySQLService";
import TypeLogs from "../log/TypeLogs";
import { Tables, comandsTables } from "../model/StockTables";

// Classe base para validação de dados de estoque
class ValidatorsStockController {

    // Logger para registrar mensagens e erros
    protected logger: TypeLogs;
    // Propriedade para armazenar as tabelas e suas respectivas validações
    private tablesValidate: Tables;

    // Construtor da classe, inicializa o logger e as tabelas de validação
    constructor(logger: TypeLogs) {
        this.logger = logger; // Inicializa o logger
        this.tablesValidate = comandsTables; // Configura as tabelas de validação
    }

    // Retorna a instância do logger
    public getLogger(): TypeLogs {
        return this.logger;
    }

    // Valida os dados de adição, substituindo valores nulos ou indefinidos por null
    public validateDataAdd(data: object): object {
        try {
            // Percorre todas as entradas do objeto de dados
            for (const [key, value] of Object.entries(data)) {
                // Substitui valores nulos, indefinidos ou vazios por null
                if (value === null || value === undefined || value === "") {
                    (data as any)[key] = null;
                }
            }
    
            return data; // Retorna os dados validados
        } catch (error) {
            this.logger.error((error as Error).message); // Registra o erro no log
            throw error; // Lança o erro para que possa ser tratado pela chamada da função
        }
    }

    // Valida a existência de um ID na tabela especificada
    public async validateId(nameTable: keyof Tables, id: number, database: MySQLService): Promise<void> {
        let sqlCheck: string;

        const table = this.tablesValidate[nameTable]; // Obtém a tabela de validação correspondente ao nome da tabela

        // Verifica se a tabela existe
        if (!table) {
            throw new Error("Table not found");
        }

        sqlCheck = table.sqlCheck; // Obtém a SQL para verificar a existência do ID

        const result = await database.query(sqlCheck, [id]); // Executa a consulta para verificar a existência do ID

        // Verifica se o resultado contém o ID
        if (!result[0]) {
            throw new Error(`ID ${id} not found in ${nameTable}`); // Lança um erro se o ID não for encontrado
        }
    }

}

export default ValidatorsStockController;