import * as fp from 'fastify-plugin';
import axios from 'axios';
import { URLSearchParams } from 'url';
import * as MQTT from 'async-mqtt';
import { interval } from 'rxjs';
import { IClientPublishOptions } from 'async-mqtt';
import { FastifyInstance } from 'fastify';

const instance = axios.create({
  baseURL: 'https://my.tado.com/api/v2/homes/384414',
  validateStatus: function (status) { return status >= 200 && status < 300 }
})

const email = process.env.TADO_EMAIL;
const password = process.env.TADO_PASSWORD;
const mqttBroker = process.env.MQTT_BROKER || 'eclipse-mosquitto';

const mqttClient = MQTT.connect(`mqtt://${mqttBroker}`);

const mqttPublishOpts: IClientPublishOptions = {
  qos: 0,
  retain: true
}

const rooms = [
  'kitchen',
  'living-room',
  'bathroom'
]

const sensors = [
  'temperature',
  'humidity'
]

export default fp(async (fastify) => {
  // It's like the constructor or ngOnInit
  fromTadoToBroker(fastify);
  interval(60 * 5 * 1000).subscribe(async () => {
    fromTadoToBroker(fastify);
  });
});

async function fromTadoToBroker(fastify: FastifyInstance): Promise<void> {
  const isAuth = await isAuthenticated()
  if (isAuth) {
    // Kitchen, Living Room, Bathroom
    const resRooms = await Promise.all([getRoom(2), getRoom(3), getRoom(1)])
    for (let index = 0; index < rooms.length; index++) {
      const room = rooms[index];
      const resValue = resRooms[index];
      const sensorValues = {
        temperature: resValue.insideTemperature.celsius.toString(),
        humidity: resValue.humidity.percentage.toString()
      }
      sensors.forEach(sensor => {
        const topic = `the-verse/${room}/tado/${sensor}`
        fastify.log.info({ plugin: 'mqtt', event: 'publish', topic: topic, room: room, payload: JSON.stringify(sensorValues[sensor]) })
        mqttClient.publish(topic, sensorValues[sensor], mqttPublishOpts).catch(console.log);
      })
    }
  }
}

async function isAuthenticated(): Promise<boolean> {
  try {
    await instance.get('/')
    return true
  } catch (error) {
    return await auth(error)
  }
}

async function auth(err: any): Promise<boolean> {
  if (err.response.status === 401) {
    try {
      const res = await getToken(email, password)
      instance.defaults.headers.common['Authorization'] = 'Bearer ' + res.data.access_token
      return true
    } catch (error) {
      return false
    }
  }
}

async function getToken(email: string, password: string) {
  const params = new URLSearchParams()
  params.append('client_id', 'tado-web-app')
  params.append('grant_type', 'password')
  params.append('scope', 'home.user')
  params.append('username', email)
  params.append('password', password)
  params.append('client_secret', 'wZaRN7rpjn3FoNyF5IFuxg9uMzYJcvOoQ8QWiIqS3hfk6gLhVlG57j5YNoZL2Rtc');
  return axios.post('https://auth.tado.com/oauth/token', params, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
}

async function getRoom(roomId: number) {
  let res = await instance.get(`/zones/${roomId}/state`)
  return res.data.sensorDataPoints;
}