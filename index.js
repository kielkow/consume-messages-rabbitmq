const sleep = require('./sleep');
const sendToApi = require('./sendToApi');
const instantiveRabbiMq = require('./instantiveRabbiMq');

class Automation {
  async run(ctx) {
    try {
      const rabbitMq = await instantiveRabbiMq(ctx.credentials);

      const numberOfMessages = await rabbitMq.getMessageCount(ctx.credentials);

      rabbitMq.channel.consume(
        ctx.credentials.queueName,
        async (msg) => {
          if (msg !== null) {
            const messageFromQueue = JSON.parse(msg.content.toString());
            
            try {
              const response = await sendToApi(messageFromQueue);
              console.log(response);
            } catch (error) {
                console.log(error);
              });
            }

            await sleep(5000);
          }
        },
        { noAck: true }
      );

      setTimeout(async () => {
        await rabbitMq.closeChannel();
        await rabbitMq.closeConnection();
      }, numberOfMessages * 15000);
    } catch (error) {
        console.log(error);
    }
  }
}

module.exports = new Automation();
// const test = new Automation();
// test.run({
//   credentials: {
//     amqpUrl:
//       'amqps://...',
//     queueName: 'test-queue',
//   },
// });
