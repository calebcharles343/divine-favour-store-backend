import { Response } from "express";

const handleResponse = (
  res: Response,
  status: number,
  message: string,
  data: any = null
) => {
  const amount = data ? data.length : undefined;

  res.status(status).json({
    status,
    message,
    amount,
    data,
  });
};

export default handleResponse;
