import app from "../artifacts/api-server/src";

export default function handler(req: any, res: any) {
  return app(req, res);
}