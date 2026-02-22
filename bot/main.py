import os
import sys
import discord
import json

from pathlib import Path
from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).parent.parent))

from bot.expense_parser import ExpenseParser
from bot.db import create_pool, insert_transaction

load_dotenv()

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

@client.event
async def on_ready():
    global expense_parser, db_pool
    # .env 등에 저장된 API 키를 가져오거나 기본 설정 사용
    expense_parser = ExpenseParser()
    db_pool = await create_pool()
    print(f"Bot logged in as {client.user}")
    print(f"DB pool created")

@client.event
async def on_message(message):
    if message.author == client.user:
        return
    
    if not message.attachments:
        return
    
    for attachment in message.attachments:
        if attachment.content_type and attachment.content_type.startswith('image/'):
            async with message.channel.typing():
                try:
                    image_bytes = await attachment.read()
                    result = expense_parser.analyze(image_bytes)

                    # Skip DB insert if Gemini parsing failed
                    if 'error' not in result:
                        await insert_transaction(db_pool, result)

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