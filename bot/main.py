import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import discord

sys.path.insert(0, str(Path(__file__).parent.parent))
from bot.ocr import extract_text

load_dotenv()

intents = discord.Intents.default()
intents.message_content = True
client = discord.Client(intents=intents)


@client.event
async def on_ready():
    print(f"Bot logged in as {client.user}")


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
                
                if text:
                    await message.channel.send(f"```\n{text}\n```")
                else:
                    await message.channel.send("No text found in image.")
                    
            except Exception as e:
                await message.channel.send(f"Error processing image: {str(e)}")


if __name__ == "__main__":
    token = os.getenv("DISCORD_BOT_TOKEN")
    if not token:
        raise ValueError("DISCORD_BOT_TOKEN not found in environment")
    client.run(token)
