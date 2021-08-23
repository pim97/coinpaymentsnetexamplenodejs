import Coinpayments from "coinpayments";

interface CoinpaymentsCreateTransactionOpts {
  currency1: string;
  currency2: string;
  amount: number;
  buyer_email: string;
  address?: string;
  buyer_name?: string;
  item_name?: string;
  item_number?: string;
  invoice?: string;
  custom?: string;
  ipn_url?: string;
  success_url?: string;
  cancel_url?: string;
}

export async function create(coinpayment) {
  const client = new Coinpayments({
    key: process.env.KEY_PUBLIC,
    secret: process.env.KEY_PRIVATE,
  });

  const options: CoinpaymentsCreateTransactionOpts = {
    currency1: "USD",
    currency2: coinpayment.coin,
    amount: coinpayment.amount,
    buyer_email: coinpayment.email,
  };

  const result = await client.createTransaction(options);
//   console.log(result)
  return result;
}

// create().then();
