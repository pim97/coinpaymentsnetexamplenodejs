export interface CoinpaymentsIPN {
  currency1: string;
  currency2: string;
  amount1: number;
  amount2: number;
  ipn_id: string;
  fee: string;
  ipn_mode: string;
  ipn_type: string;
  ipn_version: string;
  merchant: string;
  received_amount: string;
  received_confirms: string;
  status: string;
  status_text: string;
  txn_id: string;
}

export function ipn(hmac, payload) {
  /**
   *
   * @param {String} hmac
   * @param {String} ipnSecret
   * @param {Object} payload
   * @returns {Boolean}
   * @throws {CoinpaymentsIPNError}
   */
  const { verify } = require("coinpayments-ipn");
  const CoinpaymentsIPNError = require("coinpayments-ipn/lib/error");

  let isValid, error;

  try {
    isValid = verify(hmac, "r66Z1ftebAk9rFmJiEK", payload);
  } catch (e) {
    error = e;
  }
  if (error) {
    if (error instanceof CoinpaymentsIPNError) {
      // handle invalid payload
    }
    // make bug report
    console.log(error);
    return false;
  }

  if (isValid) {
    const payParsed: CoinpaymentsIPN = payload;
    const status = +payParsed?.status;

    // console.log('found status', status)
    if (status && (status >= 100 || status == 2)) {
       return true;
    }
  } else {
    return false;
  }
  return false;
}
