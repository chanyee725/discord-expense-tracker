import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import discord

sys.path.insert(0, str(Path(__file__).parent.parent))
from bot.ocr import extract_text
from bot.parser import parse_toss_transaction
from bot.categories import get_category
from bot.db import create_pool, insert_transaction

load_dotenv()

intents = discord.Intents.default()
intents.message_content = True
client = discord.Client(intents=intents)
db_pool = None


@client.event
async def on_ready():
    global db_pool
    db_pool = await create_pool()
    print(f"Bot logged in as {client.user}")
    print("Database pool created")


@client.event
async def on_message(message):
    if message.author == client.user:
        return
    
    if not message.attachments:
        return
    
    for attachment in message.attachments:
        if attachment.content_type and attachment.content_type.startswith('image/'):
            try:
                image_bytes = await attachment.read()
                text = extract_text(image_bytes)
                
                if not text:
                    await message.channel.send("No text found in image.")
                    continue
                
                parsed = parse_toss_transaction(text)
                
                if not parsed:
                    error_embed = discord.Embed(
                        title="❌ 파싱 실패",
                        description="거래 내역을 인식할 수 없습니다. 토스 영수증 이미지인지 확인해주세요.",
                        color=0xff0000
                    )
                    error_embed.add_field(name="OCR 텍스트", value=f"```\n{text[:500]}\n```", inline=False)
                    await message.channel.send(embed=error_embed)
                    continue
                
                category = get_category(parsed.get('merchant', ''))
                parsed['category'] = category
                
                await insert_transaction(db_pool, parsed)
                
                success_embed = discord.Embed(
                    title="💰 지출 내역",
                    color=0x00ff00
                )
                
                amount = parsed['amount']
                success_embed.add_field(
                    name="금액", 
                    value=f"{amount:,}원", 
                    inline=True
                )
                
                merchant = parsed.get('merchant') or "알 수 없음"
                success_embed.add_field(
                    name="상호명", 
                    value=merchant, 
                    inline=True
                )
                
                success_embed.add_field(
                    name="카테고리", 
                    value=category, 
                    inline=True
                )
                
                if parsed.get('transacted_at'):
                    success_embed.add_field(
                        name="일시", 
                        value=parsed['transacted_at'].strftime("%Y.%m.%d %H:%M"), 
                        inline=False
                    )
                
                await message.channel.send(embed=success_embed)
                    
            except Exception as e:
                error_embed = discord.Embed(
                    title="❌ 오류 발생",
                    description=f"처리 중 오류가 발생했습니다:\n```{str(e)}```",
                    color=0xff0000
                )
                await message.channel.send(embed=error_embed)


if __name__ == "__main__":
    token = os.getenv("DISCORD_BOT_TOKEN")
    if not token:
        raise ValueError("DISCORD_BOT_TOKEN not found in environment")
    client.run(token)
