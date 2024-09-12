import { Request, Response, NextFunction } from 'express';
import 'dotenv/config';
import rateLimit from 'express-rate-limit';
import TypeLogs from '../log/TypeLogs';

// Classe para definir e gerenciar middlewares da aplicação
class Middlewares {

    // Instância do logger para registrar mensagens e erros
    private logger: TypeLogs;
    private limiter: ReturnType<typeof rateLimit>;

    // Construtor da classe, inicializa o logger
    constructor() {
        this.logger = new TypeLogs(); // Inicializa o logger
        this.limiter = rateLimit({
            windowMs: 15 * 1000, // 30 segundos
            max: 10, // Limite de 10 requisições por 15 segundos
            message: 'Too many requests from this IP, please try again later',
            standardHeaders: true, // Retorna as informações do rate limit nos headers `RateLimit-*`
            legacyHeaders: false // Desativa os headers `X-RateLimit-*`
        });
    }

    public requestLimiter() {
        return this.limiter;
    }

    // Configura as opções de CORS (Cross-Origin Resource Sharing)
    public corsOptions(): object {
        return {
            origin: process.env.FRONT_END_HOST, // Permitir somente esta origem específica
            methods: ['GET', 'POST', 'PUT', 'DELETE'], // Permitir esses métodos HTTP
            allowedHeaders: ['Content-Type', 'Authorization'], // Cabeçalhos permitidos
            exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'], // Cabeçalhos que podem ser expostos ao cliente
            credentials: true, // Habilitar suporte a cookies e autenticação
            maxAge: 84600, // Tempo de cache do preflight
            preflightContinue: false, // Não continuar com a verificação do preflight
            optionsSuccessStatus: 204 // Código de sucesso para preflight
        };
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