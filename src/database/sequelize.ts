import { Sequelize, Model, DataTypes, QueryTypes } from "sequelize";

require("dotenv").config();

const dbConnectionString = `mysql://${process.env.DB_USER_DO}:${process.env.DB_PASSWORD_DO}@${process.env.DB_HOST_DO}:${process.env.DB_PORT_DO}/${process.env.DB_DATABASE_DO}`;
const sequelize = new Sequelize(dbConnectionString, {
  logging: process.env.environment === "DEVELOPMENT" ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    idle: 10000,
  },
});

export interface Product extends Model {
  id;
  name;
  months;
  tokens;
  price;
  date;
}

export interface Coinpayments extends Model {
  id;
  product_id;
  coin;
  txn_id;
  user_id;
  payment_amount;
  status;
  feedback;
  code;
  createdAt;
}

export interface User extends Model {
  id;
  tokens;
}

const User = sequelize.define<User>(
  "users",
  {
    id: {
      primaryKey: true,
      type: DataTypes.INTEGER.UNSIGNED,
    },
    tokens: {
      type: DataTypes.DOUBLE,
    },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);

const CoinPayments = sequelize.define<Coinpayments>(
  "coinpayments",
  {
    id: {
      primaryKey: true,
      type: DataTypes.INTEGER.UNSIGNED,
    },
    product_id: {
      type: DataTypes.INTEGER,
    },
    txn_id: {
      type: DataTypes.STRING,
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    payment_amount: {
      type: DataTypes.DOUBLE,
    },
    status: {
      type: DataTypes.INTEGER,
    },
    feedback: {
      type: DataTypes.INTEGER,
    },
    code: {
      type: DataTypes.STRING,
    },
  },
  {
    tableName: "coinpayments",
    timestamps: false,
  }
);

const ProductTable = sequelize.define<Product>(
  "products",
  {
    id: {
      primaryKey: true,
      type: DataTypes.INTEGER.UNSIGNED,
    },
    name: {
      type: DataTypes.STRING,
    },
    months: {
      type: DataTypes.INTEGER,
    },
    tokens: {
      type: DataTypes.INTEGER,
    },
    price: {
      type: DataTypes.DOUBLE,
    },
  },
  {
    tableName: "prodcuts",
    timestamps: false,
  }
);

export async function getProduct(productId: number) {
  console.log(`Finding product with ID ${productId}`);
  const product = await sequelize.query(
    `SELECT * FROM products
        WHERE id=?`,
    {
      replacements: [productId],
      model: ProductTable,
      mapToModel: true,
    }
  );
  if (product.length > 0) {
    console.log(`Found product`, product[0]);
    return product[0];
  }
}

export async function completePayment(txn_id: string) {
  const invoice = await sequelize.query(
    `SELECT * FROM coinpayments
          WHERE status = 0
          AND txn_id = ?`,
    {
      replacements: [txn_id],
      model: CoinPayments,
      mapToModel: true,
    }
  );
  if (invoice.length > 0) {
    invoice[0].status = 1;
    invoice[0].save();
    console.log(
      `Payment was successfull on txnId ${invoice[0].txn_id} and id ${invoice[0].id}`
    );
    console.log("invoice found", invoice[0]);

    const product = await getProduct(invoice[0].product_id);
    await increaseTokenForUser(invoice[0].user_id, product.tokens);
  } else {
    throw Error("Could not find invoice with payment");
  }
}

export async function increaseTokenForUser(userId, tokens) {
  console.log(`Increasing ${userId} with ${tokens} tokens`);
  const accounts = await sequelize.query(
    `
      UPDATE users 
      SET tokens = tokens + ?
      WHERE id = ?
      `,
    {
      replacements: [tokens, userId],
    }
  );
}
