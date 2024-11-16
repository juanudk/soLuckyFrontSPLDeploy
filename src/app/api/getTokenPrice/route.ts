import axios from "axios"
export const revalidate = 60
import { NextRequest, NextResponse } from 'next/server';
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const quote = searchParams.get('quote')
  const token = searchParams.get('token')
  const options = {
    method: 'GET',
    url: `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${quote}&ids=${token}`,
    headers: { accept: 'application/json', 'x-cg-demo-api-key': process.env.COIN_GECKO_API_KEY }
  };
  try {
    const response = await axios.request(options)
    return NextResponse.json(response.data)
  } catch (e) {
    delete options.headers["x-cg-demo-api-key"]
    const response = await axios.request(options)
    console.log(e)
    return NextResponse.json(response.data)
  }
}
