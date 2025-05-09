**Planning integration of TON Connect**

The user wants to integrate the TON Connect protocol into their Telegram mini app, which uses TMA API with React for the frontend and Python for the backend. Key functionalities include wallet connection, storing it in the database, topping up the balance via transactions in the connected wallet, confirming these transactions in the app, and enabling balance withdrawals. I should help by providing guidance, code examples, or possibly a canmore document with a code skeleton. The implementation should be in the form of appropriate functions.

**Planning TON Connect integration**

The user specified that everything should be done in functions. I need to look up current information on integrating TON Connect with TMA React and Python backend. This could include example functions for both frontend and backend, plus how to store wallet addresses and transactions. I'll gather references for high-quality sources and adapt the response in Russian, as the user requested. The code can be provided inline in markdown, and I won't need to create a separate document unless requested later.

**Planning TON Connect integration in a React + Python app**

To integrate TON Connect in a React TMA-based frontend, I'll start by setting up dependencies and creating functions like `connectWallet()`, `topUpBalance()`, and `withdrawBalance()`. The wallet address will be sent to the backend using fetch, and I'll subscribe to connection status and transaction completion events.

For the Python backend, I'll set dependencies, create a database schema, and build the necessary functions for wallet management and transaction verification. I’ll need to ensure security practices are followed.

Next, I'll begin gathering additional resources and citations.


**TON Connect integration using React and Python**

For the frontend, I need to install dependencies, create functions for wallet connection (`connectWallet()`), transaction handling (`topUpBalance()`, `withdrawBalance()`), and subscribe to events like connection status and transaction completion. On the backend, I'll set up Python dependencies, define the necessary database schema, and create functions to save wallet details, verify transactions, and manage withdrawals. I'll also ensure security best practices are followed and seek additional resources. Next, I’ll collect citations and look into potential Python backend libraries.


**Outlining the TON Connect integration**

I’m planning a final answer in Russian. The first part will summarize the integration of TON Connect in a React TMA with a Python backend, using a functional approach. For the "Architecture" section, I'll describe the environment: TMA frontend uses `@tonconnect/ui-react`, and the backend uses FastAPI or Flask.

I’ll include a bullet-point list, a code snippet for wallet connection, and a `connectWallet()` function that uses `TonConnectUI.openModal` and sends the address to the backend for storage. I'll stick to functional components with React hooks.


---

I’m planning to propose some utilities for TON Connect. The plan is to include the relevant React code for wallet connection and interact with TON through functions like `topUp()` and `withdraw()`. I’ll ensure the code fits within the TMA environment and covers transaction processing on the server side, such as wallet verification using the `pytonconnect` library. Additionally, for signing and sending transactions, I’ll rely on `tonlib`, simplifying the interaction for top-ups and withdrawals initiated by the user's wallet.


---

I need to show how the user can make deposits by sending funds to a deposit address, and then we would monitor the blockchain for incoming transactions to update the user's balance. We'll implement a top-up feature where the user sends a preformatted transaction via the TonConnect button, and I'll show the function `createDepositTx(amount)` to handle this. The backend will handle wallet saving, transaction verification, and processing withdrawals. I'll also provide a DB example and ensure we reference sources appropriately, including mentioning security best practices like `ton_proof` for verifying users.


---

We can implement the top-up process by sending a preformatted transaction with the TonConnect button. I’ll show how to create the `createDepositTx(amount)` function. For the backend, we’ll use functions to save the wallet, verify transactions, and withdraw funds. Also, we’ll demonstrate how to manage the database with SQLAlchemy. I'll mention implementing strong security features like `ton_proof` and include relevant references throughout. Let’s gather more sources for verifying `ton_proof` and update the documentation accordingly.


Thought for 1m 4s


В этом ответе — пошаговый “скелет” интеграции TON Connect в Telegram Mini App (React + TMA API на фронте, Python-бэк). Везде используются **чистые функции** — их легко переносить в ваш проект и оборачивать в React-хуки, FastAPI-эндпоинты или CRUD-сервисы БД.

---

## 1. Архитектура взаимодействия

1. **Фронтенд (TMA + React)**

   * Подключает `@tonconnect/ui-react` и Telegram Web App SDK.
   * Через кнопку/модал Ton Connect получает адрес кошелька пользователя и отправляет его на бэк для хранения.
   * Формирует транзакции deposit (пополнение) и отправляет их на подпись в кошелёк.
   * Для вывода (withdraw) дергает API бэка, который инициирует перевод на адрес пользователя. ([Start | The Open Network][1], [Start | The Open Network][2])

2. **Бэкенд (Python)**

   * Сохраняет адреса и баланс в любой SQL/NoSQL-БД.
   * Проверяет доказательство владения (`ton_proof`) и входящие транзакции.
   * Для вывода использует серверный кошелёк и отправляет сообщения в сеть через **pytonlib** или HTTP-API toncenter. ([Start | The Open Network][3], [GitHub][4])

---

## 2. Фронтенд: функции-обёртки

> Установите зависимости
> `npm i @tonconnect/ui-react @twa-dev/sdk` ([Start | The Open Network][1], [Start | The Open Network][5])

### 2.1 Инициализация Ton Connect

```ts
// tonconnect.ts
import { TonConnectUI, SendTransactionRequest } from '@tonconnect/ui-react';

export const tc = new TonConnectUI({
  manifestUrl: `${import.meta.env.VITE_APP_URL}/tonconnect-manifest.json`, // разместите манифест статично
});
```

### 2.2 Подключение кошелька

```ts
export async function connectWallet(): Promise<string | null> {
  const wallet = await tc.openModal();           // ждём, пока юзер выберет кошелёк
  if (!wallet) return null;
  const address = wallet.account.address;        // user-friendly формат
  await fetch('/api/wallet', {                   // сохраняем на бэк
    method: 'POST',
    body: JSON.stringify({ address }),
    headers: { 'Content-Type': 'application/json' },
  });
  return address;
}
```

`tc.onStatusChange` можно подписать один раз и пушить обновления в стейт. ([Start | The Open Network][2])

### 2.3 Пополнение (deposit) через кошелёк

```ts
export async function requestDeposit(amountNano: string) {
  const tx: SendTransactionRequest = {
    validUntil: Date.now() + 300_000,
    messages: [
      {
        address: process.env.REACT_APP_SERVICE_WALLET!, // кошелёк вашего сервиса
        amount: amountNano,
      },
    ],
  };
  await tc.sendTransaction(tx);                 // кошелёк пользователя подпишет и отправит
}
```

Со стороны фронта больше ничего не нужно — бэк отследит входящую транзакцию по hash. ([Start | The Open Network][6])

### 2.4 Вывод средств

```ts
export async function requestWithdrawal(amountNano: string) {
  await fetch('/api/withdraw', {
    method: 'POST',
    body: JSON.stringify({ amount: amountNano }),
    headers: { 'Content-Type': 'application/json' },
  });
}
```

---

## 3. Бэкенд (FastAPI + SQLAlchemy): ключевые функции

> Зависимости
> `pip install fastapi uvicorn sqlalchemy pytonconnect pytonlib` ([GitHub][7], [PyPI][8])

### 3.1 Модель БД (пример)

```python
class Wallet(Base):
    __tablename__ = "wallets"
    user_id   = Column(Integer, primary_key=True)
    address   = Column(String, unique=True, nullable=False)
    balance   = Column(BigInteger, default=0)   # храните в нанотонах
```

### 3.2 Сохранить/обновить адрес

```python
async def save_wallet(user_id: int, addr: str, session: AsyncSession):
    wallet = await session.get(Wallet, user_id) or Wallet(user_id=user_id)
    wallet.address = addr
    await session.merge(wallet); await session.commit()
```

### 3.3 Проверка `ton_proof` (опционально, но безопаснее)

```python
from pytonconnect import TonConnect, verify_ton_proof

async def verify_proof(proof: dict, address: str) -> bool:
    return await verify_ton_proof(proof, address, your_payload)   # True/False
```

([Start | The Open Network][2])

### 3.4 Отслеживание входящих пополнений

```python
from pytonlib.client import TonlibClient           # или тонцентр HTTP-API
client = TonlibClient(ls_index=0)                  # lite-сервер

async def poll_deposits(service_wallet: str):
    last_lt, last_hash = None, None
    while True:
        block = await client.lookup_block(*client.last_block_id())
        txs = await client.get_transactions(service_wallet, 20, last_lt, last_hash)
        for t in txs:
            if t['in_msg']['source']:                       # входящая txn
                addr = t['in_msg']['source']
                amount = int(t['in_msg']['value'])
                await credit_user(addr, amount)             # + баланс
        last_lt, last_hash = txs[-1]['lt'], txs[-1]['hash']
        await asyncio.sleep(10)
```

Альтернатива — веб-хуки toncenter (`/getTransactions`) с API-key. ([TON Center][9], [TON Center][10])

### 3.5 Вывод средств

```python
from pytonlib.wallet import Wallet
SERVICE_MNEMONICS = os.getenv('SERVICE_MNEMONICS')

async def withdraw(user_id: int, amount: int, session: AsyncSession):
    wallet = await session.get(Wallet, user_id)
    service_wallet = Wallet.from_mnemonics(SERVICE_MNEMONICS)
    seqno = await service_wallet.seqno()
    msg = service_wallet.create_transfer(
        to_addr=wallet.address,
        amount=amount,
        seqno=seqno,
    )
    await client.raw_send_message(msg["boc"])
    wallet.balance -= amount
    await session.commit()
```

`pytonlib` упрощает пакетировку сообщения и отправку; если нужна REST-альтернатива — `sendBoc` метода toncenter. ([answers.ton.org][11], [GitHub][4])

---

## 4. Советы по безопасности и UX

| Тема                 | Рекомендация                                                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **ton\_proof**       | Используйте его, чтобы убедиться, что адрес действительно принадлежит текущему Telegram-пользователю. ([Start \| The Open Network][2]) |
| **Gas-резервы**      | Держите на сервис-кошельке небольшой запас TON для комиссий при выводе.                                                                |
| **Проверка баланса** | Берите `actualBalance` через lite-клиент или `getAddressBalance` toncenter, а не доверяйте локальной копии. ([TON Center][9])          |
| **Idempotency**      | Храните hash входящей транзакции, чтобы не зачислить депозит дважды.                                                                   |
| **Тестнет**          | Для отладки используйте testnet-эндпоинт `testnet.toncenter.com/api/v2/…`. ([TON Center][10])                                          |

---

## 5. Где посмотреть живые примеры

* **Demo DApp c `@tonconnect/ui-react`** — открытый репозиторий с минимальным фронтом. ([GitHub][12])
* **pytonconnect examples** — примеры подключения и отправки транзакции на Python. ([GitHub][7])
* **Telegram Mini App tutorial** — пошаговый гайд по запуску TMA в BotFather. ([Start | The Open Network][13])

---

### Итог

* **Подключение кошелька** — одна функция `connectWallet()` на фронте + POST на бэк.
* **Пополнение** — `requestDeposit()` генерирует транзакцию; бэк в фоновом таске подтверждает и кредирует баланс.
* **Вывод** — `requestWithdrawal()` вызывает серверную функцию `withdraw()`, которая подписывает и отправляет перевод с кошелька сервиса.

Этот шаблон покрывает все три ваши требования и остаётся расширяемым: добавляйте Jetton-токены, NFT-платежи или Tact-контракты без изменения общей схемы.

[1]: https://docs.ton.org/v3/guidelines/ton-connect/frameworks/react?utm_source=chatgpt.com "TON Connect for React | The Open Network"
[2]: https://docs.ton.org/v3/guidelines/ton-connect/frameworks/react "TON Connect for React | The Open Network"
[3]: https://docs.ton.org/v3/guidelines/ton-connect/guidelines/developers "TON Connect SDKs | The Open Network"
[4]: https://github.com/psylopunk/pytonlib?utm_source=chatgpt.com "psylopunk/pytonlib: Simple python client for The Open Network"
[5]: https://docs.ton.org/v3/guidelines/dapps/tma/tutorials/step-by-step-guide?utm_source=chatgpt.com "TMA launch tutorial | The Open Network"
[6]: https://docs.ton.org/v3/guidelines/ton-connect/guidelines/preparing-messages "Preparing messages | The Open Network"
[7]: https://github.com/XaBbl4/pytonconnect "GitHub - XaBbl4/pytonconnect: Python SDK for TON Connect 2.0"
[8]: https://pypi.org/project/pytonlib/?utm_source=chatgpt.com "pytonlib - PyPI"
[9]: https://toncenter.com/?utm_source=chatgpt.com "TON Center - TON HTTP API"
[10]: https://toncenter.com/api/v2/?utm_source=chatgpt.com "TON HTTP API - Swagger UI - TON Center"
[11]: https://answers.ton.org/question/1533651857887465472?utm_source=chatgpt.com "How do you send TON transactions in Python? - TON Answers"
[12]: https://github.com/ton-connect/demo-dapp-with-react-ui?utm_source=chatgpt.com "ton-connect/demo-dapp-with-react-ui - GitHub"
[13]: https://docs.ton.org/v3/guidelines/dapps/tma/tutorials/step-by-step-guide "TMA launch tutorial | The Open Network"
