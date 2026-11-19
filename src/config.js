export const config = {
  port: Number(process.env.PORT ?? 3000),
  kitchenApiUrl: process.env.KITCHEN_API_URL ?? 'http://localhost:4100',
};
