import 'dotenv/config';
import App from './app';

const port = process.env.PORT || 3001;
const app = new App(Number(port));

app.start();
