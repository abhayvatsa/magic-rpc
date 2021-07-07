import { app } from './server';
import { main as client } from './client';

async function main() {
  // Start server
  const server = app.listen(8080, () => console.log('Server started...'));

  // Run client
  await client();

  // Stop server
  server.close(() => console.log('Server closed!'));
}

main();
