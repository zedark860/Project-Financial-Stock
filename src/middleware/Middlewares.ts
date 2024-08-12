import { Request, Response, NextFunction } from 'express';
import TypeLogs from '../log/TypeLogs';

// Classe para definir e gerenciar middlewares da aplicação
class Middlewares {

    // Instância do logger para registrar mensagens e erros
    private logger: TypeLogs;

    // Construtor da classe, inicializa o logger
    constructor() {
        this.logger = new TypeLogs(); // Inicializa o logger
    }

    // Configura as opções de CORS (Cross-Origin Resource Sharing)
    public corsOptions(): object {
        return {
            origin: '*', // Origem permitida
            methods: 'GET,PUT,POST,DELETE', // Métodos HTTP permitidos
            preflightContinue: false, // Não continua a verificação do preflight
            optionsSuccessStatus: 204 // Status HTTP para resposta de preflight bem-sucedida
        }
    }

    // Middleware para lidar com erros de JSON (por exemplo, erros de sintaxe)
    public jsonError(err: SyntaxError, req: Request, res: Response, next: NextFunction) {
        try {
            // Verifica se o erro é uma SyntaxError e se está relacionado ao corpo da requisição
            if (err instanceof SyntaxError && 'body' in err) {
                this.logger.error(err.message); // Registra o erro de sintaxe no log
                return res.status(400).send({ status: 400, message: 'Bad JSON' }); // Retorna uma resposta 400 com mensagem de erro
            }

            next(); // Passa para o próximo middleware se não for um erro de JSON
        } catch (error) {
            this.logger.error((error as Error).message); // Registra qualquer erro inesperado no log
            return res.status(500).json({ error: "Internal server error" }); // Retorna uma resposta 500 com mensagem de erro interno do servidor
        }
    }

    // Middleware para verificar os cabeçalhos da requisição
    public checkHeaders(req: Request, res: Response, next: NextFunction) {
        const contentType = req.headers['content-type'];
        
        // Verifica se o método é POST ou PUT e se o cabeçalho Content-Type está ausente ou incorreto
        if (['POST', 'PUT'].includes(req.method) && (!contentType || contentType !== 'application/json')) {
            this.logger.warn('Missing or incorrect Content-Type'); // Registra um aviso sobre o cabeçalho ausente ou incorreto
            return res.status(400).json({ error: "Bad request: Missing or incorrect Content-Type" }); // Retorna uma resposta 400 com mensagem de erro
        }
        
        next(); // Passa para o próximo middleware se o cabeçalho estiver correto
    }



}

export default Middlewares;