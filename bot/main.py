import os
import sys
import logging
import discord
import json
import aiohttp

from pathlib import Path
from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).parent.parent))

from bot.expense_parser import ExpenseParser
from db.db import create_pool, insert_transaction, check_duplicate_transaction

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("poor-guy-bot")

WEB_URL = os.getenv("WEB_URL", "http://host.docker.internal:3000")

# class ConfirmView(discord.ui.View):
#     def __init__(self, data):
#         super().__init__(timeout=2)
#         self.data = data

#     @discord.ui.button(label="확인 (O)", style=discord.ButtonStyle.success, emoji="✅")
#     async def confirm(self, interaction: discord.Interaction, button: discord.ui.Button):
#         # await insert_transaction(self.data) 
#         await interaction.response.edit_message(content="✅ 가계부에 기록되었습니다!", embed=None, view=None)
#         print(f"DB 저장 완료")

#     @discord.ui.button(label="취소 (X)", style=discord.ButtonStyle.danger, emoji="✖️")
#     async def cancel(self, interaction: discord.Interaction, button: discord.ui.Button):
#         await interaction.response.send_message("❌ 기록이 취소되었습니다.", ephemeral=True)

# --- 봇 설정 ---
intents = discord.Intents.default()
intents.message_content = True
client = discord.Client(intents=intents)

expense_parser = None
db_pool = None


async def notify_web_revalidate():
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{WEB_URL}/api/revalidate", timeout=aiohttp.ClientTimeout(total=5)
            ) as resp:
                if resp.status == 200:
                    logger.info("웹 revalidation 완료")
                else:
                    logger.warning("웹 revalidation 실패 — status=%d", resp.status)
    except Exception as e:
        logger.warning("웹 revalidation 요청 실패 — %s", e)

@client.event
async def on_ready():
    global expense_parser, db_pool
    db_pool = await create_pool()
    expense_parser = ExpenseParser(db_pool=db_pool)
    logger.info("Bot logged in as %s", client.user)
    logger.info("DB pool created")

@client.event
async def on_message(message):
    if message.author == client.user:
        return
    
    if not message.attachments:
        return
    
    for attachment in message.attachments:
        if attachment.content_type and attachment.content_type.startswith('image/'):
            logger.info(
                "이미지 수신 — user=%s, file=%s, size=%dKB",
                message.author, attachment.filename, attachment.size // 1024,
            )
            async with message.channel.typing():
                try:
                    image_bytes = await attachment.read()
                    result = await expense_parser.analyze(image_bytes)
                    logger.info("파싱 결과: %s", json.dumps(result, ensure_ascii=False, default=str))

                    if 'error' not in result:
                        is_duplicate = await check_duplicate_transaction(db_pool, result)
                        
                        if is_duplicate:
                            logger.warning(
                                "중복 거래 감지 — amount=%s, date=%s",
                                result.get('amount'), result.get('transaction_date'),
                            )
                            duplicate_embed = discord.Embed(
                                title="⚠️ 이미 업로드된 항목입니다",
                                description="동일한 날짜에 같은 거래 내역이 이미 존재합니다.",
                                color=0xffa500  # Orange color
                            )
                            
                            transaction_type = result.get('type', '미분류')
                            type_emoji = "💸" if transaction_type == "지출" else "💰"
                            
                            duplicate_embed.add_field(name="금액", value=f"{type_emoji} {result.get('amount', 0):,}원", inline=True)
                            duplicate_embed.add_field(name="카테고리", value=result.get('category') or "미분류", inline=True)
                            duplicate_embed.add_field(name="일시", value=result.get('transaction_date') or "정보 없음", inline=False)
                            
                            await message.reply(embed=duplicate_embed)
                            continue

                        await insert_transaction(db_pool, result)
                        logger.info(
                            "DB 저장 완료 — type=%s, amount=%s, category=%s",
                            result.get('type'), result.get('amount'), result.get('category'),
                        )
                        await notify_web_revalidate()

                    embed = discord.Embed(
                        title=f"{result.get('title', '지출 내역 확인')}",
                        description="━━━━━━━━━━━━━━━━━━━━━━━━",
                        color=0x5865F2 
                    )
                    
                    transaction_type = result.get('type', '미분류')
                    type_emoji = "💸" if transaction_type == "지출" else "💰"
                    
                    embed.add_field(name="금액", value=f"{type_emoji} {result.get('amount', 0):,}원", inline=True)
                    embed.add_field(name="유형", value=transaction_type, inline=True)
                    embed.add_field(name="카테고리", value=result.get('category') or "미분류", inline=True)
                    embed.add_field(name="일시", value=result.get('transaction_date') or "정보 없음", inline=False)
                    embed.add_field(name="출금처", value=result.get('withdrawal_source') or "정보 없음", inline=True)
                    embed.add_field(name="입금처", value=result.get('deposit_destination') or "정보 없음", inline=True)
                    
                    # view = ConfirmView(result)
                    await message.reply(embed=embed)  # , view=view)

                except Exception as e:
                    logger.error("처리 실패 — user=%s, error=%s", message.author, e, exc_info=True)
                    error_embed = discord.Embed(
                        title="❌ 분석 오류",
                        description=f"데이터를 읽는 중 오류가 발생했습니다:\n```{str(e)}```",
                        color=0xff0000
                    )
                    await message.reply(embed=error_embed)

if __name__ == "__main__":
    token = os.getenv("DISCORD_BOT_TOKEN")
    if not token:
        raise ValueError("DISCORD_BOT_TOKEN not found in environment")
    client.run(token)