import { Request, Response, NextFunction } from 'express';
import TypeLogs from '../log/TypeLogs';

class Middlewares {

    private logger: TypeLogs;

    constructor() {
        this.logger = new TypeLogs();
    }

    public corsOptions(): object {
        return {
            origin: '*',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            preflightContinue: false,
            optionsSuccessStatus: 204
        }
    }

    public jsonError(err: SyntaxError, req: Request, res: Response, next: NextFunction) {
        try {
            if (err instanceof SyntaxError && 'body' in err) {
                this.logger.error(err.message);
                return res.status(400).send({ status: 400, message: 'Bad JSON' }); 
            }

            next();

        } catch (error) {
            this.logger.error((error as Error).message);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    public checkHeaders(req: Request, res: Response, next: NextFunction) {
        const contentType = req.headers['content-type'];
        
        if (['POST', 'PUT'].includes(req.method) && (!contentType || contentType !== 'application/json')) {
            this.logger.warn('Missing or incorrect Content-Type');
            return res.status(400).json({ error: "Bad request: Missing or incorrect Content-Type" });
        }
        
        next();
    }



}

export default Middlewares;