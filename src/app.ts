import express, { Application } from 'express';
import cors from 'cors';
import stockRoutes from './routes/stockRoutes';
import Middlewares from './middleware/Middlewares';

class App {
  public app: Application;
  private port: number;
  private middlewares: Middlewares;

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.middlewares = new Middlewares();
    this.middlewareSetup();
    this.routes();
  }

  private getMiddlewares(): Middlewares {
    return this.middlewares;
  }

  private middlewareSetup(): void {
    this.app.use(cors(this.getMiddlewares().corsOptions()));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(this.getMiddlewares().jsonError.bind(this.getMiddlewares()));
    this.app.use(this.getMiddlewares().checkHeaders.bind(this.getMiddlewares()));
    this.app.use(this.getMiddlewares().requestLimiter());
    this.app.use((req, res, next) => {
      console.log(`Request: ${req.method} ${req.url}`);
      next();
    });
  }

  private routes(): void {
    this.app.use("/estoque", stockRoutes);
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Server is listening on http://localhost:${this.port}`);
    });
  }
}

export default App;
