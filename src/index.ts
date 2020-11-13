import createServer from './server';

const serverAddress = process.env.ADDRESS || '0.0.0.0';
const serverPort = +process.env.PORT || 3000;
const server = createServer();

// Start listening.
const start = async () => {
  try {
    await server.listen(serverPort, serverAddress);
    server.swagger()
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

start();