from telethon import TelegramClient

import asyncio

async def main():
  async with TelegramClient("service.session", "19935835", "d0471073f3a2e46cdbb6387650032962"):
    profile = await UserBot.client.get_me()
    print(profile.id)

if __name__ == '__main__':
  asyncio.run(main())
